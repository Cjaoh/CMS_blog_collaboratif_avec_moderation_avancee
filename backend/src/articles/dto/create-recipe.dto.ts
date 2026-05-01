import { IsString, IsArray, IsNumber, IsOptional, Min, Max, ArrayNotEmpty } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger'; // Commenté car non installé

export class IngredientDto {
  // @ApiProperty({ example: 'Farine' })
  @IsString()
  name: string;

  // @ApiProperty({ example: '200' })
  @IsString()
  quantity: string;

  // @ApiProperty({ example: 'g' })
  @IsString()
  unit: string;
}

export class CreateRecipeDto {
  // @ApiProperty({ example: 'Ratatouille traditionnelle provençale' })
  @IsString()
  title: string;

  // @ApiProperty({ example: 'ratatouille-traditionnelle-provencale' })
  @IsString()
  slug: string;

  // @ApiProperty({ example: 'Découvrez la recette authentique de la ratatouille...' })
  @IsString()
  excerpt: string;

  // @ApiProperty({ example: 'La ratatouille est un plat traditionnel...' })
  @IsString()
  content: string;

  // @ApiProperty({ type: [IngredientDto] })
  @IsArray()
  @ArrayNotEmpty()
  ingredients: IngredientDto[];

  // @ApiProperty({ example: ['1. Coupez tous les légumes en dés', '2. Faites revenir l\'oignon...'] })
  @IsArray()
  @ArrayNotEmpty()
  steps: string[];

  // @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(0)
  cookingTimeMinutes: number;

  // @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0)
  preparationTimeMinutes: number;

  // @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  @Max(20)
  servings: number;

  // @ApiProperty({ example: ['Plats principaux', 'Végétarien'] })
  @IsArray()
  @IsOptional()
  categories?: string[];

  // @ApiProperty({ example: ['légumes', 'méditerranéen', 'traditionnel'] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  // @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  featuredImage?: string;

  // @ApiProperty({ example: true })
  @IsOptional()
  allowComments?: boolean;
}
