// SHARED KERNEL - Cross-Domain Types
// These are the minimal shared types that both domains need

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'regional_partner' | 'neighborhood_agent' | 'user';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface DatabaseResult<T> {
  data: T | null;
  error: Error | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface TimestampFields {
  created_at: string;
  updated_at: string;
}
