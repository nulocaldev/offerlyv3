/**
 * Agent Approval Workflow Service
 * Handles the complete lifecycle of agent applications from submission to onboarding
 */

import { supabase } from '../../../shared-kernel/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface AgentApplication {
  id: string;
  applicant_id: string;
  role_applied_for: 'regional_partner' | 'neighborhood_agent';
  personal_info: any;
  experience_info: any;
  business_plan: any;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'payment_pending' | 'active';
  reviewer_id?: string;
  review_notes?: string;
  referral_code?: string;
  referral_agent_id?: string;
  required_gem_cost?: number;
  milestone_id?: string;
  priority_level: number;
  review_deadline?: string;
  application_score?: number;
  background_check_status: 'pending' | 'approved' | 'failed' | 'not_required';
  interview_scheduled?: string;
  interview_completed: boolean;
  interview_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationHistory {
  id: string;
  application_id: string;
  previous_status?: string;
  new_status: string;
  changed_by?: string;
  change_reason?: string;
  additional_notes?: string;
  metadata: any;
  created_at: string;
}

export interface ApplicationAssignment {
  id: string;
  application_id: string;
  assigned_to: string;
  assigned_by?: string;
  assignment_type: 'primary_reviewer' | 'secondary_reviewer' | 'interviewer' | 'decision_maker';
  status: 'assigned' | 'in_progress' | 'completed' | 'reassigned';
  due_date?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationNotification {
  id: string;
  application_id: string;
  recipient_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  sent_via_email: boolean;
  sent_via_sms: boolean;
  metadata: any;
  created_at: string;
  read_at?: string;
}

export interface ApplicationTemplate {
  id: string;
  role_type: 'regional_partner' | 'neighborhood_agent';
  template_name: string;
  template_version: number;
  required_fields: string[];
  evaluation_criteria: any;
  scoring_rubric: any;
  auto_approval_threshold?: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export class AgentApprovalWorkflowService {
  private static instance: AgentApprovalWorkflowService;

  static getInstance(): AgentApprovalWorkflowService {
    if (!AgentApprovalWorkflowService.instance) {
      AgentApprovalWorkflowService.instance = new AgentApprovalWorkflowService();
    }
    return AgentApprovalWorkflowService.instance;
  }

  /**
   * Submit a new agent application
   */
  async submitApplication(
    applicantId: string,
    roleAppliedFor: 'regional_partner' | 'neighborhood_agent',
    applicationData: {
      personal_info: any;
      experience_info: any;
      business_plan: any;
      referral_code?: string;
    }
  ): Promise<AgentApplication> {
    try {
      // Find referral agent if code provided
      let referralAgentId: string | undefined;
      if (applicationData.referral_code) {
        const { data: referralAgent } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', applicationData.referral_code)
          .single();
        
        referralAgentId = referralAgent?.id;
      }

      // Calculate required gem cost based on role
      const requiredGemCost = roleAppliedFor === 'regional_partner' ? 5000 : 1000;

      // Set initial priority based on referral
      const priorityLevel = referralAgentId ? 2 : 1; // Higher priority for referred applicants

      // Set review deadline (7 days from now)
      const reviewDeadline = new Date();
      reviewDeadline.setDate(reviewDeadline.getDate() + 7);

      // Create the application
      const { data, error } = await supabase
        .from('agent_applications')
        .insert({
          applicant_id: applicantId,
          role_applied_for: roleAppliedFor,
          personal_info: applicationData.personal_info,
          experience_info: applicationData.experience_info,
          business_plan: applicationData.business_plan,
          referral_code: applicationData.referral_code,
          referral_agent_id: referralAgentId,
          required_gem_cost: requiredGemCost,
          priority_level: priorityLevel,
          review_deadline: reviewDeadline.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Log application submission
      await this.logApplicationHistory(
        data.id,
        undefined,
        'pending',
        applicantId,
        'Application submitted',
        'Initial application submission'
      );

      // Send notification to applicant
      await this.createNotification(
        data.id,
        applicantId,
        'application_received',
        'Application Received',
        'Thank you for your application! We\'ll review it within 7 business days.'
      );

      // Auto-assign to available reviewers
      await this.autoAssignReviewers(data.id, roleAppliedFor);

      return data as AgentApplication;
    } catch (error) {
      console.error('Failed to submit application:', error);
      throw new Error('Failed to submit application');
    }
  }

  /**
   * Get applications for review (for partners/admins)
   */
  async getApplicationsForReview(
    reviewerId: string,
    filters?: {
      status?: string;
      role?: string;
      priority?: number;
      assignedToMe?: boolean;
    }
  ): Promise<AgentApplication[]> {
    try {
      let query = supabase
        .from('agent_applications')
        .select(`
          *,
          applicant:applicant_id (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          referral_agent:referral_agent_id (
            id,
            first_name,
            last_name,
            business_name
          )
        `);

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.role) {
        query = query.eq('role_applied_for', filters.role);
      }
      if (filters?.priority) {
        query = query.gte('priority_level', filters.priority);
      }

      // Filter by assignments if requested
      if (filters?.assignedToMe) {
        const { data: assignments } = await supabase
          .from('agent_application_assignments')
          .select('application_id')
          .eq('assigned_to', reviewerId)
          .in('status', ['assigned', 'in_progress']);

        if (assignments) {
          const applicationIds = assignments.map(a => a.application_id);
          query = query.in('id', applicationIds);
        }
      }

      const { data, error } = await query.order('priority_level', { ascending: false })
                                    .order('created_at', { ascending: true });

      if (error) throw error;
      return data as AgentApplication[];
    } catch (error) {
      console.error('Failed to get applications:', error);
      throw new Error('Failed to load applications');
    }
  }

  /**
   * Update application status with workflow management
   */
  async updateApplicationStatus(
    applicationId: string,
    newStatus: AgentApplication['status'],
    reviewerId: string,
    notes?: string,
    additionalData?: any
  ): Promise<void> {
    try {
      // Get current application
      const { data: currentApp } = await supabase
        .from('agent_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (!currentApp) throw new Error('Application not found');

      // Update application
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'under_review') {
        updateData.reviewer_id = reviewerId;
      }

      if (notes) {
        updateData.review_notes = notes;
      }

      // Add additional data
      if (additionalData) {
        Object.assign(updateData, additionalData);
      }

      const { error } = await supabase
        .from('agent_applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) throw error;

      // Log status change
      await this.logApplicationHistory(
        applicationId,
        currentApp.status,
        newStatus,
        reviewerId,
        notes || `Status changed to ${newStatus}`,
        notes
      );

      // Send appropriate notifications
      await this.sendStatusUpdateNotifications(applicationId, newStatus, currentApp.applicant_id);

      // Handle specific status workflows
      await this.handleStatusWorkflow(applicationId, newStatus, currentApp);

    } catch (error) {
      console.error('Failed to update application status:', error);
      throw new Error('Failed to update application status');
    }
  }

  /**
   * Score an application based on evaluation criteria
   */
  async scoreApplication(
    applicationId: string,
    scoringData: {
      experience_score: number;
      business_plan_score: number;
      interview_score?: number;
      background_check_score?: number;
      overall_notes?: string;
    },
    reviewerId: string
  ): Promise<number> {
    try {
      // Calculate weighted score (out of 100)
      const weights = {
        experience: 0.3,
        business_plan: 0.4,
        interview: 0.2,
        background_check: 0.1
      };

      let totalScore = 
        (scoringData.experience_score * weights.experience) +
        (scoringData.business_plan_score * weights.business_plan);

      if (scoringData.interview_score !== undefined) {
        totalScore += scoringData.interview_score * weights.interview;
      }

      if (scoringData.background_check_score !== undefined) {
        totalScore += scoringData.background_check_score * weights.background_check;
      }

      const finalScore = Math.round(totalScore);

      // Update application with score
      const { error } = await supabase
        .from('agent_applications')
        .update({
          application_score: finalScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Log scoring activity
      await this.logApplicationHistory(
        applicationId,
        undefined,
        undefined,
        reviewerId,
        `Application scored: ${finalScore}/100`,
        scoringData.overall_notes
      );

      // Check for auto-approval
      await this.checkAutoApproval(applicationId, finalScore);

      return finalScore;
    } catch (error) {
      console.error('Failed to score application:', error);
      throw new Error('Failed to score application');
    }
  }

  /**
   * Schedule an interview for an application
   */
  async scheduleInterview(
    applicationId: string,
    interviewDate: string,
    interviewerId: string,
    notes?: string
  ): Promise<void> {
    try {
      // Update application
      const { error } = await supabase
        .from('agent_applications')
        .update({
          interview_scheduled: interviewDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Create interviewer assignment
      await this.createAssignment(
        applicationId,
        interviewerId,
        'interviewer',
        interviewDate,
        notes
      );

      // Get applicant info for notification
      const { data: application } = await supabase
        .from('agent_applications')
        .select('applicant_id')
        .eq('id', applicationId)
        .single();

      if (application) {
        await this.createNotification(
          applicationId,
          application.applicant_id,
          'interview_scheduled',
          'Interview Scheduled',
          `Your interview has been scheduled for ${new Date(interviewDate).toLocaleDateString()}. You\'ll receive additional details soon.`
        );
      }

      // Log interview scheduling
      await this.logApplicationHistory(
        applicationId,
        undefined,
        undefined,
        interviewerId,
        'Interview scheduled',
        `Interview scheduled for ${interviewDate}. ${notes || ''}`
      );

    } catch (error) {
      console.error('Failed to schedule interview:', error);
      throw new Error('Failed to schedule interview');
    }
  }

  /**
   * Complete interview and record results
   */
  async completeInterview(
    applicationId: string,
    interviewerId: string,
    interviewScore: number,
    interviewNotes: string
  ): Promise<void> {
    try {
      // Update application
      const { error } = await supabase
        .from('agent_applications')
        .update({
          interview_completed: true,
          interview_notes: interviewNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Update assignment as completed
      await supabase
        .from('agent_application_assignments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes: interviewNotes
        })
        .eq('application_id', applicationId)
        .eq('assigned_to', interviewerId)
        .eq('assignment_type', 'interviewer');

      // Update application score with interview component
      await this.scoreApplication(
        applicationId,
        {
          experience_score: 0, // These would be retrieved from existing scoring
          business_plan_score: 0,
          interview_score: interviewScore
        },
        interviewerId
      );

      // Log interview completion
      await this.logApplicationHistory(
        applicationId,
        undefined,
        undefined,
        interviewerId,
        'Interview completed',
        `Interview score: ${interviewScore}/100. Notes: ${interviewNotes}`
      );

    } catch (error) {
      console.error('Failed to complete interview:', error);
      throw new Error('Failed to complete interview');
    }
  }

  /**
   * Get application history and timeline
   */
  async getApplicationHistory(applicationId: string): Promise<ApplicationHistory[]> {
    try {
      const { data, error } = await supabase
        .from('agent_application_history')
        .select(`
          *,
          changed_by_user:changed_by (
            id,
            first_name,
            last_name,
            role
          )
        `)
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ApplicationHistory[];
    } catch (error) {
      console.error('Failed to get application history:', error);
      throw new Error('Failed to load application history');
    }
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    includeRead: boolean = false
  ): Promise<ApplicationNotification[]> {
    try {
      let query = supabase
        .from('agent_application_notifications')
        .select(`
          *,
          application:application_id (
            id,
            role_applied_for,
            status
          )
        `)
        .eq('recipient_id', userId);

      if (!includeRead) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as ApplicationNotification[];
    } catch (error) {
      console.error('Failed to get notifications:', error);
      throw new Error('Failed to load notifications');
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('agent_application_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw new Error('Failed to update notification');
    }
  }

  // Private helper methods

  private async logApplicationHistory(
    applicationId: string,
    previousStatus: string | undefined,
    newStatus: string | undefined,
    changedBy?: string,
    changeReason?: string,
    additionalNotes?: string
  ): Promise<void> {
    try {
      await supabase
        .from('agent_application_history')
        .insert({
          application_id: applicationId,
          previous_status: previousStatus,
          new_status: newStatus || previousStatus,
          changed_by: changedBy,
          change_reason: changeReason,
          additional_notes: additionalNotes
        });
    } catch (error) {
      console.error('Failed to log application history:', error);
    }
  }

  private async createNotification(
    applicationId: string,
    recipientId: string,
    notificationType: string,
    title: string,
    message: string
  ): Promise<void> {
    try {
      await supabase
        .from('agent_application_notifications')
        .insert({
          application_id: applicationId,
          recipient_id: recipientId,
          notification_type: notificationType,
          title: title,
          message: message,
          sent_via_email: true // In real app, would check user preferences
        });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  private async createAssignment(
    applicationId: string,
    assignedTo: string,
    assignmentType: ApplicationAssignment['assignment_type'],
    dueDate?: string,
    notes?: string
  ): Promise<void> {
    try {
      await supabase
        .from('agent_application_assignments')
        .insert({
          application_id: applicationId,
          assigned_to: assignedTo,
          assignment_type: assignmentType,
          due_date: dueDate,
          notes: notes
        });
    } catch (error) {
      console.error('Failed to create assignment:', error);
    }
  }

  private async autoAssignReviewers(
    applicationId: string,
    roleAppliedFor: string
  ): Promise<void> {
    try {
      // Find available reviewers (simplified - in real app would have more sophisticated logic)
      const { data: reviewers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin') // Or regional_partner for neighborhood_agent applications
        .limit(2);

      if (reviewers && reviewers.length > 0) {
        // Assign primary reviewer
        await this.createAssignment(
          applicationId,
          reviewers[0].id,
          'primary_reviewer'
        );

        // Assign secondary reviewer if available
        if (reviewers.length > 1) {
          await this.createAssignment(
            applicationId,
            reviewers[1].id,
            'secondary_reviewer'
          );
        }
      }
    } catch (error) {
      console.error('Failed to auto-assign reviewers:', error);
    }
  }

  private async sendStatusUpdateNotifications(
    applicationId: string,
    newStatus: string,
    applicantId: string
  ): Promise<void> {
    const statusMessages = {
      'under_review': 'Your application is now under review.',
      'approved': 'Congratulations! Your application has been approved.',
      'rejected': 'We regret to inform you that your application was not approved at this time.',
      'payment_pending': 'Your application is approved! Please complete payment to proceed.',
      'active': 'Welcome to the team! Your onboarding process is now starting.'
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages];
    if (message) {
      await this.createNotification(
        applicationId,
        applicantId,
        'status_update',
        `Application Status Update`,
        message
      );
    }
  }

  private async handleStatusWorkflow(
    applicationId: string,
    newStatus: string,
    application: any
  ): Promise<void> {
    switch (newStatus) {
      case 'approved':
        // Send payment instructions if gems required
        if (application.required_gem_cost > 0) {
          await this.updateApplicationStatus(
            applicationId,
            'payment_pending',
            application.reviewer_id || 'system',
            'Awaiting payment for gem cost'
          );
        }
        break;
        
      case 'active':
        // Start onboarding process
        await this.createNotification(
          applicationId,
          application.applicant_id,
          'onboarding_started',
          'Welcome to Offerly!',
          'Your onboarding process is starting. You\'ll receive setup instructions soon.'
        );
        break;
    }
  }

  private async checkAutoApproval(
    applicationId: string,
    score: number
  ): Promise<void> {
    try {
      // Get application template for auto-approval threshold
      const { data: application } = await supabase
        .from('agent_applications')
        .select('role_applied_for')
        .eq('id', applicationId)
        .single();

      if (application) {
        const { data: template } = await supabase
          .from('agent_application_templates')
          .select('auto_approval_threshold')
          .eq('role_type', application.role_applied_for)
          .eq('is_active', true)
          .single();

        if (template?.auto_approval_threshold && score >= template.auto_approval_threshold) {
          await this.updateApplicationStatus(
            applicationId,
            'approved',
            'system',
            `Auto-approved based on score: ${score}/100`
          );
        }
      }
    } catch (error) {
      console.error('Failed to check auto-approval:', error);
    }
  }
}

export const agentApprovalWorkflowService = AgentApprovalWorkflowService.getInstance();