import { IsString, IsOptional, IsUUID } from 'class-validator';
import { MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  content: string;

  @IsUUID()
  article: string;

  @IsOptional()
  @IsUUID()
  parent?: string;
}
