// Supabase client configuration
// This is the connection point between our domain-separated architecture and Supabase

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../shared-kernel/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  // Map common Supabase errors to user-friendly messages
  const errorMappings: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password',
    'User already registered': 'An account with this email already exists',
    'Email not confirmed': 'Please check your email and confirm your account',
    'PGRST116': 'Record not found',
    'PGRST301': 'Row Level Security policy violation'
  };
  
  const message = errorMappings[error.message] || error.message || 'An unexpected error occurred';
  
  return {
    success: false,
    error: message,
    code: error.code
  };
};

// Helper function for consistent API responses
export const createApiResponse = <T>(
  data: T | null, 
  error: any = null
): { success: boolean; data?: T; error?: string } => {
  if (error) {
    return handleSupabaseError(error);
  }
  
  return {
    success: true,
    data: data || undefined
  };
};

export default supabase;
