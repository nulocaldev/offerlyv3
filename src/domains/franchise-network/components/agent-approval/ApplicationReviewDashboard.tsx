/**
 * Application Review Dashboard
 * Main interface for partners to review and manage agent applications
 */

import React, { useState, useEffect } from 'react';
import { agentApprovalWorkflowService, type AgentApplication } from '../../services/agent-approval-workflow.service';
import { partnerAuthService } from '../../services/partner-auth.service';

interface ReviewFilters {
  status: string;
  role: string;
  priority: number | null;
  assignedToMe: boolean;
  searchTerm: string;
}

export const ApplicationReviewDashboard: React.FC = () => {
  const [applications, setApplications] = useState<AgentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<AgentApplication | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [filters, setFilters] = useState<ReviewFilters>({
    status: 'all',
    role: 'all',
    priority: null,
    assignedToMe: false,
    searchTerm: ''
  });

  useEffect(() => {
    loadApplications();
  }, [filters]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const authState = await partnerAuthService.initialize();
      if (!authState.user) {
        setError('User not authenticated');
        return;
      }

      // Build filter object
      const filterParams: any = {};
      if (filters.status !== 'all') filterParams.status = filters.status;
      if (filters.role !== 'all') filterParams.role = filters.role;
      if (filters.priority) filterParams.priority = filters.priority;
      if (filters.assignedToMe) filterParams.assignedToMe = true;

      // Load applications
      const data = await agentApprovalWorkflowService.getApplicationsForReview(
        authState.user.id,
        filterParams
      );

      // Apply search filter on frontend
      let filteredData = data;
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredData = data.filter(app => 
          app.personal_info?.first_name?.toLowerCase().includes(searchLower) ||
          app.personal_info?.last_name?.toLowerCase().includes(searchLower) ||
          app.personal_info?.email?.toLowerCase().includes(searchLower) ||
          app.business_plan?.business_name?.toLowerCase().includes(searchLower)
        );
      }

      setApplications(filteredData);

    } catch (err) {
      console.error('Failed to load applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: AgentApplication['status'],
    notes?: string
  ) => {
    try {
      const authState = await partnerAuthService.initialize();
      if (!authState.user) return;

      await agentApprovalWorkflowService.updateApplicationStatus(
        applicationId,
        newStatus,
        authState.user.id,
        notes
      );

      // Refresh applications
      await loadApplications();
      
      // Close modal if open
      setShowApplicationModal(false);

      alert(`Application status updated to ${newStatus}`);

    } catch (error) {
      console.error('Failed to update application status:', error);
      alert('Failed to update application status');
    }
  };

  const getPriorityBadge = (priority: number) => {
    const configs = {
      1: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
      2: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
      3: { label: 'High', color: 'bg-orange-100 text-orange-800' },
      4: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
    };
    const config = configs[priority as keyof typeof configs] || configs[1];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status: AgentApplication['status']) => {
    const configs = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      'under_review': { color: 'bg-blue-100 text-blue-800', icon: '👀' },
      'approved': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'rejected': { color: 'bg-red-100 text-red-800', icon: '❌' },
      'payment_pending': { color: 'bg-purple-100 text-purple-800', icon: '💳' },
      'active': { color: 'bg-emerald-100 text-emerald-800', icon: '🎉' }
    };
    const config = configs[status];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color} flex items-center`}>
        <span className="mr-1">{config.icon}</span>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getRoleIcon = (role: string) => {
    return role === 'regional_partner' ? '🏢' : '🏪';
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

  const daysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Applications</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadApplications}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Agent Applications</h1>
                <p className="mt-2 text-gray-600">
                  Review and manage applications from potential agents
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">
                    {applications.length} applications
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search by name, email, or business..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="active">Active</option>
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="regional_partner">Regional Partner</option>
                <option value="neighborhood_agent">Neighborhood Agent</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  priority: e.target.value ? parseInt(e.target.value) : null 
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priority</option>
                <option value="3">High Priority+</option>
                <option value="2">Medium Priority+</option>
                <option value="1">All Applications</option>
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.assignedToMe}
                onChange={(e) => setFilters(prev => ({ ...prev, assignedToMe: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Assigned to me only</span>
            </label>
            <button
              onClick={() => setFilters({
                status: 'all',
                role: 'all',
                priority: null,
                assignedToMe: false,
                searchTerm: ''
              })}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some(v => v && v !== 'all') 
                ? "Try adjusting your search criteria or filters."
                : "No agent applications have been submitted yet."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const deadline = daysUntilDeadline(application.review_deadline);
              
              return (
                <div key={application.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{getRoleIcon(application.role_applied_for)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {application.personal_info?.first_name} {application.personal_info?.last_name}
                          </h3>
                          {getPriorityBadge(application.priority_level)}
                        </div>
                        
                        <p className="text-gray-600 mb-1">
                          {application.personal_info?.email}
                        </p>
                        
                        <p className="text-sm text-gray-500 mb-3">
                          Applied for: {application.role_applied_for.replace('_', ' ')} • 
                          {application.business_plan?.business_name && (
                            <> Business: {application.business_plan.business_name} • </>
                          )}
                          Applied {formatDate(application.created_at)}
                        </p>

                        {/* Application Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Experience:</span>
                            <p className="text-gray-600">
                              {application.experience_info?.years_experience || 'Not specified'} years
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Location:</span>
                            <p className="text-gray-600">
                              {application.personal_info?.city}, {application.personal_info?.state}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Score:</span>
                            <p className="text-gray-600">
                              {application.application_score ? `${application.application_score}/100` : 'Not scored'}
                            </p>
                          </div>
                        </div>

                        {/* Referral Info */}
                        {application.referral_code && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                              📧 Referred by: {application.referral_agent_id || 'Unknown'} 
                              (Code: {application.referral_code})
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                      {getStatusBadge(application.status)}
                      
                      {deadline !== null && (
                        <div className={`text-sm px-2 py-1 rounded ${
                          deadline < 0 ? 'bg-red-100 text-red-700' :
                          deadline <= 2 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {deadline < 0 ? `${Math.abs(deadline)} days overdue` :
                           deadline === 0 ? 'Due today' :
                           `${deadline} days left`}
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowApplicationModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Review Details
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {application.interview_scheduled && (
                          <span className="mr-4">
                            📅 Interview: {formatDate(application.interview_scheduled)}
                          </span>
                        )}
                        {application.required_gem_cost && (
                          <span>💎 Gem Cost: {application.required_gem_cost}</span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {application.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'under_review')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Start Review
                          </button>
                        )}
                        
                        {application.status === 'under_review' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'approved', 'Application approved after review')}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Please provide a reason for rejection:');
                                if (reason) handleStatusUpdate(application.id, 'rejected', reason);
                              }}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedApplication(null);
          }}
          onStatusUpdate={handleStatusUpdate}
          onRefresh={loadApplications}
        />
      )}
    </div>
  );
};

// Application Details Modal Component
interface ApplicationDetailsModalProps {
  application: AgentApplication;
  onClose: () => void;
  onStatusUpdate: (id: string, status: AgentApplication['status'], notes?: string) => void;
  onRefresh: () => void;
}

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  application,
  onClose,
  onStatusUpdate,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'scoring'>('overview');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'history', label: 'History', icon: '📜' },
    { id: 'scoring', label: 'Scoring', icon: '🎯' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Application Details
            </h3>
            <p className="text-sm text-gray-600">
              {application.personal_info?.first_name} {application.personal_info?.last_name} • 
              {application.role_applied_for.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <ApplicationOverviewTab application={application} />
          )}
          {activeTab === 'history' && (
            <ApplicationHistoryTab applicationId={application.id} />
          )}
          {activeTab === 'scoring' && (
            <ApplicationScoringTab 
              application={application} 
              onRefresh={onRefresh}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          
          {application.status === 'under_review' && (
            <>
              <button
                onClick={() => {
                  onStatusUpdate(application.id, 'approved', 'Application approved after detailed review');
                  onClose();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve Application
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Please provide a reason for rejection:');
                  if (reason) {
                    onStatusUpdate(application.id, 'rejected', reason);
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject Application
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Placeholder components for modal tabs
const ApplicationOverviewTab: React.FC<{ application: AgentApplication }> = ({ application }) => (
  <div className="space-y-6">
    <div className="text-center text-gray-500">
      <div className="text-4xl mb-2">📋</div>
      <p>Application overview content would be displayed here</p>
      <p className="text-sm">Including personal info, experience, and business plan details</p>
    </div>
  </div>
);

const ApplicationHistoryTab: React.FC<{ applicationId: string }> = ({ applicationId }) => (
  <div className="space-y-6">
    <div className="text-center text-gray-500">
      <div className="text-4xl mb-2">📜</div>
      <p>Application history timeline would be displayed here</p>
      <p className="text-sm">Showing all status changes, reviews, and activities</p>
    </div>
  </div>
);

const ApplicationScoringTab: React.FC<{ 
  application: AgentApplication; 
  onRefresh: () => void; 
}> = ({ application, onRefresh }) => (
  <div className="space-y-6">
    <div className="text-center text-gray-500">
      <div className="text-4xl mb-2">🎯</div>
      <p>Application scoring interface would be displayed here</p>
      <p className="text-sm">Including evaluation criteria and scoring forms</p>
    </div>
  </div>
);