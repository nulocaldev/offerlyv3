/**
 * Scratch-and-Win Campaign Service
 * Handles all backend interactions for scratch campaigns
 */

import { supabase } from '../../../shared-kernel/supabase/client';
import type { 
  ScratchCampaignConfig, 
  ScratchCard, 
  ScratchPlaySession,
  CreateScratchCampaignRequest,
  Prize,
  ScratchGameState 
} from './types';

export class ScratchCampaignService {
  
  /**
   * Create a new scratch-and-win campaign
   */
  async createCampaign(request: CreateScratchCampaignRequest): Promise<string> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // 1. Create the base campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        name: request.name,
        business_name: request.business_name,
        description: request.description,
        type: 'scratch_win',
        agent_id: user.user.id,
        start_date: request.start_date,
        end_date: request.end_date,
        tool_config: {
          total_cards: request.total_cards,
          auto_generated: true
        }
      })
      .select()
      .single();

    if (campaignError) throw new Error(`Failed to create campaign: ${campaignError.message}`);

    try {
      // 2. Create scratch-specific configuration
      const { error: configError } = await supabase
        .from('scratch_campaign_configs')
        .insert({
          campaign_id: campaign.id,
          card_design: request.card_design,
          brand_assets: request.brand_assets || {},
          total_cards: request.total_cards,
          win_message: request.win_message || 'Congratulations! You won!',
          lose_message: request.lose_message || 'Try again next time!',
          instruction_text: request.instruction_text || 'Scratch to reveal your prize!'
        });

      if (configError) throw new Error(`Failed to create scratch config: ${configError.message}`);

      // 3. Create prizes
      const prizeInserts = request.prizes.map(prize => ({
        campaign_id: campaign.id,
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

      const { error: prizesError } = await supabase
        .from('prize_configurations')
        .insert(prizeInserts);

      if (prizesError) throw new Error(`Failed to create prizes: ${prizesError.message}`);

      // 4. Generate scratch cards
      await this.generateScratchCards(campaign.id, request.total_cards, request.prizes);

      return campaign.id;
    } catch (error) {
      // Cleanup on failure
      await supabase.from('campaigns').delete().eq('id', campaign.id);
      throw error;
    }
  }

  /**
   * Generate individual scratch cards for a campaign
   */
  private async generateScratchCards(
    campaignId: string, 
    totalCards: number, 
    prizes: CreateScratchCampaignRequest['prizes']
  ): Promise<void> {
    // Calculate how many cards should be winners
    const cards: Array<{
      campaign_id: string;
      card_number: number;
      is_winner: boolean;
      prize_id?: string;
      security_hash: string;
    }> = [];

    // Get the actual prize records to reference
    const { data: createdPrizes } = await supabase
      .from('prize_configurations')
      .select('*')
      .eq('campaign_id', campaignId);

    if (!createdPrizes) throw new Error('Failed to retrieve created prizes');

    // Calculate winners based on probabilities
    let remainingCards = totalCards;
    const winningCards: number[] = [];

    for (const prizeConfig of prizes) {
      const matchingPrize = createdPrizes.find(p => 
        p.title === prizeConfig.title && p.type === prizeConfig.type
      );
      
      if (!matchingPrize) continue;

      // Calculate how many cards should win this prize
      const prizeWinners = Math.min(
        Math.floor(totalCards * (prizeConfig.win_probability / 100)),
        prizeConfig.quantity,
        remainingCards
      );

      // Randomly assign card positions for this prize
      for (let i = 0; i < prizeWinners; i++) {
        let cardNumber;
        do {
          cardNumber = Math.floor(Math.random() * totalCards) + 1;
        } while (winningCards.includes(cardNumber));
        
        winningCards.push(cardNumber);
        remainingCards--;
      }
    }

    // Generate all cards
    for (let i = 1; i <= totalCards; i++) {
      const isWinner = winningCards.includes(i);
      const prizeId = isWinner ? this.selectRandomPrizeForCard(createdPrizes, prizes) : undefined;
      
      cards.push({
        campaign_id: campaignId,
        card_number: i,
        is_winner: isWinner,
        prize_id: prizeId,
        security_hash: this.generateSecurityHash(campaignId, i, isWinner)
      });
    }

    // Insert all cards
    const { error } = await supabase
      .from('scratch_cards')
      .insert(cards);

    if (error) throw new Error(`Failed to generate scratch cards: ${error.message}`);
  }

  /**
   * Select a random prize for a winning card
   */
  private selectRandomPrizeForCard(createdPrizes: Prize[], prizeConfigs: CreateScratchCampaignRequest['prizes']): string {
    // For now, just return the first available prize
    // In a more sophisticated system, we'd weight this by remaining quantity
    return createdPrizes[0]?.id || '';
  }

  /**
   * Generate security hash for card integrity
   */
  private generateSecurityHash(campaignId: string, cardNumber: number, isWinner: boolean): string {
    const data = `${campaignId}-${cardNumber}-${isWinner}-${Date.now()}`;
    return btoa(data); // Simple base64 encoding - in production, use proper cryptographic hash
  }

  /**
   * Get campaigns for the current user
   */
  async getUserCampaigns(): Promise<Array<{ 
    id: string; 
    name: string; 
    business_name: string; 
    status: string; 
    type: string;
    created_at: string;
    config?: ScratchCampaignConfig;
    metrics?: {
      total_plays: number;
      total_wins: number;
      win_rate: number;
    };
  }>> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        scratch_campaign_configs(*)
      `)
      .eq('agent_id', user.user.id)
      .eq('type', 'scratch_win')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch campaigns: ${error.message}`);

    return campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      business_name: campaign.business_name,
      status: campaign.status,
      type: campaign.type,
      created_at: campaign.created_at,
      config: campaign.scratch_campaign_configs?.[0] || undefined,
      metrics: {
        total_plays: campaign.interactions || 0,
        total_wins: 0, // Will be calculated from scratch_cards
        win_rate: 0
      }
    }));
  }

  /**
   * Start a new scratch play session
   */
  async startPlaySession(campaignId: string, playerIdentifier: string): Promise<ScratchGameState> {
    // 1. Get campaign and config
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        scratch_campaign_configs(*),
        prize_configurations(*)
      `)
      .eq('id', campaignId)
      .eq('status', 'active')
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found or not active');
    }

    // 2. Get an available scratch card
    const { data: availableCard, error: cardError } = await supabase
      .from('scratch_cards')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_scratched', false)
      .limit(1)
      .single();

    if (cardError || !availableCard) {
      throw new Error('No more cards available for this campaign');
    }

    // 3. Create play session
    const { data: session, error: sessionError } = await supabase
      .from('scratch_play_sessions')
      .insert({
        campaign_id: campaignId,
        scratch_card_id: availableCard.id,
        player_identifier: playerIdentifier,
        scratch_positions: [],
        scratch_percentage: 0,
        device_info: this.getDeviceInfo()
      })
      .select()
      .single();

    if (sessionError) throw new Error(`Failed to create play session: ${sessionError.message}`);

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        business_name: campaign.business_name,
        description: campaign.description
      },
      config: campaign.scratch_campaign_configs[0],
      current_card: availableCard,
      session: session,
      is_loading: false,
      is_scratching: false,
      is_revealed: false,
      scratch_progress: 0
    };
  }

  /**
   * Update scratch progress during gameplay
   */
  async updateScratchProgress(
    sessionId: string, 
    scratchPositions: Array<{ x: number; y: number; timestamp: number }>,
    scratchPercentage: number
  ): Promise<void> {
    const { error } = await supabase
      .from('scratch_play_sessions')
      .update({
        scratch_positions: scratchPositions,
        scratch_percentage: scratchPercentage
      })
      .eq('id', sessionId);

    if (error) throw new Error(`Failed to update scratch progress: ${error.message}`);
  }

  /**
   * Complete the scratch and reveal result
   */
  async completeScratch(sessionId: string): Promise<{
    is_winner: boolean;
    prize?: Prize;
    message: string;
    claim_code?: string;
  }> {
    // 1. Get session and card info
    const { data: session, error: sessionError } = await supabase
      .from('scratch_play_sessions')
      .select(`
        *,
        scratch_cards(*)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    const card = session.scratch_cards;
    
    // 2. Mark card as scratched
    const { error: cardError } = await supabase
      .from('scratch_cards')
      .update({
        is_scratched: true,
        scratched_at: new Date().toISOString(),
        scratched_by: session.player_identifier
      })
      .eq('id', card.id);

    if (cardError) throw new Error(`Failed to update card: ${cardError.message}`);

    // 3. Update session completion
    const claimCode = card.is_winner ? `CLAIM-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}` : undefined;
    
    const { error: sessionUpdateError } = await supabase
      .from('scratch_play_sessions')
      .update({
        scratch_completion_time: new Date().toISOString(),
        result_revealed: true,
        claim_code: claimCode
      })
      .eq('id', sessionId);

    if (sessionUpdateError) throw new Error(`Failed to complete session: ${sessionUpdateError.message}`);

    // 4. Get prize info if winner
    let prize: Prize | undefined;
    if (card.is_winner && card.prize_id) {
      const { data: prizeData } = await supabase
        .from('prize_configurations')
        .select('*')
        .eq('id', card.prize_id)
        .single();
      
      prize = prizeData || undefined;
    }

    // 5. Get campaign config for messages
    const { data: config } = await supabase
      .from('scratch_campaign_configs')
      .select('*')
      .eq('campaign_id', session.campaign_id)
      .single();

    const message = card.is_winner 
      ? (config?.win_message || 'Congratulations! You won!')
      : (config?.lose_message || 'Try again next time!');

    return {
      is_winner: card.is_winner,
      prize,
      message,
      claim_code: claimCode
    };
  }

  /**
   * Get device information for analytics
   */
  private getDeviceInfo(): Record<string, any> {
    if (typeof window === 'undefined') return {};
    
    return {
      user_agent: navigator.userAgent,
      screen_width: screen.width,
      screen_height: screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    };
  }
}

// Export singleton instance
export const scratchCampaignService = new ScratchCampaignService();