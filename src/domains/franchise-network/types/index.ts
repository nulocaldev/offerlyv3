// DOMAIN 2: FRANCHISE NETWORK - Core Types
// This domain handles the business model, agent hierarchy, and monetization

import { User, TimestampFields } from '@shared/types/common';

// =============================================================================
// AGENT HIERARCHY TYPES
// =============================================================================

export interface FranchiseProfile extends User, TimestampFields {
  display_name: string;
  mobile_number: string;
  location: LocationData;
  social_handles: SocialHandles;
  
  // Franchise-specific fields
  referral_agent_id?: string; // Who recruited this agent
  territory?: TerritoryData;
  
  // Payment tracking
  payment_collected: boolean;
  payment_amount?: number;
  payment_method?: string;
  payment_received_at?: string;
  partner_notes?: string;
}

export interface LocationData {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

export interface SocialHandles {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

export interface TerritoryData {
  name: string;
  boundaries: GeographicBoundary[];
  population_estimate?: number;
  market_potential?: string;
}

export interface GeographicBoundary {
  latitude: number;
  longitude: number;
}

// =============================================================================
// GEM ECONOMY TYPES
// =============================================================================

export interface GemBalance {
  user_id: string;
  total_gems: number;
  allocated_gems: number; // From subscription quota
  purchased_gems: number; // Additional bought gems
  commission_gems: number; // Earned through referrals
  last_updated: string;
}

export interface GemTransaction extends TimestampFields {
  id: string;
  sender_id?: string;
  recipient_id: string;
  amount: number;
  transaction_type: GemTransactionType;
  status: TransactionStatus;
  reason: string;
  metadata: Record<string, any>;
}

export type GemTransactionType = 
  | 'subscription_allocation'    // Monthly gem quota from subscription
  | 'agent_approval'            // Gems spent to approve new agent
  | 'campaign_creation'         // Gems spent on marketing tools
  | 'add_on_purchase'           // Additional gems purchased
  | 'manual_transfer'           // Direct transfer between users
  | 'commission_earned'         // Gems earned from referrals
  | 'refund'                    // Gem refund
  | 'admin_adjustment';         // Admin-initiated adjustment

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface GemPackage extends TimestampFields {
  id: string;
  name: string;
  gem_amount: number;
  price_usd: number;
  bonus_percentage: number;
  target_audience: ('regional_partner' | 'neighborhood_agent')[];
  is_active: boolean;
  description?: string;
}

// =============================================================================
// SUBSCRIPTION MANAGEMENT TYPES
// =============================================================================

export interface SubscriptionMilestone extends TimestampFields {
  id: string;
  name: string;
  description: string;
  
  // Availability
  spots_allocated: number;
  spots_remaining: number;
  
  // Pricing
  monthly_price: number; // in USD cents
  trial_price: number; // in USD cents
  
  // Gem allocation
  monthly_gem_quota: number;
  bonus_gems: number;
  
  // Settings
  is_active: boolean;
  order_index: number;
  auto_progress: boolean;
}

export interface Subscription extends TimestampFields {
  id: string;
  subscriber_id: string;
  milestone_id: string;
  
  // Subscription details
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  start_date: string;
  end_date?: string;
  
  // Payment info
  amount_paid: number;
  currency: string;
  payment_method: string;
  next_billing_date: string;
  
  // Gem allocation tracking
  monthly_gem_quota: number;
  gems_used_this_cycle: number;
  last_gem_allocation: string;
}

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

// =============================================================================
// AGENT MANAGEMENT TYPES
// =============================================================================

export interface AgentApplication extends TimestampFields {
  id: string;
  applicant_email: string;
  role_applied_for: 'regional_partner' | 'neighborhood_agent';
  
  // Application data
  personal_info: ApplicationPersonalInfo;
  experience_info: ApplicationExperienceInfo;
  business_plan: ApplicationBusinessPlan;
  
  // Processing
  status: ApplicationStatus;
  reviewer_id?: string;
  review_notes?: string;
  referral_code?: string; // For neighborhood agents
  
  // Requirements
  required_gem_cost?: number;
  milestone_id?: string;
}

export interface ApplicationPersonalInfo {
  display_name: string;
  mobile_number: string;
  location: LocationData;
  social_handles: SocialHandles;
  photo_url?: string;
}

export interface ApplicationExperienceInfo {
  years_experience: number;
  previous_roles: string[];
  skills: string[];
  why_interested: string;
  availability: string;
}

export interface ApplicationBusinessPlan {
  target_market: string;
  marketing_strategy: string;
  growth_goals: string;
  investment_capacity: number;
  timeline: string;
}

export type ApplicationStatus = 
  | 'pending'           // Awaiting review
  | 'under_review'      // Being evaluated
  | 'approved'          // Approved, awaiting payment
  | 'rejected'          // Application denied
  | 'payment_pending'   // Waiting for subscription payment
  | 'active';           // Fully onboarded

// =============================================================================
// SERVICE PRICING TYPES
// =============================================================================

export interface ServicePricing extends TimestampFields {
  id: string;
  agent_id: string;
  service_type: ServiceType;
  
  // Pricing tiers
  price_per_hour: number;
  price_per_campaign: number;
  price_per_month: number;
  
  // Service details
  service_description: string;
  included_features: string[];
  additional_fees: AdditionalFee[];
  
  // Settings
  is_active: boolean;
  minimum_commitment?: string;
  payment_terms: string;
}

export type ServiceType = 
  | 'campaign_creation'     // Creating marketing campaigns
  | 'campaign_management'   // Ongoing campaign management
  | 'social_media'          // Social media management
  | 'analytics_reporting'   // Performance reporting
  | 'consultation'          // Business consultation
  | 'full_service';         // Complete marketing package

export interface AdditionalFee {
  name: string;
  description: string;
  amount: number;
  type: 'fixed' | 'percentage';
  applies_to: string;
}

// =============================================================================
// TERRITORY MANAGEMENT TYPES
// =============================================================================

export interface Territory extends TimestampFields {
  id: string;
  name: string;
  regional_partner_id: string;
  
  // Geographic data
  boundaries: GeographicBoundary[];
  zip_codes: string[];
  cities: string[];
  
  // Market data
  population_estimate: number;
  business_count_estimate: number;
  market_saturation: MarketSaturation;
  
  // Agent limits
  max_agents: number;
  current_agent_count: number;
  
  // Performance
  monthly_revenue: number;
  growth_rate: number;
}

export type MarketSaturation = 'low' | 'medium' | 'high' | 'saturated';

export interface TerritoryAssignment extends TimestampFields {
  id: string;
  territory_id: string;
  agent_id: string;
  assignment_type: 'exclusive' | 'shared' | 'temporary';
  start_date: string;
  end_date?: string;
  performance_metrics: TerritoryPerformance;
}

export interface TerritoryPerformance {
  clients_acquired: number;
  campaigns_created: number;
  revenue_generated: number;
  customer_satisfaction: number;
  market_penetration: number;
}
