export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SPAM = 'spam'
}

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  article: {
    _id: string;
    title: string;
    slug: string;
  };
  parent?: string;
  children: string[];
  status: CommentStatus;
  moderatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  moderationReason?: string;
  likesCount: number;
  reportsCount: number;
  reportedBy: string[];
  isEdited: boolean;
  editedAt?: string;
  isPinned: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  content: string;
  article: string;
  parent?: string;
}

export interface UpdateCommentDto {
  content?: string;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  pages: number;
}
