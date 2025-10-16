export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  tokenType: string;
}

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  parent?: {
    id: number;
    name: string;
  } | null;
  children?: Array<{
    id: number;
    name: string;
    parentId: number;
  }>;
  recursiveProductCount?: number;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number | string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
    parentId: number | null;
    parent?: {
      id: number;
      name: string;
    } | null;
  };
}

export interface CreateCategoryDto {
  name: string;
  parentId?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  parentId?: number | null;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  categoryId: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: number;
}

export interface ApiError {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  error: string;
  message: string;
  validationErrors?: Record<string, string[]>;
}
