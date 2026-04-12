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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CommentStatus } from './schemas/comment.schema';
import { UserRole } from '../users/schemas/user.schema';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(createCommentDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('article') articleId?: string,
    @Query('status') status = CommentStatus.APPROVED,
  ) {
    return this.commentsService.findAll(
      parseInt(page),
      parseInt(limit),
      articleId,
      status as CommentStatus,
    );
  }

  @Get('article/:articleId')
  findByArticle(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.commentsService.findByArticle(articleId, parseInt(page), parseInt(limit));
  }

  @Get('replies/:commentId')
  findReplies(@Param('commentId', ParseUUIDPipe) commentId: string) {
    return this.commentsService.findReplies(commentId);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  getPendingComments(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.commentsService.getPendingComments(parseInt(page), parseInt(limit));
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
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.update(id, updateCommentDto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    return this.commentsService.remove(id, req.user.userId, req.user.role);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  approve(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.commentsService.approveComment(id, req.user.userId);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.commentsService.rejectComment(id, req.user.userId, reason);
  }

  @Patch(':id/spam')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  markAsSpam(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.commentsService.markAsSpam(id, req.user.userId);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  report(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.commentsService.reportComment(id, req.user.userId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  like(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.incrementLikes(id);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  unlike(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.decrementLikes(id);
  }
}