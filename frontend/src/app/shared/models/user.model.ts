export enum UserRole {
  READER = 'reader',
  AUTHOR = 'author',
  MODERATOR = 'moderator',
  EDITOR = 'editor',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned'
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  specialties: string[];
  articlesCount: number;
  level: string;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role?: UserRole;
  bio?: string;
  specialties?: string[];
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}