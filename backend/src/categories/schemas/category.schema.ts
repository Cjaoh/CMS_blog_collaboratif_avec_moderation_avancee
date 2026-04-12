import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop()
  parent?: string; // Référence à une catégorie parente

  @Prop([String])
  children: string[]; // Références aux catégories enfants

  @Prop({ required: true, enum: CategoryStatus, default: CategoryStatus.ACTIVE })
  status: CategoryStatus;

  @Prop({ default: 0 })
  articlesCount: number;

  @Prop()
  metaTitle?: string;

  @Prop()
  metaDescription?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Index pour optimiser les recherches
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent: 1 });
CategorySchema.index({ status: 1 });
CategorySchema.index({ sortOrder: 1 });