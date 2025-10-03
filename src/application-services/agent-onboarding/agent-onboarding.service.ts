// APPLICATION SERVICE: Agent Onboarding Orchestrator
// This service demonstrates the franchise network's agent recruitment flow:
// 1. Agent applies via referral link
// 2. Regional partner reviews and approves (with gem cost)
// 3. Gems are deducted from regional partner
// 4. Gems are allocated to new neighborhood agent

import type { 
  AgentApplication, 
  FranchiseProfile, 
  GemTransaction, 
  SubscriptionMilestone 
} from '@domains/franchise-network/types';
import type { ApiResponse } from '@shared/types/common';

// =============================================================================
// AGENT ONBOARDING REQUESTS
// =============================================================================

export interface AgentApplicationRequest {
  // Personal information
  email: string;
  password: string;
  display_name: string;
  mobile_number: string;
  
  // Location and social
  location: {
    address: string;
    city: string;
    state: string;
    postal_code: string;
    latitude?: number;
    longitude?: number;
  };
  
  social_handles: {
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  
  // Application details
  experience_info: {
    years_experience: number;
    previous_roles: string[];
    why_interested: string;
    availability: string;
  };
  
  // Referral context
  referral_code?: string; // For neighborhood agents
  role_applied_for: 'regional_partner' | 'neighborhood_agent';
}

export interface AgentApprovalRequest {
  application_id: string;
  approver_id: string; // Admin for regional partners, regional partner for neighborhood agents
  
  // Payment information
  payment_amount: number;
  payment_method: string;
  
  // Administrative notes
  approval_notes?: string;
  milestone_id?: string; // For subscription assignment
}

// =============================================================================
// AGENT ONBOARDING ORCHESTRATOR
// =============================================================================

export class AgentOnboardingService {
  constructor(
    private franchiseService: FranchiseNetworkService,
    private authService: AuthenticationService,
    private subscriptionService: SubscriptionManagementService
  ) {}

  // ==========================================================================
  // AGENT APPLICATION SUBMISSION
  // ==========================================================================
  
  async submitAgentApplication(
    request: AgentApplicationRequest
  ): Promise<ApiResponse<{ application_id: string; status: string }>> {
    try {
      // STEP 1: Validate referral code (for neighborhood agents)
      if (request.role_applied_for === 'neighborhood_agent' && request.referral_code) {
        const referralValidation = await this.franchiseService.validateReferralCode(
          request.referral_code
        );
        
        if (!referralValidation.success) {
          return {
            success: false,
            error: 'Invalid referral code'
          };
        }
      }

      // STEP 2: Create user account (but keep it inactive)
      const userCreation = await this.authService.createInactiveUser({
        email: request.email,
        password: request.password,
        role: request.role_applied_for,
        status: 'pending'
      });

      if (!userCreation.success || !userCreation.data) {
        return {
          success: false,
          error: userCreation.error || 'Failed to create user account'
        };
      }

      // STEP 3: Create application record
      const applicationResult = await this.franchiseService.createAgentApplication({
        applicant_id: userCreation.data.user_id,
        application_data: request,
        referral_agent_id: request.referral_code ? 
          await this.franchiseService.getAgentIdFromReferralCode(request.referral_code) : 
          undefined
      });

      if (!applicationResult.success || !applicationResult.data) {
        // Cleanup: Remove created user account
        await this.authService.deleteUser(userCreation.data.user_id);
        
        return {
          success: false,
          error: applicationResult.error || 'Failed to create application'
        };
      }

      return {
        success: true,
        data: {
          application_id: applicationResult.data.id,
          status: 'pending'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // ==========================================================================
  // REGIONAL PARTNER APPROVAL (By Admin)
  // ==========================================================================
  
  async approveRegionalPartner(
    request: AgentApprovalRequest
  ): Promise<ApiResponse<RegionalPartnerApprovalResponse>> {
    try {
      // STEP 1: Validate admin permissions
      const adminValidation = await this.franchiseService.validateAdminPermissions(
        request.approver_id
      );
      
      if (!adminValidation.success) {
        return {
          success: false,
          error: 'Unauthorized: Admin permissions required'
        };
      }

      // STEP 2: Get current milestone for gem allocation
      const currentMilestone = await this.subscriptionService.getCurrentMilestone();
      if (!currentMilestone.success || !currentMilestone.data) {
        return {
          success: false,
          error: 'No active milestone available'
        };
      }

      // STEP 3: Process subscription and allocate gems
      const subscriptionResult = await this.subscriptionService.createSubscription({
        agent_id: request.application_id,
        milestone_id: request.milestone_id || currentMilestone.data.id,
        payment_amount: request.payment_amount,
        payment_method: request.payment_method
      });

      if (!subscriptionResult.success || !subscriptionResult.data) {
        return {
          success: false,
          error: subscriptionResult.error || 'Failed to create subscription'
        };
      }

      // STEP 4: Activate user account and update status
      const activationResult = await this.franchiseService.activateApprovedAgent({
        application_id: request.application_id,
        subscription_id: subscriptionResult.data.subscription.id,
        gems_allocated: subscriptionResult.data.gems_allocated,
        approval_notes: request.approval_notes
      });

      if (!activationResult.success || !activationResult.data) {
        // Rollback subscription if activation fails
        await this.subscriptionService.cancelSubscription(
          subscriptionResult.data.subscription.id
        );
        
        return {
          success: false,
          error: activationResult.error || 'Failed to activate agent'
        };
      }

      return {
        success: true,
        data: {
          agent_profile: activationResult.data,
          subscription: subscriptionResult.data.subscription,
          gems_allocated: subscriptionResult.data.gems_allocated,
          milestone: currentMilestone.data
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // ==========================================================================
  // NEIGHBORHOOD AGENT APPROVAL (By Regional Partner)
  // ==========================================================================
  
  async approveNeighborhoodAgent(
    request: AgentApprovalRequest
  ): Promise<ApiResponse<NeighborhoodAgentApprovalResponse>> {
    try {
      // STEP 1: Validate regional partner permissions
      const partnerValidation = await this.franchiseService.validateRegionalPartnerPermissions(
        request.approver_id
      );
      
      if (!partnerValidation.success) {
        return {
          success: false,
          error: 'Unauthorized: Regional partner permissions required'
        };
      }

      // STEP 2: Calculate gem cost for agent approval
      const gemCostResult = await this.franchiseService.calculateAgentApprovalCost(
        'neighborhood_agent'
      );

      if (!gemCostResult.success || !gemCostResult.data) {
        return {
          success: false,
          error: 'Failed to calculate approval cost'
        };
      }

      const gemCost = gemCostResult.data.cost;

      // STEP 3: Deduct gems from regional partner
      const gemDeductionResult = await this.franchiseService.deductGems({
        agent_id: request.approver_id,
        amount: gemCost,
        transaction_type: 'agent_approval',
        reason: `Neighborhood agent approval - Application #${request.application_id}`
      });

      if (!gemDeductionResult.success || !gemDeductionResult.data) {
        return {
          success: false,
          error: gemDeductionResult.error || 'Insufficient gems for approval'
        };
      }

      // STEP 4: Get current milestone for new agent gem allocation
      const currentMilestone = await this.subscriptionService.getCurrentMilestone();
      if (!currentMilestone.success || !currentMilestone.data) {
        // Rollback gem deduction
        await this.franchiseService.refundGems({
          transaction_id: gemDeductionResult.data.transaction.id,
          reason: 'No active milestone - approval cancelled'
        });
        
        return {
          success: false,
          error: 'No active milestone for new agent'
        };
      }

      // STEP 5: Allocate gems to new neighborhood agent
      const agentGemAllocation = await this.franchiseService.allocateGemsToNewAgent({
        agent_id: request.application_id,
        amount: currentMilestone.data.monthly_gem_quota,
        transaction_type: 'subscription_allocation',
        source_transaction_id: gemDeductionResult.data.transaction.id
      });

      if (!agentGemAllocation.success) {
        // Rollback gem deduction
        await this.franchiseService.refundGems({
          transaction_id: gemDeductionResult.data.transaction.id,
          reason: 'Failed to allocate gems to new agent'
        });
        
        return {
          success: false,
          error: agentGemAllocation.error || 'Failed to allocate gems to new agent'
        };
      }

      // STEP 6: Activate neighborhood agent
      const activationResult = await this.franchiseService.activateApprovedAgent({
        application_id: request.application_id,
        gems_allocated: currentMilestone.data.monthly_gem_quota,
        approver_id: request.approver_id,
        approval_notes: request.approval_notes
      });

      if (!activationResult.success || !activationResult.data) {
        // Rollback all operations
        await this.franchiseService.refundGems({
          transaction_id: gemDeductionResult.data.transaction.id,
          reason: 'Agent activation failed - full rollback'
        });
        
        return {
          success: false,
          error: activationResult.error || 'Failed to activate neighborhood agent'
        };
      }

      return {
        success: true,
        data: {
          agent_profile: activationResult.data,
          gems_cost: gemCost,
          gems_allocated: currentMilestone.data.monthly_gem_quota,
          regional_partner_remaining_gems: gemDeductionResult.data.remaining_balance,
          approval_transaction: gemDeductionResult.data.transaction
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

interface RegionalPartnerApprovalResponse {
  agent_profile: FranchiseProfile;
  subscription: any; // Subscription type
  gems_allocated: number;
  milestone: SubscriptionMilestone;
}

interface NeighborhoodAgentApprovalResponse {
  agent_profile: FranchiseProfile;
  gems_cost: number;
  gems_allocated: number;
  regional_partner_remaining_gems: number;
  approval_transaction: GemTransaction;
}

// =============================================================================
// SERVICE INTERFACES
// =============================================================================

interface FranchiseNetworkService {
  validateReferralCode(code: string): Promise<ApiResponse<any>>;
  createAgentApplication(data: any): Promise<ApiResponse<AgentApplication>>;
  getAgentIdFromReferralCode(code: string): Promise<string | undefined>;
  validateAdminPermissions(user_id: string): Promise<ApiResponse<any>>;
  validateRegionalPartnerPermissions(user_id: string): Promise<ApiResponse<any>>;
  calculateAgentApprovalCost(role: string): Promise<ApiResponse<{ cost: number }>>;
  deductGems(request: any): Promise<ApiResponse<any>>;
  refundGems(request: any): Promise<ApiResponse<any>>;
  allocateGemsToNewAgent(request: any): Promise<ApiResponse<any>>;
  activateApprovedAgent(request: any): Promise<ApiResponse<FranchiseProfile>>;
}

interface AuthenticationService {
  createInactiveUser(data: any): Promise<ApiResponse<{ user_id: string }>>;
  deleteUser(user_id: string): Promise<ApiResponse<any>>;
}

interface SubscriptionManagementService {
  getCurrentMilestone(): Promise<ApiResponse<SubscriptionMilestone>>;
  createSubscription(data: any): Promise<ApiResponse<any>>;
  cancelSubscription(subscription_id: string): Promise<ApiResponse<any>>;
}
