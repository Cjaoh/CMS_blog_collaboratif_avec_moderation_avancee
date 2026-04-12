import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentStatus } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(@InjectModel('Comment') private commentModel: Model<Comment>) {}

  async create(createCommentDto: CreateCommentDto, authorId: string): Promise<Comment> {
    const comment = new this.commentModel({
      ...createCommentDto,
      author: authorId,
    });

    const savedComment = await comment.save();

    // Incrémenter le compteur de commentaires de l'article
    // Note: Ceci nécessite d'injecter ArticlesService ou d'utiliser un événement

    // Si c'est une réponse, l'ajouter aux enfants du parent
    if (createCommentDto.parent) {
      await this.commentModel.findByIdAndUpdate(
        createCommentDto.parent,
        { $push: { children: savedComment._id } }
      );
    }

    return savedComment;
  }

  async findAll(
    page = 1,
    limit = 10,
    articleId?: string,
    status = CommentStatus.APPROVED,
  ): Promise<{ comments: Comment[]; total: number; pages: number }> {
    const query: any = { status };
    
    if (articleId) {
      query.article = articleId;
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.commentModel
        .find(query)
        .populate('author', 'firstName lastName avatar')
        .populate('article', 'title slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.commentModel.countDocuments(query),
    ]);

    return {
      comments,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findByArticle(
    articleId: string,
    page = 1,
    limit = 10,
  ): Promise<{ comments: Comment[]; total: number; pages: number }> {
    return this.findAll(page, limit, articleId);
  }

  async findReplies(commentId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ parent: commentId, status: CommentStatus.APPROVED })
      .populate('author', 'firstName lastName avatar')
      .sort({ createdAt: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentModel
      .findById(id)
      .populate('author', 'firstName lastName avatar email')
      .populate('article', 'title slug')
      .populate('parent', 'content author')
      .populate('moderatedBy', 'firstName lastName')
      .exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
    userRole: string,
  ): Promise<Comment> {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Vérifier les permissions
    this.checkUpdatePermission(comment, userId, userRole);

    const updatedComment = await this.commentModel
      .findByIdAndUpdate(
        id,
        { 
          ...updateCommentDto, 
          isEdited: true, 
          editedAt: new Date() 
        },
        { new: true },
      )
      .populate('author', 'firstName lastName avatar')
      .exec();

    if (!updatedComment) {
      throw new NotFoundException('Comment not found');
    }

    return updatedComment;
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Vérifier les permissions
    this.checkDeletePermission(comment, userId, userRole);

    // Si c'est un commentaire parent, vérifier qu'il n'a pas de réponses
    if (comment.children && comment.children.length > 0) {
      throw new ForbiddenException('Cannot delete comment with replies');
    }

    // Retirer des enfants du parent si nécessaire
    if (comment.parent) {
      await this.commentModel.findByIdAndUpdate(
        comment.parent,
        { $pull: { children: id } }
      );
    }

    await this.commentModel.findByIdAndDelete(id);
  }

  async approveComment(id: string, moderatorId: string): Promise<Comment> {
    const comment = await this.commentModel.findByIdAndUpdate(
      id,
      {
        status: CommentStatus.APPROVED,
        moderatedBy: moderatorId,
        moderationReason: undefined,
      },
      { new: true },
    );
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async rejectComment(id: string, moderatorId: string, reason: string): Promise<Comment> {
    const comment = await this.commentModel.findByIdAndUpdate(
      id,
      {
        status: CommentStatus.REJECTED,
        moderatedBy: moderatorId,
        moderationReason: reason,
      },
      { new: true },
    );
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async markAsSpam(id: string, moderatorId: string): Promise<Comment> {
    const comment = await this.commentModel.findByIdAndUpdate(
      id,
      {
        status: CommentStatus.SPAM,
        moderatedBy: moderatorId,
        moderationReason: 'Marked as spam',
      },
      { new: true },
    );
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async reportComment(id: string, userId: string): Promise<Comment> {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Vérifier si l'utilisateur a déjà signalé ce commentaire
    if (comment.reportedBy?.includes(userId)) {
      throw new ForbiddenException('You have already reported this comment');
    }

    const updatedComment = await this.commentModel.findByIdAndUpdate(
      id,
      {
        $push: { reportedBy: userId },
        $inc: { reportsCount: 1 },
      },
      { new: true },
    );
    
    if (!updatedComment) {
      throw new NotFoundException('Comment not found');
    }
    
    return updatedComment;
  }

  async incrementLikes(id: string): Promise<void> {
    await this.commentModel.findByIdAndUpdate(id, { $inc: { likesCount: 1 } });
  }

  async decrementLikes(id: string): Promise<void> {
    await this.commentModel.findByIdAndUpdate(id, { $inc: { likesCount: -1 } });
  }

  async getPendingComments(page = 1, limit = 10): Promise<{ comments: Comment[]; total: number; pages: number }> {
    return this.findAll(page, limit, undefined, CommentStatus.PENDING);
  }

  async getReportedComments(page = 1, limit = 10): Promise<{ comments: Comment[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const query = { reportsCount: { $gt: 0 } };

    const [comments, total] = await Promise.all([
      this.commentModel
        .find(query)
        .populate('author', 'firstName lastName avatar')
        .populate('article', 'title slug')
        .sort({ reportsCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.commentModel.countDocuments(query),
    ]);

    return {
      comments,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  private checkUpdatePermission(comment: Comment, userId: string, userRole: string): void {
    const isAdmin = userRole === 'admin';
    const isEditor = userRole === 'editor';
    const isAuthor = comment.author.toString() === userId;

    if (!isAdmin && !isEditor && !isAuthor) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    if (isAuthor && comment.status !== CommentStatus.APPROVED) {
      throw new ForbiddenException('You can only edit approved comments');
    }
  }

  private checkDeletePermission(comment: Comment, userId: string, userRole: string): void {
    const isAdmin = userRole === 'admin';
    const isEditor = userRole === 'editor';
    const isAuthor = comment.author.toString() === userId;

    if (!isAdmin && !isEditor && !isAuthor) {
      throw new ForbiddenException('You can only delete your own comments');
    }
  }
}
