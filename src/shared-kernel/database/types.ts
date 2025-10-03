// Supabase database types
// This file should be generated using: supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public
// For now, we'll define the core types manually

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          role: 'admin' | 'regional_partner' | 'neighborhood_agent' | 'user';
          status: 'active' | 'inactive' | 'pending' | 'suspended';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          role?: 'admin' | 'regional_partner' | 'neighborhood_agent' | 'user';
          status?: 'active' | 'inactive' | 'pending' | 'suspended';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          role?: 'admin' | 'regional_partner' | 'neighborhood_agent' | 'user';
          status?: 'active' | 'inactive' | 'pending' | 'suspended';
          created_at?: string;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          business_name: string;
          description: string | null;
          status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
          type: 'scratch_win' | 'social_contest' | 'loyalty_program' | 'quiz_game';
          agent_id: string;
          tool_config: any;
          rules: any;
          views: number;
          interactions: number;
          conversion_rate: number;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          business_name: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
          type: 'scratch_win' | 'social_contest' | 'loyalty_program' | 'quiz_game';
          agent_id: string;
          tool_config?: any;
          rules?: any;
          views?: number;
          interactions?: number;
          conversion_rate?: number;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          business_name?: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
          type?: 'scratch_win' | 'social_contest' | 'loyalty_program' | 'quiz_game';
          agent_id?: string;
          tool_config?: any;
          rules?: any;
          views?: number;
          interactions?: number;
          conversion_rate?: number;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      gem_balances: {
        Row: {
          id: string;
          user_id: string;
          total_gems: number;
          allocated_gems: number;
          purchased_gems: number;
          commission_gems: number;
          last_updated: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_gems?: number;
          allocated_gems?: number;
          purchased_gems?: number;
          commission_gems?: number;
          last_updated?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_gems?: number;
          allocated_gems?: number;
          purchased_gems?: number;
          commission_gems?: number;
          last_updated?: string;
        };
      };
      gem_transactions: {
        Row: {
          id: string;
          sender_id: string | null;
          recipient_id: string | null;
          amount: number;
          transaction_type: string;
          status: 'pending' | 'completed' | 'failed' | 'cancelled';
          reason: string;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_id?: string | null;
          recipient_id?: string | null;
          amount: number;
          transaction_type: string;
          status?: 'pending' | 'completed' | 'failed' | 'cancelled';
          reason: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string | null;
          recipient_id?: string | null;
          amount?: number;
          transaction_type?: string;
          status?: 'pending' | 'completed' | 'failed' | 'cancelled';
          reason?: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      agent_applications: {
        Row: {
          id: string;
          applicant_id: string;
          role_applied_for: 'regional_partner' | 'neighborhood_agent';
          personal_info: any;
          experience_info: any;
          business_plan: any;
          referral_code: string | null;
          referral_agent_id: string | null;
          required_gem_cost: number;
          priority_level: number;
          review_deadline: string;
          status: string;
          application_score: number | null;
          updated_at: string;
          interview_scheduled: string | null;
          interview_completed: boolean | null;
          interview_notes: string | null;
          completed_at: string | null;
          notes: string | null;
          reviewer_id: string | null;
          review_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          applicant_id: string;
          role_applied_for: 'regional_partner' | 'neighborhood_agent';
          personal_info: any;
          experience_info?: any;
          business_plan?: any;
          referral_code?: string | null;
          referral_agent_id?: string | null;
          required_gem_cost?: number;
          priority_level?: number;
          review_deadline?: string;
          status?: string;
          application_score?: number | null;
          updated_at?: string;
          interview_scheduled?: string | null;
          interview_completed?: boolean | null;
          interview_notes?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          reviewer_id?: string | null;
          review_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          applicant_id?: string;
          role_applied_for?: 'regional_partner' | 'neighborhood_agent';
          personal_info?: any;
          experience_info?: any;
          business_plan?: any;
          referral_code?: string | null;
          referral_agent_id?: string | null;
          required_gem_cost?: number;
          priority_level?: number;
          review_deadline?: string;
          status?: string;
          application_score?: number | null;
          updated_at?: string;
          interview_scheduled?: string | null;
          interview_completed?: boolean | null;
          interview_notes?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          reviewer_id?: string | null;
          review_notes?: string | null;
          created_at?: string;
        };
      };
      agent_application_history: {
        Row: {
          id: string;
          application_id: string;
          previous_status: string | null;
          new_status: string | null;
          changed_by: string | null;
          change_reason: string | null;
          additional_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          previous_status?: string | null;
          new_status?: string | null;
          changed_by?: string | null;
          change_reason?: string | null;
          additional_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          previous_status?: string | null;
          new_status?: string | null;
          changed_by?: string | null;
          change_reason?: string | null;
          additional_notes?: string | null;
          created_at?: string;
        };
      };
      agent_application_notifications: {
        Row: {
          id: string;
          application_id: string;
          recipient_id: string;
          notification_type: string;
          title: string;
          message: string;
          sent_via_email: boolean;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          recipient_id: string;
          notification_type: string;
          title: string;
          message: string;
          sent_via_email?: boolean;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          recipient_id?: string;
          notification_type?: string;
          title?: string;
          message?: string;
          sent_via_email?: boolean;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
      };
      agent_application_assignments: {
        Row: {
          id: string;
          application_id: string;
          assigned_to: string;
          assignment_type: 'primary_reviewer' | 'secondary_reviewer' | 'interviewer' | 'decision_maker';
          due_date: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          assigned_to: string;
          assignment_type: 'primary_reviewer' | 'secondary_reviewer' | 'interviewer' | 'decision_maker';
          due_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          assigned_to?: string;
          assignment_type?: 'primary_reviewer' | 'secondary_reviewer' | 'interviewer' | 'decision_maker';
          due_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      franchise_profiles: {
        Row: {
          id: string;
          display_name: string;
          mobile_number: string;
          location: any;
          social_handles: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          mobile_number: string;
          location: any;
          social_handles: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          mobile_number?: string;
          location?: any;
          social_handles?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      partner_profiles: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          business_type: string;
          industry: string;
          website_url: string | null;
          description: string | null;
          logo_url: string | null;
          address: string | null;
          phone: string | null;
          contact_email: string | null;
          business_registration_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          business_type: string;
          industry: string;
          website_url?: string | null;
          description?: string | null;
          logo_url?: string | null;
          address?: string | null;
          phone?: string | null;
          contact_email?: string | null;
          business_registration_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          business_type?: string;
          industry?: string;
          website_url?: string | null;
          description?: string | null;
          logo_url?: string | null;
          address?: string | null;
          phone?: string | null;
          contact_email?: string | null;
          business_registration_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customer_interactions: {
        Row: {
          id: string;
          campaign_id: string;
          customer_identifier: string;
          interaction_type: string;
          interaction_data: any;
          device_info: any;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          customer_identifier: string;
          interaction_type: string;
          interaction_data: any;
          device_info: any;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          customer_identifier?: string;
          interaction_type?: string;
          interaction_data?: any;
          device_info?: any;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      prize_configurations: {
        Row: {
          id: string;
          campaign_id: string;
          type: 'discount' | 'free_item' | 'gift_card' | 'experience' | 'cashback';
          title: string;
          description: string;
          value: string;
          quantity: number;
          remaining: number;
          win_probability: number;
          redemption_instructions: string;
          expiry_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          type: 'discount' | 'free_item' | 'gift_card' | 'experience' | 'cashback';
          title: string;
          description: string;
          value: string;
          quantity: number;
          remaining: number;
          win_probability: number;
          redemption_instructions: string;
          expiry_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          type?: 'discount' | 'free_item' | 'gift_card' | 'experience' | 'cashback';
          title?: string;
          description?: string;
          value?: string;
          quantity?: number;
          remaining?: number;
          win_probability?: number;
          redemption_instructions?: string;
          expiry_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      scratch_campaign_configs: {
        Row: {
          id: string;
          campaign_id: string;
          card_design: any;
          win_message: string;
          lose_message: string;
          instruction_text: string;
          auto_approval_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          card_design: any;
          win_message: string;
          lose_message: string;
          instruction_text: string;
          auto_approval_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          card_design?: any;
          win_message?: string;
          lose_message?: string;
          instruction_text?: string;
          auto_approval_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      scratch_cards: {
        Row: {
          id: string;
          campaign_id: string;
          card_number: number;
          is_winner: boolean;
          prize_id: string | null;
          security_hash: string;
          is_scratched: boolean;
          scratched_at: string | null;
          scratched_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          card_number: number;
          is_winner: boolean;
          prize_id?: string | null;
          security_hash: string;
          is_scratched?: boolean;
          scratched_at?: string | null;
          scratched_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          card_number?: number;
          is_winner?: boolean;
          prize_id?: string | null;
          security_hash?: string;
          is_scratched?: boolean;
          scratched_at?: string | null;
          scratched_by?: string | null;
          created_at?: string;
        };
      };
      scratch_play_sessions: {
        Row: {
          id: string;
          campaign_id: string;
          scratch_card_id: string;
          player_identifier: string;
          scratch_positions: any;
          scratch_percentage: number;
          device_info: any;
          scratch_completion_time: string | null;
          result_revealed: boolean;
          claim_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          scratch_card_id: string;
          player_identifier: string;
          scratch_positions: any;
          scratch_percentage: number;
          device_info: any;
          scratch_completion_time?: string | null;
          result_revealed?: boolean;
          claim_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          scratch_card_id?: string;
          player_identifier?: string;
          scratch_positions?: any;
          scratch_percentage?: number;
          device_info?: any;
          scratch_completion_time?: string | null;
          result_revealed?: boolean;
          claim_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      franchise_config: {
        Row: {
          id: string;
          role_applied_for: 'regional_partner' | 'neighborhood_agent';
          auto_approval_threshold: number;
          spots_remaining: number;
          status: string;
          value: string;
          gem_amount: number;
          bonus_percentage: number;
          name: string;
          price_usd: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          role_applied_for: 'regional_partner' | 'neighborhood_agent';
          auto_approval_threshold?: number;
          spots_remaining?: number;
          status?: string;
          value?: string;
          gem_amount?: number;
          bonus_percentage?: number;
          name?: string;
          price_usd?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role_applied_for?: 'regional_partner' | 'neighborhood_agent';
          auto_approval_threshold?: number;
          spots_remaining?: number;
          status?: string;
          value?: string;
          gem_amount?: number;
          bonus_percentage?: number;
          name?: string;
          price_usd?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      approve_regional_partner_subscription: {
        Args: {
          p_regional_partner_id: string;
          p_subscription_amount: number;
          p_payment_method: string;
        };
        Returns: any;
      };
      approve_neighborhood_agent_with_gems: {
        Args: {
          p_regional_partner_id: string;
          p_agent_id: string;
          p_payment_amount: number;
          p_payment_method: string;
        };
        Returns: any;
      };
      transfer_gems_to_agent: {
        Args: {
          p_sender_id: string;
          p_recipient_id: string;
          p_amount: number;
        };
        Returns: any;
      };
    };
  };
}