export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string;
  children: string[];
  status: CategoryStatus;
  articlesCount: number;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parent?: string;
  status?: CategoryStatus;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}
