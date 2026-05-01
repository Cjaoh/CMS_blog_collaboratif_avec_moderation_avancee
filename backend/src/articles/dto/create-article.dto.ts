import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsArray()
  categories?: string[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  featuredImage?: string;

  // Recipe-specific fields
  @IsOptional()
  @IsArray()
  ingredients?: { name: string; quantity: string; unit: string; }[];

  @IsOptional()
  @IsArray()
  steps?: string[];

  @IsOptional()
  cookingTimeMinutes?: number;

  @IsOptional()
  preparationTimeMinutes?: number;

  @IsOptional()
  servings?: number;
}
