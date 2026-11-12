export * from '../constants.js';
export * from '../impact.js';
export * from '../schemas/auth.js';
export * from '../schemas/waste.js';
export * from '../schemas/ideas.js';
export * from '../schemas/scan.js';
export * from '../schemas/make.js';
export * from '../schemas/impact.js';
export * from '../schemas/product.js';
export * from '../schemas/admin.js';

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}
