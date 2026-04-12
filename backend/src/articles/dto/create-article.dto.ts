import { IsString, IsOptional, IsEnum, IsArray, MinLength, MaxLength } from 'class-validator';
import { ArticleStatus, ArticleFeatureStatus } from '../schemas/article.schema';

export class CreateArticleDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  excerpt: string;

  @IsString()
  @MinLength(50)
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @IsEnum(ArticleFeatureStatus)
  featureStatus?: ArticleFeatureStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @IsOptional()
  @IsEnum(ArticleStatus)
  scheduledStatus?: ArticleStatus;

  @IsOptional()
  @IsString()
  scheduledFor?: string;

  @IsOptional()
  allowComments?: boolean = true;

  @IsOptional()
  isPinned?: boolean = false;
}
