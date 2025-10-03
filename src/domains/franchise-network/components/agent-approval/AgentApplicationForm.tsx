/**
 * Agent Application Form
 * Form for potential agents to submit their applications
 */

import React, { useState } from 'react';
import { agentApprovalWorkflowService } from '../../services/agent-approval-workflow.service';
import { supabase } from '../../../shared-kernel/supabase/client';

interface ApplicationFormData {
  personal_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    date_of_birth: string;
    linkedin_url?: string;
  };
  experience_info: {
    years_experience: number;
    previous_roles: string;
    marketing_experience: boolean;
    sales_experience: boolean;
    business_ownership: boolean;
    relevant_skills: string[];
    education_level: string;
    certifications?: string;
  };
  business_plan: {
    business_name?: string;
    target_market: string;
    marketing_strategy: string;
    projected_revenue: string;
    time_commitment: 'part-time' | 'full-time';
    investment_capacity: 'low' | 'medium' | 'high';
    territory_preference: string;
    team_size_goal: number;
    why_offerly: string;
  };
  referral_code?: string;
}

export const AgentApplicationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormData>({
    personal_info: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      date_of_birth: '',
      linkedin_url: ''
    },
    experience_info: {
      years_experience: 0,
      previous_roles: '',
      marketing_experience: false,
      sales_experience: false,
      business_ownership: false,
      relevant_skills: [],
      education_level: '',
      certifications: ''
    },
    business_plan: {
      business_name: '',
      target_market: '',
      marketing_strategy: '',
      projected_revenue: '',
      time_commitment: 'part-time',
      investment_capacity: 'low',
      territory_preference: '',
      team_size_goal: 1,
      why_offerly: ''
    },
    referral_code: ''
  });
  const [selectedRole, setSelectedRole] = useState<'regional_partner' | 'neighborhood_agent'>('neighborhood_agent');

  const steps = [
    { id: 1, title: 'Role Selection', description: 'Choose your preferred role' },
    { id: 2, title: 'Personal Information', description: 'Basic contact details' },
    { id: 3, title: 'Experience & Skills', description: 'Your background and expertise' },
    { id: 4, title: 'Business Plan', description: 'Your vision and strategy' },
    { id: 5, title: 'Review & Submit', description: 'Final review before submission' }
  ];

  const skillOptions = [
    'Digital Marketing', 'Social Media Management', 'Content Creation', 
    'Email Marketing', 'SEO/SEM', 'Analytics', 'Customer Service',
    'Sales', 'Business Development', 'Event Planning', 'Photography',
    'Graphic Design', 'Writing', 'Public Speaking', 'Team Leadership'
  ];

  const updateFormData = (section: keyof ApplicationFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateSkills = (skill: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      experience_info: {
        ...prev.experience_info,
        relevant_skills: checked 
          ? [...prev.experience_info.relevant_skills, skill]
          : prev.experience_info.relevant_skills.filter(s => s !== skill)
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return selectedRole !== null;
      case 2:
        const personal = formData.personal_info;
        return !!(personal.first_name && personal.last_name && personal.email && 
                 personal.phone && personal.city && personal.state);
      case 3:
        const experience = formData.experience_info;
        return !!(experience.years_experience >= 0 && experience.previous_roles && 
                 experience.education_level);
      case 4:
        const business = formData.business_plan;
        return !!(business.target_market && business.marketing_strategy && 
                 business.why_offerly && business.territory_preference);
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to submit an application');
      }

      // Submit application
      await agentApprovalWorkflowService.submitApplication(
        user.id,
        selectedRole,
        formData
      );

      setSuccess(true);

    } catch (err) {
      console.error('Failed to submit application:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      setError('Please fill in all required fields before continuing');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in becoming a {selectedRole.replace('_', ' ')}. 
            We'll review your application and get back to you within 7 business days.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You'll receive updates via email as your application progresses through our review process.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Agent Application</h1>
          <p className="mt-2 text-gray-600">Join the Offerly network and help local businesses grow</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ml-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Step 1: Role Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    onClick={() => setSelectedRole('neighborhood_agent')}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedRole === 'neighborhood_agent'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-3">🏪</div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Neighborhood Agent</h4>
                    <p className="text-gray-600 mb-4">
                      Work directly with local businesses to create marketing campaigns
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 1000 gem investment required</li>
                      <li>• Commission-based earnings</li>
                      <li>• Flexible schedule</li>
                      <li>• Direct client relationships</li>
                    </ul>
                  </div>

                  <div
                    onClick={() => setSelectedRole('regional_partner')}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedRole === 'regional_partner'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-3">🏢</div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Regional Partner</h4>
                    <p className="text-gray-600 mb-4">
                      Manage a team of agents and oversee a geographic territory
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 5000 gem investment required</li>
                      <li>• Revenue sharing model</li>
                      <li>• Team management responsibilities</li>
                      <li>• Territory exclusivity</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Referral Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.referral_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, referral_code: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter referral code if you have one"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter a referral code from an existing agent for priority review
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.personal_info.first_name}
                    onChange={(e) => updateFormData('personal_info', 'first_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.personal_info.last_name}
                    onChange={(e) => updateFormData('personal_info', 'last_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.personal_info.email}
                    onChange={(e) => updateFormData('personal_info', 'email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.personal_info.phone}
                    onChange={(e) => updateFormData('personal_info', 'phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.personal_info.address}
                    onChange={(e) => updateFormData('personal_info', 'address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.personal_info.city}
                    onChange={(e) => updateFormData('personal_info', 'city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.personal_info.state}
                    onChange={(e) => updateFormData('personal_info', 'state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.personal_info.linkedin_url}
                    onChange={(e) => updateFormData('personal_info', 'linkedin_url', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Continue with other steps... */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Experience & Skills</h3>
              {/* Experience form fields would go here */}
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">🎯</div>
                <p>Experience and skills form would be implemented here</p>
                <p className="text-sm">Including years of experience, skills checklist, education, etc.</p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Business Plan</h3>
              {/* Business plan form fields would go here */}
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📈</div>
                <p>Business plan form would be implemented here</p>
                <p className="text-sm">Including target market, strategy, projections, etc.</p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Review & Submit</h3>
              {/* Review summary would go here */}
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📋</div>
                <p>Application review summary would be displayed here</p>
                <p className="text-sm">Final check before submission</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};