// DOMAIN 1: MARKETING TOOLS - Core Types
// This domain handles all customer-facing marketing tools and engagement

import { TimestampFields } from '@shared/types/common';

// =============================================================================
// CAMPAIGN TYPES
// =============================================================================

export interface Campaign extends TimestampFields {
  id: string;
  name: string;
  business_name: string;
  description: string;
  status: CampaignStatus;
  type: CampaignType;
  agent_id: string; // References franchise domain
  
  // Tool-specific configuration
  tool_config: ToolConfiguration;
  
  // Engagement metrics
  views: number;
  interactions: number;
  conversion_rate: number;
  
  // Campaign settings
  start_date: string;
  end_date: string;
  target_audience: CampaignAudience;
  rules: CampaignRules;
}

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type CampaignType = 'scratch_win' | 'social_contest' | 'loyalty_program' | 'quiz_game';
export type CampaignAudience = 'all' | 'new_customers' | 'returning_customers';

export interface CampaignRules {
  max_plays_per_user: number;
  min_plays_to_win: number;
  cooldown_minutes: number;
  free_scratch_limit?: number;
  urgency_prizes_threshold?: number;
  auto_approve_campaigns?: boolean;
}

// =============================================================================
// TOOL CONFIGURATION TYPES
// =============================================================================

export interface ToolConfiguration {
  type: CampaignType;
  settings: ScratchWinConfig | SocialContestConfig | LoyaltyConfig | QuizConfig;
}

export interface ScratchWinConfig {
  scratch_threshold: number; // Percentage to reveal
  background_color: string;
  overlay_pattern: string;
  win_animation: string;
  prizes: PrizeConfiguration[];
}

export interface SocialContestConfig {
  entry_methods: ('share' | 'follow' | 'comment' | 'tag_friends')[];
  voting_enabled: boolean;
  duration_days: number;
}

export interface LoyaltyConfig {
  points_per_action: number;
  reward_tiers: RewardTier[];
  expiry_days: number;
}

export interface QuizConfig {
  questions: QuizQuestion[];
  time_limit_seconds: number;
  pass_threshold: number;
}

// =============================================================================
// PRIZE & REWARD TYPES
// =============================================================================

export interface PrizeConfiguration extends TimestampFields {
  id: string;
  campaign_id: string;
  type: PrizeType;
  title: string;
  description: string;
  value: string;
  quantity: number;
  remaining: number;
  win_probability: number;
  redemption_instructions: string;
  expiry_date?: string;
}

export type PrizeType = 'discount' | 'free_item' | 'gift_card' | 'experience' | 'cashback';

export interface RewardTier {
  tier_name: string;
  points_required: number;
  benefits: string[];
  tier_color: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

// =============================================================================
// CUSTOMER ENGAGEMENT TYPES
// =============================================================================

export interface CustomerInteraction extends TimestampFields {
  id: string;
  campaign_id: string;
  customer_identifier: string; // Email, phone, or anonymous ID
  interaction_type: InteractionType;
  result: InteractionResult;
  metadata: Record<string, any>;
}

export type InteractionType = 'view' | 'play' | 'win' | 'share' | 'follow' | 'redeem';

export interface InteractionResult {
  status: 'win' | 'loss' | 'cooldown' | 'ineligible' | 'no_prizes_left' | 'paused';
  prize?: PrizeConfiguration;
  message?: string;
  next_play_available?: string;
}

export interface FollowRelationship extends TimestampFields {
  id: string;
  customer_identifier: string;
  entity_type: 'business' | 'agent';
  entity_id: string;
  notification_preferences: NotificationPreferences;
}

export interface NotificationPreferences {
  new_campaigns: boolean;
  prize_alerts: boolean;
  special_offers: boolean;
  weekly_digest: boolean;
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

export interface CampaignAnalytics {
  campaign_id: string;
  period: AnalyticsPeriod;
  metrics: {
    total_views: number;
    unique_visitors: number;
    total_plays: number;
    total_wins: number;
    conversion_rate: number;
    prize_redemption_rate: number;
    social_shares: number;
    new_followers: number;
  };
  demographics: {
    age_groups: Record<string, number>;
    geographic_distribution: Record<string, number>;
    device_types: Record<string, number>;
  };
}

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'campaign_lifetime';
