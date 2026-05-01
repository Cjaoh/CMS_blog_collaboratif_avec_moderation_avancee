import { IsString, IsOptional, IsMongoId } from 'class-validator';
import { MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  content: string;

  @IsMongoId()
  article: string;

  @IsOptional()
  @IsMongoId()
  parent?: string;
}
