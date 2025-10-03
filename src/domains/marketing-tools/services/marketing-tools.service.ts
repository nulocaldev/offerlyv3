// DOMAIN SERVICE: Marketing Tools
// This service handles all marketing tool creation and customer engagement
// It is completely independent of the franchise business model

import { supabase } from '@infrastructure/supabase/client';
import type { 
  Campaign, 
  CampaignType, 
  ToolConfiguration,
  CustomerInteraction,
  InteractionResult,
  CampaignAnalytics,
  PrizeConfiguration
} from '@domains/marketing-tools/types';
import type { ApiResponse } from '@shared/types/common';

// =============================================================================
// MARKETING TOOLS DOMAIN SERVICE
// =============================================================================

export class MarketingToolsService {
  
  // ========================================================================
  // CAMPAIGN MANAGEMENT
  // ========================================================================
  
  async createCampaign(data: CampaignCreationData): Promise<ApiResponse<Campaign>> {
    try {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          name: data.name,
          business_name: data.business_name,
          description: data.description,
          type: data.type,
          agent_id: data.agent_id,
          tool_config: data.tool_config,
          start_date: data.start_date,
          end_date: data.end_date,
          status: data.status,
          rules: data.rules,
          views: 0,
          interactions: 0,
          conversion_rate: 0.0
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Initialize prize configurations if provided
      if (data.tool_config.type === 'scratch_win' && data.tool_config.settings.prizes) {
        await this.createPrizeConfigurations(campaign.id, data.tool_config.settings.prizes);
      }

      return { success: true, data: campaign };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async validateCampaignOwnership(campaign_id: string, agent_id: string): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('agent_id')
        .eq('id', campaign_id)
        .eq('agent_id', agent_id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        return { success: false, error: error.message };
      }

      return { success: true, data: !!data };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateCampaignStatus(
    campaign_id: string, 
    status: Campaign['status']
  ): Promise<ApiResponse<Campaign>> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign_id)
        .select()
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

  async getCampaignsByAgent(agent_id: string): Promise<ApiResponse<Campaign[]>> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('agent_id', agent_id)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ========================================================================
  // CUSTOMER INTERACTION & GAMEPLAY
  // ========================================================================
  
  async recordCustomerInteraction(
    interaction: Omit<CustomerInteraction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ApiResponse<CustomerInteraction>> {
    try {
      const { data, error } = await supabase
        .from('customer_interactions')
        .insert(interaction)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Update campaign metrics
      await this.updateCampaignMetrics(interaction.campaign_id, interaction.interaction_type);

      return { success: true, data };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkCustomerEligibility(
    campaign_id: string,
    customer_identifier: string
  ): Promise<ApiResponse<{ eligible: boolean; reason?: string; next_play_time?: string }>> {
    try {
      // Get campaign rules
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('rules, status')
        .eq('id', campaign_id)
        .single();

      if (campaignError) {
        return { success: false, error: campaignError.message };
      }

      if (campaign.status !== 'active') {
        return {
          success: true,
          data: {
            eligible: false,
            reason: `Campaign is ${campaign.status}`
          }
        };
      }

      // Check play history
      const { data: interactions, error: interactionError } = await supabase
        .from('customer_interactions')
        .select('interaction_type, created_at')
        .eq('campaign_id', campaign_id)
        .eq('customer_identifier', customer_identifier)
        .order('created_at', { ascending: false });

      if (interactionError) {
        return { success: false, error: interactionError.message };
      }

      const playInteractions = interactions?.filter(i => i.interaction_type === 'play') || [];
      const rules = campaign.rules;

      // Check max plays limit
      if (playInteractions.length >= rules.max_plays_per_user) {
        return {
          success: true,
          data: {
            eligible: false,
            reason: 'Maximum plays reached'
          }
        };
      }

      // Check cooldown period
      if (playInteractions.length > 0 && rules.cooldown_minutes > 0) {
        const lastPlay = new Date(playInteractions[0].created_at);
        const cooldownEnd = new Date(lastPlay.getTime() + (rules.cooldown_minutes * 60 * 1000));
        const now = new Date();

        if (now < cooldownEnd) {
          return {
            success: true,
            data: {
              eligible: false,
              reason: 'Cooldown period active',
              next_play_time: cooldownEnd.toISOString()
            }
          };
        }
      }

      return {
        success: true,
        data: { eligible: true }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async playGame(
    campaign_id: string,
    customer_identifier: string
  ): Promise<ApiResponse<InteractionResult>> {
    try {
      // First check eligibility
      const eligibilityCheck = await this.checkCustomerEligibility(campaign_id, customer_identifier);
      
      if (!eligibilityCheck.success || !eligibilityCheck.data?.eligible) {
        const result: InteractionResult = {
          status: 'ineligible',
          message: eligibilityCheck.data?.reason || 'Not eligible to play'
        };
        
        if (eligibilityCheck.data?.next_play_time) {
          result.next_play_available = eligibilityCheck.data.next_play_time;
        }
        
        return { success: true, data: result };
      }

      // Get available prizes
      const { data: prizes, error: prizeError } = await supabase
        .from('prize_configurations')
        .select('*')
        .eq('campaign_id', campaign_id)
        .gt('remaining', 0)
        .eq('is_active', true);

      if (prizeError) {
        return { success: false, error: prizeError.message };
      }

      if (!prizes || prizes.length === 0) {
        return {
          success: true,
          data: {
            status: 'no_prizes_left',
            message: 'No prizes remaining'
          }
        };
      }

      // Determine if player wins based on probability
      const result = this.determineGameOutcome(prizes);
      
      // Record the interaction
      await this.recordCustomerInteraction({
        campaign_id,
        customer_identifier,
        interaction_type: 'play',
        result,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });

      // If won, reduce prize inventory
      if (result.status === 'win' && result.prize) {
        await this.reducePrizeInventory(result.prize.id);
      }

      return { success: true, data: result };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ========================================================================
  // ANALYTICS & REPORTING
  // ========================================================================
  
  async getCampaignAnalytics(
    campaign_id: string,
    period: 'daily' | 'weekly' | 'monthly' | 'campaign_lifetime' = 'campaign_lifetime'
  ): Promise<ApiResponse<CampaignAnalytics>> {
    try {
      // This would involve complex aggregation queries
      // For now, returning a simplified version
      const { data: interactions, error } = await supabase
        .from('customer_interactions')
        .select('*')
        .eq('campaign_id', campaign_id);

      if (error) {
        return { success: false, error: error.message };
      }

      const analytics = this.calculateAnalytics(interactions || [], period);
      
      return { success: true, data: analytics };

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
  
  private async createPrizeConfigurations(
    campaign_id: string, 
    prizes: PrizeConfiguration[]
  ): Promise<void> {
    const prizeData = prizes.map(prize => ({
      campaign_id,
      type: prize.type,
      title: prize.title,
      description: prize.description,
      value: prize.value,
      quantity: prize.quantity,
      remaining: prize.quantity,
      win_probability: prize.win_probability,
      redemption_instructions: prize.redemption_instructions,
      expiry_date: prize.expiry_date
    }));

    await supabase
      .from('prize_configurations')
      .insert(prizeData);
  }

  private async updateCampaignMetrics(
    campaign_id: string, 
    interaction_type: string
  ): Promise<void> {
    if (interaction_type === 'view') {
      await supabase.rpc('increment_campaign_views', { campaign_id });
    } else if (interaction_type === 'play') {
      await supabase.rpc('increment_campaign_interactions', { campaign_id });
    }
  }

  private determineGameOutcome(prizes: PrizeConfiguration[]): InteractionResult {
    // Simple random selection based on probabilities
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const prize of prizes) {
      cumulativeProbability += prize.win_probability;
      if (random <= cumulativeProbability) {
        return {
          status: 'win',
          prize,
          message: `Congratulations! You won ${prize.title}!`
        };
      }
    }

    return {
      status: 'loss',
      message: 'Better luck next time!'
    };
  }

  private async reducePrizeInventory(prize_id: string): Promise<void> {
    // Get current remaining count and decrement
    const { data: currentPrize } = await supabase
      .from('prize_configurations')
      .select('remaining')
      .eq('id', prize_id)
      .single();

    const newRemaining = Math.max(0, (currentPrize?.remaining || 0) - 1);

    await supabase
      .from('prize_configurations')
      .update({ 
        remaining: newRemaining,
        updated_at: new Date().toISOString()
      })
      .eq('id', prize_id);
  }

  private calculateAnalytics(
    interactions: CustomerInteraction[], 
    period: string
  ): CampaignAnalytics {
    // Simplified analytics calculation
    const views = interactions.filter(i => i.interaction_type === 'view').length;
    const plays = interactions.filter(i => i.interaction_type === 'play').length;
    const wins = interactions.filter(i => 
      i.interaction_type === 'play' && i.result.status === 'win'
    ).length;
    const shares = interactions.filter(i => i.interaction_type === 'share').length;
    const follows = interactions.filter(i => i.interaction_type === 'follow').length;

    return {
      campaign_id: interactions[0]?.campaign_id || '',
      period: period as any,
      metrics: {
        total_views: views,
        unique_visitors: new Set(interactions.map(i => i.customer_identifier)).size,
        total_plays: plays,
        total_wins: wins,
        conversion_rate: plays > 0 ? (wins / plays) * 100 : 0,
        prize_redemption_rate: 0, // Would need prize redemption tracking
        social_shares: shares,
        new_followers: follows
      },
      demographics: {
        age_groups: {},
        geographic_distribution: {},
        device_types: {}
      }
    };
  }
}

// =============================================================================
// SUPPORTING TYPES
// =============================================================================

interface CampaignCreationData {
  name: string;
  business_name: string;
  description: string;
  type: CampaignType;
  agent_id: string;
  tool_config: ToolConfiguration;
  start_date: string;
  end_date: string;
  status: Campaign['status'];
  rules: any;
}
