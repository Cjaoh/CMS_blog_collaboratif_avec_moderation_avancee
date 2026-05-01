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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CommentStatus } from './schemas/comment.schema';
import { UserRole } from '../users/schemas/user.schema';
import { GetPagination } from '../common/decorators/pagination.decorator';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import type { PaginationQuery } from '../common/decorators/pagination.decorator';

@Controller('comments')
@UseInterceptors(ResponseInterceptor)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(createCommentDto, req.user.userId);
  }

  @Get()
  findAll(
    @GetPagination(10) pagination: PaginationQuery,
    @Query('status') status = CommentStatus.APPROVED,
    @Query('article') article?: string,
    @Query('author') author?: string,
  ) {
    return this.commentsService.findAll(
      pagination.page,
      pagination.limit,
      status as CommentStatus,
      article,
      author,
    );
  }

  @Get('article/:articleId')
  findByArticle(
    @Param('articleId', ParseObjectIdPipe) articleId: string,
    @GetPagination(10) pagination: PaginationQuery,
  ) {
    return this.commentsService.findByArticle(articleId, pagination.page, pagination.limit);
  }

  @Get('replies/:commentId')
  findReplies(@Param('commentId', ParseObjectIdPipe) commentId: string) {
    return this.commentsService.findReplies(commentId);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  getPendingComments(@GetPagination(10) pagination: PaginationQuery) {
    return this.commentsService.getPendingComments(pagination.page, pagination.limit);
  }

  @Get('reported')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  getReportedComments(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.commentsService.getReportedComments(parseInt(page), parseInt(limit));
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.update(id, updateCommentDto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @Request() req,
  ) {
    return this.commentsService.remove(id, req.user.userId, req.user.role);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  approve(@Param('id', ParseObjectIdPipe) id: string, @Request() req) {
    return this.commentsService.approveComment(id, req.user.userId);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  reject(
    @Param('id', ParseObjectIdPipe) id: string,
    @Request() req,
    @Body('reason') reason?: string,
  ) {
    return this.commentsService.rejectComment(id, req.user.userId, reason);
  }

  @Patch(':id/spam')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  markAsSpam(@Param('id', ParseObjectIdPipe) id: string, @Request() req) {
    return this.commentsService.markAsSpam(id, req.user.userId);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  report(@Param('id', ParseObjectIdPipe) id: string, @Request() req) {
    return this.commentsService.reportComment(id, req.user.userId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  like(@Param('id', ParseObjectIdPipe) id: string) {
    return this.commentsService.incrementLikes(id);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  unlike(@Param('id', ParseObjectIdPipe) id: string) {
    return this.commentsService.decrementLikes(id);
  }
}