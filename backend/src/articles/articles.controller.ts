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
  UseInterceptors,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ArticleStatus } from './schemas/article.schema';
import { UserRole } from '../users/schemas/user.schema';
import { ArticlePermissionGuard } from '../common/guards/article-permission.guard';
import { GetPagination } from '../common/decorators/pagination.decorator';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import type { PaginationQuery } from '../common/decorators/pagination.decorator';

@Controller('articles')
@UseInterceptors(ResponseInterceptor)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, ArticlePermissionGuard)
  @Roles(UserRole.AUTHOR, UserRole.EDITOR, UserRole.ADMIN)
  create(@Body() createArticleDto: CreateArticleDto, @Request() req) {
    return this.articlesService.create(createArticleDto, req.user.userId);
  }

  // === ENDPOINTS RECETTES ===

  @Post('recipes')
  @UseGuards(JwtAuthGuard, RolesGuard, ArticlePermissionGuard)
  @Roles(UserRole.AUTHOR, UserRole.EDITOR, UserRole.ADMIN)
  createRecipe(@Body() createRecipeDto: CreateRecipeDto, @Request() req) {
    return this.articlesService.createRecipe(createRecipeDto, req.user.userId);
  }

  @Get('recipes/search')
  searchRecipes(
    @Query('ingredients') ingredients?: string,
    @Query('maxCookingTime') maxCookingTime?: string,
    @Query('maxPrepTime') maxPrepTime?: string,
    @Query('servings') servings?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const ingredientsArray = ingredients ? ingredients.split(',').map(i => i.trim()) : undefined;
    return this.articlesService.searchRecipes(
      ingredientsArray,
      maxCookingTime ? parseInt(maxCookingTime) : undefined,
      maxPrepTime ? parseInt(maxPrepTime) : undefined,
      servings ? parseInt(servings) : undefined,
      parseInt(page),
      parseInt(limit)
    );
  }

  @Get('recipes/by-ingredients')
  getRecipesByIngredients(
    @Query('ingredients') ingredients: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const ingredientsArray = ingredients.split(',').map(i => i.trim());
    return this.articlesService.getRecipesByIngredients(ingredientsArray, parseInt(page), parseInt(limit));
  }

  @Get('recipes/by-cooking-time')
  getRecipesByCookingTime(
    @Query('maxMinutes') maxMinutes: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.articlesService.getRecipesByCookingTime(parseInt(maxMinutes), parseInt(page), parseInt(limit));
  }

  @Patch(':id/submit-for-review')
  @UseGuards(JwtAuthGuard, RolesGuard, ArticlePermissionGuard)
  @Roles(UserRole.AUTHOR, UserRole.EDITOR, UserRole.ADMIN)
  submitForReview(@Param('id', ParseObjectIdPipe) id: string, @Request() req) {
    return this.articlesService.submitForReview(id, req.user.userId);
  }

  // === ENDPOINTS EXISTANTS ===

  @Get()
  findAll(
    @GetPagination(10) pagination: PaginationQuery,
    @Query('status') status = ArticleStatus.PUBLISHED,
    @Query('category') category?: string,
    @Query('author') author?: string,
  ) {
    return this.articlesService.findAll(
      pagination.page,
      pagination.limit,
      status as ArticleStatus,
      category,
      author,
    );
  }

  @Get('featured')
  getFeaturedArticles() {
    return this.articlesService.getFeaturedArticles();
  }

  @Get('activity')
  getRecentActivity() {
    return this.articlesService.getRecentActivity();
  }

  @Get('moderation/stats')
  getModerationStats() {
    return this.articlesService.getModerationStats();
  }

  @Get('public/stats')
  getPublicStats() {
    return this.articlesService.getPublicStats();
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  getPendingArticles(@GetPagination(10) pagination: PaginationQuery) {
    return this.articlesService.getPendingArticles(pagination.page, pagination.limit);
  }

  @Get('search')
  search(
    @Query('q') query: string,
    @GetPagination(10) pagination: PaginationQuery,
  ) {
    return this.articlesService.search(query, pagination.page, pagination.limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.articlesService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, ArticlePermissionGuard)
  @Roles(UserRole.AUTHOR, UserRole.EDITOR, UserRole.ADMIN)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Request() req,
  ) {
    return this.articlesService.update(id, updateArticleDto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, ArticlePermissionGuard)
  @Roles(UserRole.AUTHOR, UserRole.EDITOR, UserRole.ADMIN)
  remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @Request() req,
  ) {
    return this.articlesService.remove(id, req.user.userId, req.user.role);
  }

  @Post(':id/views')
  incrementViews(@Param('id', ParseObjectIdPipe) id: string) {
    return this.articlesService.incrementViews(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  toggleLike(@Param('id', ParseObjectIdPipe) id: string, @Request() req) {
    return this.articlesService.toggleLike(id, req.user.userId);
  }


  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  approve(@Param('id', ParseObjectIdPipe) id: string, @Request() req) {
    return this.articlesService.approveArticle(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  reject(
    @Param('id', ParseObjectIdPipe) id: string,
    @Request() req,
    @Body('reason') reason?: string,
  ) {
    return this.articlesService.rejectArticle(id);
  }

}