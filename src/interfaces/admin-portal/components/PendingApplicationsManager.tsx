import React, { useState, useEffect } from 'react';
import { PartnerApplicationService } from '@/domains/franchise-network/services/partner-application.service';
import { PendingPartnerApplication } from '@/domains/franchise-network/types/partner-application.types';

const partnerService = new PartnerApplicationService();

export const PendingApplicationsManager: React.FC = () => {
  const [applications, setApplications] = useState<PendingPartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<PendingPartnerApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      setLoading(true);
      const data = await partnerService.getPendingApplications();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      setIsProcessing(true);
      await partnerService.approveApplication(applicationId, reviewNotes);
      await fetchPendingApplications(); // Refresh the list
      setSelectedApplication(null);
      setReviewNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      setIsProcessing(true);
      await partnerService.rejectApplication(applicationId, reviewNotes);
      await fetchPendingApplications(); // Refresh the list
      setSelectedApplication(null);
      setReviewNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject application');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Pending Partner Applications</h1>
          <p className="mt-2 text-sm text-gray-700">
            Review and manage incoming Regional Partner applications.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={fetchPendingApplications}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending applications</h3>
          <p className="mt-1 text-sm text-gray-500">No new partner applications to review.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {applications.map((application) => (
              <li key={application.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {application.firstName[0]}{application.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {application.firstName} {application.lastName}
                        </p>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-500">{application.email}</p>
                        <p className="text-sm text-gray-500">Territory: {application.preferredTerritory}</p>
                        <p className="text-sm text-gray-500">Submitted: {formatDate(application.submittedAt)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Application Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Review Application: {selectedApplication.firstName} {selectedApplication.lastName}
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedApplication.firstName} {selectedApplication.lastName}</p>
                      <p><span className="font-medium">Email:</span> {selectedApplication.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedApplication.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Business Information</h4>
                    <div className="space-y-2 text-sm">
                      {selectedApplication.businessName && (
                        <p><span className="font-medium">Business:</span> {selectedApplication.businessName}</p>
                      )}
                      <p><span className="font-medium">Address:</span> {selectedApplication.businessAddress}</p>
                      <p><span className="font-medium">Location:</span> {selectedApplication.city}, {selectedApplication.state} {selectedApplication.zipCode}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Marketing Experience:</span> {selectedApplication.marketingExperience} years</p>
                      <p><span className="font-medium">Business Experience:</span> {selectedApplication.businessExperience} years</p>
                      <p><span className="font-medium">Has Team:</span> {selectedApplication.hasTeam ? `Yes (${selectedApplication.teamSize} members)` : 'No'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Investment & Commitment</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Investment Capacity:</span> {selectedApplication.investmentCapacity}</p>
                      <p><span className="font-medium">Time Commitment:</span> {selectedApplication.timeCommitment}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">Territory</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Preferred Territory:</span> {selectedApplication.preferredTerritory}</p>
                      <p><span className="font-medium">Justification:</span> {selectedApplication.territoryJustification}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">Motivation</h4>
                    <p className="text-sm">{selectedApplication.motivation}</p>
                  </div>

                  {selectedApplication.additionalNotes && (
                    <div className="md:col-span-2">
                      <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                      <p className="text-sm">{selectedApplication.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  id="reviewNotes"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about your decision..."
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedApplication.id)}
                  disabled={isProcessing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleApprove(selectedApplication.id)}
                  disabled={isProcessing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};