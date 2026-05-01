import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum CommentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SPAM = 'SPAM'
}

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  author: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Article' })
  article: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  parent?: Types.ObjectId;

  @Prop({ required: true, enum: CommentStatus, default: CommentStatus.PENDING })
  status: CommentStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  moderatedBy?: Types.ObjectId;

  @Prop()
  moderationReason?: string;

  @Prop({ default: Date })
  moderatedAt?: Date;

  @Prop({ type: [Types.ObjectId], default: [] })
  reportedBy?: Types.ObjectId[];

  @Prop({ default: 0 })
  reportsCount?: number;

  @Prop({ default: 0 })
  likesCount?: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
export type CommentDocument = HydratedDocument<Comment>;

// Index pour optimiser les recherches
CommentSchema.index({ article: 1, status: 1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ parent: 1 });
CommentSchema.index({ status: 1 });
CommentSchema.index({ createdAt: -1 });
