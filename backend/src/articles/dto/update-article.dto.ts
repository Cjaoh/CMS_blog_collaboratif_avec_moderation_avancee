import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum } from 'class-validator';
import { CreateArticleDto } from './create-article.dto';
import { ArticleStatus } from '../schemas/article.schema';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;
}