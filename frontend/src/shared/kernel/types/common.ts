/**
 * Shared Kernel: Common Types
 * Types used across multiple features
 */
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from?: number;
  to?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

