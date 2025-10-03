// APPLICATION SERVICE: Campaign Creation Orchestrator
// This service demonstrates how the two domains interact:
// 1. Franchise Network Domain: Validates agent permissions & deducts gems
// 2. Marketing Tools Domain: Creates the actual marketing campaign

import type { Campaign, CampaignType, ToolConfiguration } from '@domains/marketing-tools/types';
import type { GemTransaction } from '@domains/franchise-network/types';
import type { ApiResponse } from '@shared/types/common';

// =============================================================================
// CAMPAIGN CREATION REQUEST
// =============================================================================

export interface CampaignCreationRequest {
  // Agent context (Franchise Network Domain)
  agent_id: string;
  
  // Marketing tool configuration (Marketing Tools Domain)
  campaign_data: {
    name: string;
    business_name: string;
    description: string;
    type: CampaignType;
    tool_config: ToolConfiguration;
    start_date: string;
    end_date: string;
  };
  
  // Business rules
  rules: {
    max_plays_per_user: number;
    cooldown_minutes: number;
    target_audience: 'all' | 'new_customers';
  };
}

export interface CampaignCreationResponse {
  campaign: Campaign;
  gem_transaction: GemTransaction;
  gem_cost: number;
  remaining_balance: number;
}

// =============================================================================
// CAMPAIGN CREATION ORCHESTRATOR
// =============================================================================

export class CampaignCreationService {
  constructor(
    private franchiseService: FranchiseNetworkService,
    private marketingToolsService: MarketingToolsService
  ) {}

  async createCampaign(
    request: CampaignCreationRequest
  ): Promise<ApiResponse<CampaignCreationResponse>> {
    try {
      // STEP 1: Franchise Network Domain - Validate agent permissions
      const agentValidation = await this.franchiseService.validateAgentPermissions(
        request.agent_id
      );
      
      if (!agentValidation.success) {
        return {
          success: false,
          error: agentValidation.error || 'Agent validation failed'
        };
      }

      // STEP 2: Franchise Network Domain - Calculate gem cost
      const gemCostResult = await this.franchiseService.calculateCampaignGemCost(
        request.campaign_data.type,
        request.campaign_data.tool_config
      );

      if (!gemCostResult.success || !gemCostResult.data) {
        return {
          success: false,
          error: 'Failed to calculate gem cost'
        };
      }

      const gemCost = gemCostResult.data.cost;

      // STEP 3: Franchise Network Domain - Validate and deduct gems
      const gemDeductionResult = await this.franchiseService.deductGems({
        agent_id: request.agent_id,
        amount: gemCost,
        transaction_type: 'campaign_creation',
        reason: `Campaign creation: ${request.campaign_data.name}`
      });

      if (!gemDeductionResult.success || !gemDeductionResult.data) {
        return {
          success: false,
          error: gemDeductionResult.error || 'Insufficient gems'
        };
      }

      // STEP 4: Marketing Tools Domain - Create the actual campaign
      const campaignResult = await this.marketingToolsService.createCampaign({
        ...request.campaign_data,
        agent_id: request.agent_id,
        status: 'active',
        rules: request.rules
      });

      if (!campaignResult.success || !campaignResult.data) {
        // ROLLBACK: Refund gems if campaign creation failed
        await this.franchiseService.refundGems({
          transaction_id: gemDeductionResult.data.transaction.id,
          reason: 'Campaign creation failed - automatic refund'
        });

        return {
          success: false,
          error: campaignResult.error || 'Campaign creation failed'
        };
      }

      // SUCCESS: Return complete response
      return {
        success: true,
        data: {
          campaign: campaignResult.data,
          gem_transaction: gemDeductionResult.data.transaction,
          gem_cost: gemCost,
          remaining_balance: gemDeductionResult.data.remaining_balance
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Campaign management methods that also require gem validation
  async pauseCampaign(campaign_id: string, agent_id: string): Promise<ApiResponse<Campaign>> {
    // Validate agent owns this campaign
    const ownershipCheck = await this.marketingToolsService.validateCampaignOwnership(
      campaign_id, 
      agent_id
    );
    
    if (!ownershipCheck.success) {
      return { success: false, error: 'Unauthorized or campaign not found' };
    }

    return this.marketingToolsService.updateCampaignStatus(campaign_id, 'paused');
  }

  async resumeCampaign(campaign_id: string, agent_id: string): Promise<ApiResponse<Campaign>> {
    // Similar pattern - validate ownership then perform action
    const ownershipCheck = await this.marketingToolsService.validateCampaignOwnership(
      campaign_id, 
      agent_id
    );
    
    if (!ownershipCheck.success) {
      return { success: false, error: 'Unauthorized or campaign not found' };
    }

    return this.marketingToolsService.updateCampaignStatus(campaign_id, 'active');
  }
}

// =============================================================================
// SERVICE INTERFACES (Implementation will be in domain services)
// =============================================================================

interface FranchiseNetworkService {
  validateAgentPermissions(agent_id: string): Promise<ApiResponse<{ agent_id: string; permissions: string[] }>>;
  calculateCampaignGemCost(type: CampaignType, config: ToolConfiguration): Promise<ApiResponse<{ cost: number; breakdown: any }>>;
  deductGems(request: GemDeductionRequest): Promise<ApiResponse<GemDeductionResponse>>;
  refundGems(request: GemRefundRequest): Promise<ApiResponse<GemTransaction>>;
}

interface MarketingToolsService {
  createCampaign(data: CampaignCreationData): Promise<ApiResponse<Campaign>>;
  validateCampaignOwnership(campaign_id: string, agent_id: string): Promise<ApiResponse<boolean>>;
  updateCampaignStatus(campaign_id: string, status: Campaign['status']): Promise<ApiResponse<Campaign>>;
}

// Supporting types
interface GemDeductionRequest {
  agent_id: string;
  amount: number;
  transaction_type: 'campaign_creation' | 'premium_feature' | 'add_on_service';
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
