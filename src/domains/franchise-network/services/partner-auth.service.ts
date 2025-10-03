/**
 * Partner Authentication & Authorization Service
 * Handles partner login, profile verification, and access control
 */

import { supabase } from '../../../shared-kernel/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface PartnerProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type?: string;
  industry?: string;
  website_url?: string;
  logo_url?: string;
  description?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  phone?: string;
  contact_email?: string;
  tax_id?: string;
  business_registration_number?: string;
  is_verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  verification_notes?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerAuthState {
  user: User | null;
  profile: PartnerProfile | null;
  isPartner: boolean;
  isVerified: boolean;
  hasAccess: boolean;
  loading: boolean;
}

export class PartnerAuthService {
  private static instance: PartnerAuthService;
  private authState: PartnerAuthState = {
    user: null,
    profile: null,
    isPartner: false,
    isVerified: false,
    hasAccess: false,
    loading: true
  };

  static getInstance(): PartnerAuthService {
    if (!PartnerAuthService.instance) {
      PartnerAuthService.instance = new PartnerAuthService();
    }
    return PartnerAuthService.instance;
  }

  /**
   * Initialize the partner authentication state
   */
  async initialize(): Promise<PartnerAuthState> {
    try {
      this.authState.loading = true;
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        this.resetAuthState();
        return this.authState;
      }

      this.authState.user = user;

      // Get partner profile
      const profile = await this.getPartnerProfile(user.id);
      if (profile) {
        this.authState.profile = profile;
        this.authState.isPartner = true;
        this.authState.isVerified = profile.is_verified;
        this.authState.hasAccess = profile.verification_status === 'approved';
      }

      return this.authState;
    } catch (error) {
      console.error('Failed to initialize partner auth:', error);
      this.resetAuthState();
      return this.authState;
    } finally {
      this.authState.loading = false;
    }
  }

  /**
   * Get partner profile by user ID
   */
  async getPartnerProfile(userId: string): Promise<PartnerProfile | null> {
    try {
      const { data, error } = await supabase
        .from('partner_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user is not a partner
          return null;
        }
        throw error;
      }

      return data as PartnerProfile;
    } catch (error) {
      console.error('Failed to get partner profile:', error);
      return null;
    }
  }

  /**
   * Create a new partner profile
   */
  async createPartnerProfile(userId: string, profileData: Partial<PartnerProfile>): Promise<PartnerProfile> {
    try {
      const { data, error } = await supabase
        .from('partner_profiles')
        .insert({
          user_id: userId,
          business_name: profileData.business_name,
          business_type: profileData.business_type,
          industry: profileData.industry,
          website_url: profileData.website_url,
          description: profileData.description,
          address_line1: profileData.address_line1,
          address_line2: profileData.address_line2,
          city: profileData.city,
          state: profileData.state,
          postal_code: profileData.postal_code,
          country: profileData.country || 'US',
          phone: profileData.phone,
          contact_email: profileData.contact_email,
          tax_id: profileData.tax_id,
          business_registration_number: profileData.business_registration_number
        })
        .select()
        .single();

      if (error) throw error;

      // Update auth state
      this.authState.profile = data as PartnerProfile;
      this.authState.isPartner = true;

      return data as PartnerProfile;
    } catch (error) {
      console.error('Failed to create partner profile:', error);
      throw new Error('Failed to create partner profile');
    }
  }

  /**
   * Update partner profile
   */
  async updatePartnerProfile(userId: string, updates: Partial<PartnerProfile>): Promise<PartnerProfile> {
    try {
      const { data, error } = await supabase
        .from('partner_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Update auth state
      this.authState.profile = data as PartnerProfile;

      return data as PartnerProfile;
    } catch (error) {
      console.error('Failed to update partner profile:', error);
      throw new Error('Failed to update partner profile');
    }
  }

  /**
   * Complete partner onboarding
   */
  async completeOnboarding(userId: string): Promise<void> {
    try {
      await this.updatePartnerProfile(userId, {
        onboarding_completed: true
      });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw new Error('Failed to complete onboarding');
    }
  }

  /**
   * Check if current user has partner access
   */
  hasPartnerAccess(): boolean {
    return this.authState.hasAccess && this.authState.isVerified;
  }

  /**
   * Check if current user is a verified partner
   */
  isVerifiedPartner(): boolean {
    return this.authState.isPartner && this.authState.isVerified;
  }

  /**
   * Get current auth state
   */
  getAuthState(): PartnerAuthState {
    return { ...this.authState };
  }

  /**
   * Get partner analytics data
   */
  async getPartnerAnalytics(partnerId: string, dateRange?: { start: string; end: string }) {
    try {
      let query = supabase
        .from('partner_analytics')
        .select('*')
        .eq('partner_id', partnerId)
        .order('metric_date', { ascending: false });

      if (dateRange) {
        query = query
          .gte('metric_date', dateRange.start)
          .lte('metric_date', dateRange.end);
      } else {
        // Default to last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('metric_date', thirtyDaysAgo.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get partner analytics:', error);
      throw new Error('Failed to load analytics data');
    }
  }

  /**
   * Get partner campaign stats
   */
  async getPartnerCampaignStats(partnerId: string) {
    try {
      const { data, error } = await supabase
        .from('partner_campaign_stats')
        .select(`
          *,
          campaigns:campaign_id (
            id,
            name,
            status,
            type,
            created_at
          )
        `)
        .eq('partner_id', partnerId)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get campaign stats:', error);
      throw new Error('Failed to load campaign statistics');
    }
  }

  /**
   * Reset authentication state
   */
  private resetAuthState(): void {
    this.authState = {
      user: null,
      profile: null,
      isPartner: false,
      isVerified: false,
      hasAccess: false,
      loading: false
    };
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChange(callback: (state: PartnerAuthState) => void) {
    // Set up Supabase auth listener
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.initialize();
      } else if (event === 'SIGNED_OUT') {
        this.resetAuthState();
      }
      callback(this.getAuthState());
    });
  }

  /**
   * Sign out partner
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      this.resetAuthState();
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw new Error('Failed to sign out');
    }
  }
}

export const partnerAuthService = PartnerAuthService.getInstance();