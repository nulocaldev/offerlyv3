// Regional Partner Application Types
export interface PartnerApplicationRequest {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Business Information
  businessName?: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Experience & Background
  marketingExperience: number; // years
  businessExperience: number; // years
  hasTeam: boolean;
  teamSize?: number;
  
  // Investment & Commitment
  investmentCapacity: 'low' | 'medium' | 'high';
  timeCommitment: 'part-time' | 'full-time';
  
  // Territory Preferences
  preferredTerritory: string;
  territoryJustification: string;
  
  // Additional Information
  motivation: string;
  additionalNotes?: string;
}

export interface PartnerApplicationResponse {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface PendingPartnerApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName?: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  marketingExperience: number;
  businessExperience: number;
  hasTeam: boolean;
  teamSize?: number;
  investmentCapacity: string;
  timeCommitment: string;
  preferredTerritory: string;
  territoryJustification: string;
  motivation: string;
  additionalNotes?: string;
  submittedAt: string;
  status: string;
}