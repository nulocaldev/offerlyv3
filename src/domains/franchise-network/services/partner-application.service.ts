import { supabase } from '@/shared-kernel/infrastructure/supabase/supabase-client';
import { 
  PartnerApplicationRequest, 
  PartnerApplicationResponse,
  PendingPartnerApplication
} from '../types/partner-application.types';

export class PartnerApplicationService {
  /**
   * Submit a new regional partner application
   */
  async submitApplication(application: PartnerApplicationRequest): Promise<PartnerApplicationResponse> {
    try {
      // Check if email already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', application.email)
        .single();

      if (existingProfile) {
        throw new Error('An application with this email already exists');
      }

      // Create the profile with pending status
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          email: application.email,
          first_name: application.firstName,
          last_name: application.lastName,
          phone: application.phone,
          role: 'regional_partner',
          status: 'pending',
          business_name: application.businessName,
          business_address: application.businessAddress,
          city: application.city,
          state: application.state,
          zip_code: application.zipCode,
          marketing_experience: application.marketingExperience,
          business_experience: application.businessExperience,
          has_team: application.hasTeam,
          team_size: application.teamSize,
          investment_capacity: application.investmentCapacity,
          time_commitment: application.timeCommitment,
          preferred_territory: application.preferredTerritory,
          territory_justification: application.territoryJustification,
          motivation: application.motivation,
          additional_notes: application.additionalNotes,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting partner application:', error);
        throw new Error('Failed to submit application. Please try again.');
      }

      return {
        id: profile.id,
        status: 'pending',
        submittedAt: profile.created_at
      };
    } catch (error) {
      console.error('Partner application submission error:', error);
      throw error instanceof Error ? error : new Error('Failed to submit application');
    }
  }

  /**
   * Get all pending partner applications (Admin only)
   */
  async getPendingApplications(): Promise<PendingPartnerApplication[]> {
    try {
      const { data: applications, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'regional_partner')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending applications:', error);
        throw new Error('Failed to fetch pending applications');
      }

      return applications?.map(app => ({
        id: app.id,
        firstName: app.first_name,
        lastName: app.last_name,
        email: app.email,
        phone: app.phone,
        businessName: app.business_name,
        businessAddress: app.business_address,
        city: app.city,
        state: app.state,
        zipCode: app.zip_code,
        marketingExperience: app.marketing_experience,
        businessExperience: app.business_experience,
        hasTeam: app.has_team,
        teamSize: app.team_size,
        investmentCapacity: app.investment_capacity,
        timeCommitment: app.time_commitment,
        preferredTerritory: app.preferred_territory,
        territoryJustification: app.territory_justification,
        motivation: app.motivation,
        additionalNotes: app.additional_notes,
        submittedAt: app.created_at,
        status: app.status
      })) || [];
    } catch (error) {
      console.error('Get pending applications error:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch applications');
    }
  }

  /**
   * Approve a partner application
   */
  async approveApplication(applicationId: string, reviewNotes?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', applicationId)
        .eq('role', 'regional_partner');

      if (error) {
        console.error('Error approving application:', error);
        throw new Error('Failed to approve application');
      }
    } catch (error) {
      console.error('Approve application error:', error);
      throw error instanceof Error ? error : new Error('Failed to approve application');
    }
  }

  /**
   * Reject a partner application
   */
  async rejectApplication(applicationId: string, reviewNotes?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', applicationId)
        .eq('role', 'regional_partner');

      if (error) {
        console.error('Error rejecting application:', error);
        throw new Error('Failed to reject application');
      }
    } catch (error) {
      console.error('Reject application error:', error);
      throw error instanceof Error ? error : new Error('Failed to reject application');
    }
  }
}