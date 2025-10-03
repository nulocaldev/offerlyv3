// DOMAIN SERVICE: Franchise Network
// This service handles all franchise business model operations:
// - Agent hierarchy management
// - Gem economy operations
// - Subscription management
// - Territory management

import { supabase } from '@infrastructure/supabase/client';
import type { 
  FranchiseProfile,
  GemTransaction,
  AgentApplication
} from '@domains/franchise-network/types';
import type { ApiResponse } from '@shared/types/common';

// =============================================================================
// FRANCHISE NETWORK DOMAIN SERVICE
// =============================================================================

export class FranchiseNetworkService {
  
  // ========================================================================
  // AGENT HIERARCHY MANAGEMENT
  // ========================================================================
  
  async validateAgentPermissions(
    agent_id: string
  ): Promise<ApiResponse<{ agent_id: string; permissions: string[] }>> {
    try {
      const { data: profile, error } = await supabase
        .from('franchise_profiles')
        .select('role, status')
        .eq('id', agent_id)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (profile.status !== 'active') {
        return {
          success: false,
          error: `Agent status is ${profile.status}`
        };
      }

      const permissions = this.getRolePermissions(profile.role);
      
      return {
        success: true,
        data: {
          agent_id,
          permissions
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async validateAdminPermissions(user_id: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('franchise_profiles')
        .select('role, status')
        .eq('id', user_id)
        .eq('role', 'admin')
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        return { success: false, error: error.message };
      }

      return { success: !!data, data };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async validateRegionalPartnerPermissions(user_id: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('franchise_profiles')
        .select('role, status')
        .eq('id', user_id)
        .eq('role', 'regional_partner')
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        return { success: false, error: error.message };
      }

      return { success: !!data, data };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ========================================================================
  // GEM ECONOMY OPERATIONS
  // ========================================================================
  
  async calculateCampaignGemCost(
    type: string,
    config: any
  ): Promise<ApiResponse<{ cost: number; breakdown: any }>> {
    try {
      // Get gem pricing from platform settings
      const { data: settings, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'gem_pricing')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const pricing = settings.value;
      let baseCost = pricing.campaign_types[type] || 50;
      
      // Calculate additional costs based on configuration
      let additionalCosts = 0;
      if (config.type === 'scratch_win' && config.settings.prizes) {
        additionalCosts = config.settings.prizes.length * 10;
      }

      const totalCost = baseCost + additionalCosts;
      
      return {
        success: true,
        data: {
          cost: totalCost,
          breakdown: {
            base_cost: baseCost,
            additional_features: additionalCosts,
            total: totalCost
          }
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async calculateAgentApprovalCost(
    role: string
  ): Promise<ApiResponse<{ cost: number }>> {
    try {
      const { data: settings, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'agent_approval_costs')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const cost = settings.value[role] || 500; // Default cost
      
      return {
        success: true,
        data: { cost }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deductGems(request: GemDeductionRequest): Promise<ApiResponse<GemDeductionResponse>> {
    try {
      // Start transaction
      const { data: balance, error: balanceError } = await supabase
        .from('gem_balances')
        .select('*')
        .eq('user_id', request.agent_id)
        .single();

      if (balanceError) {
        return { success: false, error: balanceError.message };
      }

      if (balance.total_gems < request.amount) {
        return {
          success: false,
          error: `Insufficient gems. Required: ${request.amount}, Available: ${balance.total_gems}`
        };
      }

      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('gem_transactions')
        .insert({
          sender_id: request.agent_id,
          recipient_id: null, // Gems being spent
          amount: request.amount,
          transaction_type: request.transaction_type,
          status: 'completed',
          reason: request.reason
        })
        .select()
        .single();

      if (transactionError) {
        return { success: false, error: transactionError.message };
      }

      // Update gem balance
      const newBalance = balance.total_gems - request.amount;
      const { error: updateError } = await supabase
        .from('gem_balances')
        .update({ 
          total_gems: newBalance,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', request.agent_id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return {
        success: true,
        data: {
          transaction,
          remaining_balance: newBalance,
          quota_remaining: balance.allocated_gems // This would need more complex calculation
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async refundGems(request: GemRefundRequest): Promise<ApiResponse<GemTransaction>> {
    try {
      // Get original transaction
      const { data: originalTx, error: txError } = await supabase
        .from('gem_transactions')
        .select('*')
        .eq('id', request.transaction_id)
        .single();

      if (txError) {
        return { success: false, error: txError.message };
      }

      // Create refund transaction
      const { data: refundTx, error: refundError } = await supabase
        .from('gem_transactions')
        .insert({
          sender_id: null,
          recipient_id: originalTx.sender_id,
          amount: originalTx.amount,
          transaction_type: 'refund',
          status: 'completed',
          reason: request.reason,
          metadata: {
            original_transaction_id: request.transaction_id
          }
        })
        .select()
        .single();

      if (refundError) {
        return { success: false, error: refundError.message };
      }

      // Update gem balance
      await supabase
        .from('gem_balances')
        .update({ 
          total_gems: supabase.raw(`total_gems + ${originalTx.amount}`),
          last_updated: new Date().toISOString()
        })
        .eq('user_id', originalTx.sender_id);

      return { success: true, data: refundTx };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async allocateGemsToNewAgent(request: GemAllocationRequest): Promise<ApiResponse<any>> {
    try {
      // Create or update gem balance for new agent
      const { data: balance, error: balanceError } = await supabase
        .from('gem_balances')
        .upsert({
          user_id: request.agent_id,
          total_gems: request.amount,
          allocated_gems: request.amount,
          purchased_gems: 0,
          commission_gems: 0,
          last_updated: new Date().toISOString()
        })
        .select()
        .single();

      if (balanceError) {
        return { success: false, error: balanceError.message };
      }

      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('gem_transactions')
        .insert({
          sender_id: null, // System allocation
          recipient_id: request.agent_id,
          amount: request.amount,
          transaction_type: request.transaction_type,
          status: 'completed',
          reason: 'Initial gem allocation for new agent',
          metadata: {
            source_transaction_id: request.source_transaction_id
          }
        })
        .select()
        .single();

      if (transactionError) {
        return { success: false, error: transactionError.message };
      }

      return {
        success: true,
        data: {
          balance,
          transaction
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ========================================================================
  // AGENT APPLICATION MANAGEMENT
  // ========================================================================
  
  async createAgentApplication(data: any): Promise<ApiResponse<AgentApplication>> {
    try {
      const { data: application, error } = await supabase
        .from('agent_applications')
        .insert({
          applicant_id: data.applicant_id,
          role_applied_for: data.application_data.role_applied_for,
          personal_info: data.application_data,
          status: 'pending',
          referral_agent_id: data.referral_agent_id
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: application };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async activateApprovedAgent(request: any): Promise<ApiResponse<FranchiseProfile>> {
    try {
      // Update user status to active
      const { data: profile, error } = await supabase
        .from('franchise_profiles')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', request.application_id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Update application status
      await supabase
        .from('agent_applications')
        .update({
          status: 'active',
          reviewer_id: request.approver_id,
          review_notes: request.approval_notes
        })
        .eq('applicant_id', request.application_id);

      return { success: true, data: profile };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================
  
  private getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      admin: ['manage_all', 'approve_regional_partners', 'platform_settings'],
      regional_partner: ['manage_agents', 'approve_neighborhood_agents', 'transfer_gems'],
      neighborhood_agent: ['create_campaigns', 'manage_clients', 'set_pricing'],
      user: ['view_campaigns']
    };

    return permissions[role] || [];
  }

  async validateReferralCode(code: string): Promise<ApiResponse<any>> {
    // Implementation would validate referral codes
    return { success: true, data: {} };
  }

  async getAgentIdFromReferralCode(code: string): Promise<string | undefined> {
    // Implementation would extract agent ID from referral code
    return undefined;
  }
}

// =============================================================================
// SUPPORTING TYPES
// =============================================================================

interface GemDeductionRequest {
  agent_id: string;
  amount: number;
  transaction_type: 'campaign_creation' | 'agent_approval' | 'premium_feature';
  reason: string;
}

interface GemDeductionResponse {
  transaction: GemTransaction;
  remaining_balance: number;
  quota_remaining: number;
}

interface GemRefundRequest {
  transaction_id: string;
  reason: string;
}

interface GemAllocationRequest {
  agent_id: string;
  amount: number;
  transaction_type: 'subscription_allocation' | 'bonus_allocation';
  source_transaction_id?: string;
}
