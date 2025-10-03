/**
 * Scratch-and-Win Campaign Types
 * Marketing Tools Domain
 */

export interface ScratchCampaignConfig {
  id: string;
  campaign_id: string;
  
  // Visual Design
  card_design: {
    background_color: string;
    scratch_color: string;
    text_color: string;
    accent_color: string;
    card_shape: 'rounded' | 'square' | 'circular';
    animation_style: 'fade' | 'slide' | 'bounce';
  };
  brand_assets: {
    logo_url?: string;
    background_image?: string;
    custom_css?: string;
  };
  
  // Game Mechanics
  total_cards: number;
  card_pattern: Record<string, any>;
  scratch_area_size: number; // percentage
  
  // User Experience
  win_message: string;
  lose_message: string;
  instruction_text: string;
  
  // Analytics
  track_geolocation: boolean;
  track_device_info: boolean;
  track_user_behavior: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface ScratchCard {
  id: string;
  campaign_id: string;
  card_number: number;
  is_winner: boolean;
  prize_id?: string;
  is_scratched: boolean;
  scratched_at?: string;
  scratched_by?: string;
  security_hash: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ScratchPlaySession {
  id: string;
  campaign_id: string;
  scratch_card_id: string;
  
  // Player Info
  player_identifier: string;
  player_email?: string;
  player_phone?: string;
  
  // Session Tracking
  start_time: string;
  scratch_completion_time?: string;
  total_duration_ms?: number;
  
  // Interaction Data
  scratch_positions: Array<{ x: number; y: number; timestamp: number }>;
  scratch_percentage: number;
  device_info: Record<string, any>;
  
  // Results
  result_revealed: boolean;
  prize_claimed: boolean;
  claim_code?: string;
  
  created_at: string;
}

export interface ScratchCampaignMetrics {
  id: string;
  campaign_id: string;
  date: string;
  
  // Engagement
  total_views: number;
  total_starts: number;
  total_completes: number;
  total_winners: number;
  total_claims: number;
  
  // Performance
  completion_rate: number;
  win_rate: number;
  claim_rate: number;
  avg_completion_time_ms: number;
  
  // Demographics
  top_devices: Array<{ device: string; count: number }>;
  top_locations: Array<{ location: string; count: number }>;
  peak_hours: Array<{ hour: number; activity: number }>;
  
  created_at: string;
}

export interface Prize {
  id: string;
  campaign_id: string;
  type: 'discount' | 'free_item' | 'gift_card' | 'experience' | 'cashback';
  title: string;
  description?: string;
  value: string;
  quantity: number;
  remaining: number;
  win_probability: number;
  redemption_instructions?: string;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateScratchCampaignRequest {
  // Basic Campaign Info
  name: string;
  business_name: string;
  description?: string;
  
  // Scratch Configuration
  total_cards: number;
  card_design: ScratchCampaignConfig['card_design'];
  brand_assets?: ScratchCampaignConfig['brand_assets'];
  
  // Prizes
  prizes: Array<{
    type: Prize['type'];
    title: string;
    description?: string;
    value: string;
    quantity: number;
    win_probability: number;
    redemption_instructions?: string;
    expiry_date?: string;
  }>;
  
  // Campaign Settings
  start_date?: string;
  end_date?: string;
  
  // Customization
  win_message?: string;
  lose_message?: string;
  instruction_text?: string;
}

export interface ScratchGameState {
  campaign: {
    id: string;
    name: string;
    business_name: string;
    description?: string;
  };
  config: ScratchCampaignConfig;
  current_card?: ScratchCard;
  session?: ScratchPlaySession;
  is_loading: boolean;
  is_scratching: boolean;
  is_revealed: boolean;
  scratch_progress: number;
  result?: {
    is_winner: boolean;
    prize?: Prize;
    message: string;
  };
}