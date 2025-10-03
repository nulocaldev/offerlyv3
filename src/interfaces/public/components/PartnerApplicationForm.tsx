import React, { useState } from 'react';
import { PartnerApplicationService } from '@/domains/franchise-network/services/partner-application.service';
import { PartnerApplicationRequest } from '@/domains/franchise-network/types/partner-application.types';

const partnerService = new PartnerApplicationService();

export const PartnerApplicationForm: React.FC = () => {
  const [formData, setFormData] = useState<PartnerApplicationRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessAddress: '',
    city: '',
    state: '',
    zipCode: '',
    marketingExperience: 0,
    businessExperience: 0,
    hasTeam: false,
    teamSize: undefined,
    investmentCapacity: 'medium',
    timeCommitment: 'full-time',
    preferredTerritory: '',
    territoryJustification: '',
    motivation: '',
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await partnerService.submitApplication(formData);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Application Submitted!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Thank you for your interest in becoming a Regional Partner. We'll review your application and get back to you within 3-5 business days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Regional Partner Application
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Join the Offerly network and help businesses in your region create engaging marketing campaigns
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8 bg-white shadow rounded-lg p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                  Business Name (Optional)
                </label>
                <input
                  type="text"
                  name="businessName"
                  id="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                  Business Address *
                </label>
                <input
                  type="text"
                  name="businessAddress"
                  id="businessAddress"
                  required
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    id="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    id="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Experience & Background */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Experience & Background</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="marketingExperience" className="block text-sm font-medium text-gray-700">
                  Marketing Experience (Years) *
                </label>
                <input
                  type="number"
                  name="marketingExperience"
                  id="marketingExperience"
                  required
                  min="0"
                  value={formData.marketingExperience}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="businessExperience" className="block text-sm font-medium text-gray-700">
                  Business Experience (Years) *
                </label>
                <input
                  type="number"
                  name="businessExperience"
                  id="businessExperience"
                  required
                  min="0"
                  value={formData.businessExperience}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="hasTeam"
                id="hasTeam"
                checked={formData.hasTeam}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hasTeam" className="ml-2 block text-sm text-gray-900">
                I have an existing team
              </label>
            </div>
            {formData.hasTeam && (
              <div>
                <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700">
                  Team Size
                </label>
                <input
                  type="number"
                  name="teamSize"
                  id="teamSize"
                  min="1"
                  value={formData.teamSize || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Investment & Commitment */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Investment & Commitment</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="investmentCapacity" className="block text-sm font-medium text-gray-700">
                  Investment Capacity *
                </label>
                <select
                  name="investmentCapacity"
                  id="investmentCapacity"
                  required
                  value={formData.investmentCapacity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low ($5K - $15K)</option>
                  <option value="medium">Medium ($15K - $30K)</option>
                  <option value="high">High ($30K+)</option>
                </select>
              </div>
              <div>
                <label htmlFor="timeCommitment" className="block text-sm font-medium text-gray-700">
                  Time Commitment *
                </label>
                <select
                  name="timeCommitment"
                  id="timeCommitment"
                  required
                  value={formData.timeCommitment}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="part-time">Part-time (20-30 hrs/week)</option>
                  <option value="full-time">Full-time (40+ hrs/week)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Territory Preferences */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Territory Preferences</h3>
            <div>
              <label htmlFor="preferredTerritory" className="block text-sm font-medium text-gray-700">
                Preferred Territory *
              </label>
              <input
                type="text"
                name="preferredTerritory"
                id="preferredTerritory"
                required
                placeholder="e.g., Downtown Seattle, Orange County, etc."
                value={formData.preferredTerritory}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="territoryJustification" className="block text-sm font-medium text-gray-700">
                Why this territory? *
              </label>
              <textarea
                name="territoryJustification"
                id="territoryJustification"
                required
                rows={3}
                placeholder="Explain your connection to this area, market knowledge, existing relationships, etc."
                value={formData.territoryJustification}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
            <div>
              <label htmlFor="motivation" className="block text-sm font-medium text-gray-700">
                What motivates you to become a Regional Partner? *
              </label>
              <textarea
                name="motivation"
                id="motivation"
                required
                rows={4}
                placeholder="Tell us about your goals, vision, and what excites you about this opportunity..."
                value={formData.motivation}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">
                Additional Notes (Optional)
              </label>
              <textarea
                name="additionalNotes"
                id="additionalNotes"
                rows={3}
                placeholder="Any additional information you'd like to share..."
                value={formData.additionalNotes}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};