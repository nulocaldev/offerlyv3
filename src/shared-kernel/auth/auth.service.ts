// Authentication service
// Handles user authentication and session management

import { supabase } from '@infrastructure/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { ApiResponse } from '@shared/types/common';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  status: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: 'regional_partner' | 'neighborhood_agent';
  profile_data: {
    display_name: string;
    mobile_number: string;
    location: any;
    social_handles: any;
  };
}

class AuthService {
  // ==========================================================================
  // AUTHENTICATION METHODS
  // ==========================================================================
  
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthUser>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed' };
      }

      // Get user profile with role information
      const profile = await this.getUserProfile(data.user.id);
      
      if (!profile.success || !profile.data) {
        return { success: false, error: 'Failed to load user profile' };
      }

      return {
        success: true,
        data: {
          id: data.user.id,
          email: data.user.email || '',
          role: profile.data.role,
          status: profile.data.status
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async register(registerData: RegisterData): Promise<ApiResponse<AuthUser>> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Registration failed' };
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: registerData.email,
          role: registerData.role,
          status: 'pending'
        });

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      // Create franchise profile
      const { error: franchiseError } = await supabase
        .from('franchise_profiles')
        .insert({
          id: authData.user.id,
          display_name: registerData.profile_data.display_name,
          mobile_number: registerData.profile_data.mobile_number,
          location: registerData.profile_data.location,
          social_handles: registerData.profile_data.social_handles
        });

      if (franchiseError) {
        return { success: false, error: franchiseError.message };
      }

      return {
        success: true,
        data: {
          id: authData.user.id,
          email: registerData.email,
          role: registerData.role,
          status: 'pending'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================
  
  async getCurrentSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          franchise_profiles (*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ==========================================================================
  // AUTHENTICATION STATE LISTENERS
  // ==========================================================================
  
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // ==========================================================================
  // ADMIN FUNCTIONS
  // ==========================================================================
  
  async createInactiveUser(userData: {
    email: string;
    password: string;
    role: string;
    status: string;
  }): Promise<ApiResponse<{ user_id: string }>> {
    try {
      // This would typically be handled by admin-only functions
      // For now, we'll use the regular signup process
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'User creation failed' };
      }

      return {
        success: true,
        data: { user_id: data.user.id }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      // This would require admin privileges in production
      // For now, we'll just mark as inactive
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const authService = new AuthService();
export default authService;
