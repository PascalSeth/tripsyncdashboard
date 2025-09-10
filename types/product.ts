// Product-related type definitions based on API documentation

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  subcategoryId?: string;
  image?: string;
  images?: string[];
  inStock: boolean;
  stockQuantity: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  category?: ProductCategory;
  subcategory?: ProductSubcategory;
  store?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subcategory {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}

export interface ProductSubcategory {
  id: string;
  name: string;
  category: ProductCategory;
}

export interface ProductCreateRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  subcategoryId?: string;
  stockQuantity?: number;
  inStock?: boolean;
  images?: File[];
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  subcategoryId?: string;
  stockQuantity?: number;
  inStock?: boolean;
  images?: File[];
}

export interface InventoryUpdateRequest {
  stockQuantity: number;
  operation: "set" | "add" | "subtract";
  userId?: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}