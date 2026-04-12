import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SPAM = 'spam'
}

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: String, ref: 'User' })
  author: string;

  @Prop({ required: true, type: String, ref: 'Article' })
  article: string;

  @Prop({ type: String, ref: 'Comment' })
  parent?: string; // Pour les réponses imbriquées

  @Prop([String])
  children: string[]; // Références aux réponses

  @Prop({ required: true, enum: CommentStatus, default: CommentStatus.PENDING })
  status: CommentStatus;

  @Prop({ type: String, ref: 'User' })
  moderatedBy?: string; // Éditeur qui a modéré le commentaire

  @Prop()
  moderationReason?: string;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  reportsCount: number;

  @Prop([String])
  reportedBy: string[]; // Utilisateurs ayant signalé le commentaire

  @Prop({ default: false })
  isEdited: boolean;

  @Prop({ type: Date })
  editedAt?: Date;

  @Prop({ default: false })
  isPinned: boolean;

  // Informations pour l'analyse de spam
  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Index pour optimiser les recherches
CommentSchema.index({ article: 1, status: 1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ parent: 1 });
CommentSchema.index({ status: 1 });
CommentSchema.index({ createdAt: -1 });
CommentSchema.index({ reportsCount: -1 });
