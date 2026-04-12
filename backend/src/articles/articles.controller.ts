import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ArticleStatus } from './schemas/article.schema';
import { UserRole } from '../users/schemas/user.schema';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR, UserRole.EDITOR, UserRole.ADMIN)
  create(@Body() createArticleDto: CreateArticleDto, @Request() req) {
    return this.articlesService.create(createArticleDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status = ArticleStatus.PUBLISHED,
    @Query('category') category?: string,
    @Query('author') author?: string,
  ) {
    return this.articlesService.findAll(
      parseInt(page),
      parseInt(limit),
      status as ArticleStatus,
      category,
      author,
    );
  }

  @Get('search')
  search(
    @Query('q') query: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.articlesService.search(query, parseInt(page), parseInt(limit));
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  getPendingArticles(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.articlesService.getPendingArticles(parseInt(page), parseInt(limit));
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR, UserRole.EDITOR, UserRole.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Request() req,
  ) {
    return this.articlesService.update(id, updateArticleDto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR, UserRole.EDITOR, UserRole.ADMIN)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    return this.articlesService.remove(id, req.user.userId, req.user.role);
  }

  @Post(':id/views')
  incrementViews(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.incrementViews(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  like(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.incrementLikes(id);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  unlike(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.decrementLikes(id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  approve(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.articlesService.approveArticle(id, req.user.userId);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.articlesService.rejectArticle(id, req.user.userId, reason);
  }
}