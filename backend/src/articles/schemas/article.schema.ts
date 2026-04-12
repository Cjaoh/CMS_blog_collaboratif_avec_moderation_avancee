import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ArticleStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

export enum ArticleFeatureStatus {
  NONE = 'none',
  FEATURED = 'featured',
  TRENDING = 'trending'
}

@Schema({ timestamps: true })
export class Article extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  excerpt: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: String, ref: 'User' })
  author: string;

  @Prop({ type: String, ref: 'User' })
  editor?: string; // Éditeur qui a approuvé/modifié

  @Prop([String])
  categories: string[]; // Références aux catégories

  @Prop([String])
  tags: string[];

  @Prop({ required: true, enum: ArticleStatus, default: ArticleStatus.DRAFT })
  status: ArticleStatus;

  @Prop({ enum: ArticleFeatureStatus, default: ArticleFeatureStatus.NONE })
  featureStatus: ArticleFeatureStatus;

  @Prop({ default: 0 })
  viewsCount: number;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop([String])
  images: string[];

  @Prop()
  featuredImage?: string;

  @Prop()
  metaTitle?: string;

  @Prop()
  metaDescription?: string;

  @Prop([String])
  metaKeywords?: string[];

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: String })
  rejectionReason?: string;

  @Prop({ default: false })
  allowComments: boolean;

  @Prop({ default: false })
  isPinned: boolean;

  @Prop({ type: Date })
  scheduledFor?: Date;

  // SEO et recherche
  @Prop({ default: 0 })
  readTimeMinutes: number;

  @Prop({ default: '' })
  searchVector: string; // Pour full-text search
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

// Index pour optimiser les performances
ArticleSchema.index({ slug: 1 }, { unique: true });
ArticleSchema.index({ author: 1 });
ArticleSchema.index({ status: 1 });
ArticleSchema.index({ categories: 1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ publishedAt: -1 });
ArticleSchema.index({ viewsCount: -1 });
ArticleSchema.index({ featureStatus: 1 });
ArticleSchema.index({ searchVector: 'text' }); // Full-text search
ArticleSchema.index({ scheduledFor: 1 });
