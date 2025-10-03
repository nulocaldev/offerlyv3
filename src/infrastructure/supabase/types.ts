// Supabase database types
// This file should be generated using: supabase gen types typescript
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
