import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleStatus, ArticleFeatureStatus } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { slugify } from '../shared/utils/slug.util';

@Injectable()
export class ArticlesService {
  constructor(@InjectModel('Article') private articleModel: Model<Article>) {}

  async create(createArticleDto: CreateArticleDto, authorId: string): Promise<Article> {
    const slug = await this.generateUniqueSlug(createArticleDto.title);
    
    const article = new this.articleModel({
      ...createArticleDto,
      slug,
      author: authorId,
      searchVector: this.generateSearchVector(createArticleDto.title, createArticleDto.excerpt, createArticleDto.content),
    });

    const savedArticle = await article.save();
    
    // Incrémenter le compteur d'articles de l'auteur
    // Note: Ceci nécessite d'injecter UsersService ou d'utiliser un événement
    
    return savedArticle;
  }

  async findAll(
    page = 1,
    limit = 10,
    status = ArticleStatus.PUBLISHED,
    category?: string,
    author?: string,
  ): Promise<{ articles: Article[]; total: number; pages: number }> {
    const query: any = { status };
    
    if (category) {
      query.categories = { $in: [category] };
    }
    
    if (author) {
      query.author = author;
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      this.articleModel
        .find(query)
        .populate('author', 'firstName lastName avatar')
        .populate('categories', 'name slug')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.articleModel.countDocuments(query),
    ]);

    return {
      articles,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleModel
      .findById(id)
      .populate('author', 'firstName lastName avatar bio')
      .populate('editor', 'firstName lastName')
      .populate('categories', 'name slug description')
      .exec();

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articleModel
      .findOne({ slug })
      .populate('author', 'firstName lastName avatar bio')
      .populate('editor', 'firstName lastName')
      .populate('categories', 'name slug description')
      .exec();

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto, userId: string, userRole: string): Promise<Article> {
    const article = await this.articleModel.findById(id);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Vérifier les permissions
    this.checkUpdatePermission(article, userId, userRole);

    const updateData: any = { ...updateArticleDto };

    if (updateArticleDto.title) {
      updateData.slug = await this.generateUniqueSlug(updateArticleDto.title, id);
    }

    if (updateArticleDto.title || updateArticleDto.excerpt || updateArticleDto.content) {
      const current = article.toObject();
      updateData.searchVector = this.generateSearchVector(
        updateArticleDto.title || current.title,
        updateArticleDto.excerpt || current.excerpt,
        updateArticleDto.content || current.content,
      );
    }

    const updatedArticle = await this.articleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('author', 'firstName lastName avatar')
      .populate('categories', 'name slug')
      .exec();

    if (!updatedArticle) {
      throw new NotFoundException('Article not found');
    }

    return updatedArticle;
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const article = await this.articleModel.findById(id);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Vérifier les permissions
    this.checkDeletePermission(article, userId, userRole);

    await this.articleModel.findByIdAndDelete(id);
  }

  async incrementViews(id: string): Promise<void> {
    await this.articleModel.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });
  }

  async incrementLikes(id: string): Promise<void> {
    await this.articleModel.findByIdAndUpdate(id, { $inc: { likesCount: 1 } });
  }

  async decrementLikes(id: string): Promise<void> {
    await this.articleModel.findByIdAndUpdate(id, { $inc: { likesCount: -1 } });
  }

  async search(query: string, page = 1, limit = 10): Promise<{ articles: Article[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const searchQuery = {
      $text: { $search: query },
      status: ArticleStatus.PUBLISHED,
    };

    const [articles, total] = await Promise.all([
      this.articleModel
        .find(searchQuery, { score: { $meta: 'textScore' } })
        .populate('author', 'firstName lastName avatar')
        .populate('categories', 'name slug')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.articleModel.countDocuments(searchQuery),
    ]);

    return {
      articles,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getPendingArticles(page = 1, limit = 10): Promise<{ articles: Article[]; total: number; pages: number }> {
    return this.findAll(page, limit, ArticleStatus.PENDING);
  }

  async approveArticle(id: string, editorId: string): Promise<Article> {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      {
        status: ArticleStatus.PUBLISHED,
        editor: editorId,
        publishedAt: new Date(),
        rejectionReason: undefined,
      },
      { new: true },
    );
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async rejectArticle(id: string, editorId: string, reason: string): Promise<Article> {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      {
        status: ArticleStatus.REJECTED,
        editor: editorId,
        rejectionReason: reason,
      },
      { new: true },
    );
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    let slug = slugify(title);
    let counter = 1;
    let originalSlug = slug;

    while (true) {
      const query: any = { slug };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const existing = await this.articleModel.findOne(query);
      if (!existing) {
        return slug;
      }

      slug = `${originalSlug}-${counter}`;
      counter++;
    }
  }

  private generateSearchVector(title: string, excerpt: string, content: string): string {
    return `${title} ${excerpt} ${content}`.toLowerCase();
  }

  private checkUpdatePermission(article: Article, userId: string, userRole: string): void {
    const isAdmin = userRole === 'admin';
    const isEditor = userRole === 'editor';
    const isAuthor = article.author.toString() === userId;

    if (!isAdmin && !isEditor && !isAuthor) {
      throw new ForbiddenException('You can only edit your own articles');
    }

    if (isAuthor && article.status !== ArticleStatus.DRAFT) {
      throw new ForbiddenException('You can only edit your draft articles');
    }
  }

  private checkDeletePermission(article: Article, userId: string, userRole: string): void {
    const isAdmin = userRole === 'admin';
    const isAuthor = article.author.toString() === userId;

    if (!isAdmin && !isAuthor) {
      throw new ForbiddenException('You can only delete your own articles');
    }
  }
}