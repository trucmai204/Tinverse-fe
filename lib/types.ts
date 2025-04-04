export interface SearchFormData {
  keyword: string;
  categoryId?: number;
}

// Raw API response interface matching exact casing
export interface RawArticle {
  Id: number;
  Title: string;
  ThumbnailUrl: string;
  LastUpdatedTime: string;
  Category: string | { Id: number; Name: string };
  Author: string;
  Summary?: string;
}

export interface Article {
  id: number;
  title: string;
  thumbnailUrl: string;
  lastUpdatedTime: string;
  category: string | { id: number; name: string };
  author: string;
  summary?: string;
}

export interface SearchResponse {
  articles: Article[];
}

export interface ApiError {
  message: string;
}

export interface RawCategory {
  Id: number;
  Name: string;
  Description?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface RawArticleDetail {
  Title: string;
  Content: string;
  ThumbnailUrl: string;
  LastUpdatedTime: string;
  Category: string | { Id: number; Name: string };
  Author: string;
  AuthorId: number;
  CategoryId: number;
}

export interface ArticleDetail {
  title: string;
  content: string;
  thumbnailUrl: string;
  lastUpdatedTime: string;
  category: string | { id: number; name: string };
  author: string;
  authorId: number;
  categoryId: number;
}

// User Authentication Types
export interface RegisterUserDto {
  Name: string;
  Email: string;
  Password: string;
  Address?: string;
  PhoneNumber?: string;
}

export interface LoginDto {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  Id: number;
  Name: string;
  PhoneNumber: string;
  Role: {
    Id: number;
    Name: string;
  };
}

export interface User {
  id: number;
  name: string;
  phoneNumber: string;
  role: {
    id: number;
    name: string;
  };
}

export interface UpdateUserProfileDto {
  Name: string;
  PhoneNumber?: string;
}

export interface ChangePasswordDto {
  OldPassword: string;
  NewPassword: string;
}

// Comment Types
export interface AddCommentDto {
  ArticleId: number;
  Content: string;
}

export interface UpdateCommentDto {
  Content: string;
}

export interface CommentUser {
  id: number;
  name: string;
}

export interface Comment {
  id: number;
  content: string;
  lastModifiedTime: string;
  user: CommentUser;
}

export interface CommentResponse {
  id: number;
  content: string;
  postedTime?: string;
  editedTime?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

// Article Management Types
export interface CreateArticleDto {
  Title: string;
  Content: string;
  ThumbnailUrl: string;
  CategoryId: number;
}

export interface UpdateArticleDto {
  Title: string;
  Content: string;
  ThumbnailUrl: string;
  CategoryId: number;
}

// Bookmark Types
export interface BookmarkedArticle extends Article {
  isBookmarked: boolean;
}

export interface BookmarkedArticlesResponse extends PaginatedResponse<Article> {
  items: BookmarkedArticle[];
}
