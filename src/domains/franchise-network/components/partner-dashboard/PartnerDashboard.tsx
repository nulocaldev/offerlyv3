/**
 * Partner Dashboard Layout Component
 * Main layout with navigation for the partner portal
 */

import React, { useState, useEffect } from 'react';
import { partnerAuthService, type PartnerAuthState } from '../../services/partner-auth.service';
import { PartnerDashboardOverview } from './PartnerDashboardOverview';
import { PartnerCampaignManagement } from './PartnerCampaignManagement';
import { PartnerAnalytics } from './PartnerAnalytics';
import { PartnerAgentManagement } from './PartnerAgentManagement';
import { ApplicationReviewDashboard } from '../agent-approval/ApplicationReviewDashboard';
import { NotificationBell } from '../agent-approval/NotificationCenter';

type DashboardView = 'overview' | 'campaigns' | 'analytics' | 'team' | 'applications' | 'settings';

interface NavigationItem {
  id: DashboardView;
  label: string;
  icon: string;
  description: string;
}

export const PartnerDashboard: React.FC = () => {
  const [authState, setAuthState] = useState<PartnerAuthState>({
    user: null,
    profile: null,
    isPartner: false,
    isVerified: false,
    hasAccess: false,
    loading: true
  });
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview and quick actions'
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: '🎮',
      description: 'Manage marketing campaigns'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      description: 'Performance insights'
    },
    {
      id: 'team',
      label: 'Team',
      icon: '👥',
      description: 'Manage agents and team'
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: '📋',
      description: 'Review agent applications'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'Account and preferences'
    }
  ];

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const state = await partnerAuthService.initialize();
      setAuthState(state);

      // Set up auth state change listener
      partnerAuthService.onAuthStateChange((newState) => {
        setAuthState(newState);
      });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await partnerAuthService.signOut();
      // Redirect would happen here in a real app
      window.location.href = '/login';
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <PartnerDashboardOverview />;
      case 'campaigns':
        return <PartnerCampaignManagement />;
      case 'analytics':
        return <PartnerAnalytics />;
      case 'team':
        return <PartnerAgentManagement />;
      case 'applications':
        return <ApplicationReviewDashboard />;
      case 'settings':
        return <PartnerSettings />;
      default:
        return <PartnerDashboardOverview />;
    }
  };

  // Loading state
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading partner dashboard...</p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (!authState.hasAccess || !authState.isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          {!authState.isPartner && (
            <p className="text-gray-600 mb-6">
              You need a partner account to access this dashboard.
            </p>
          )}
          {authState.isPartner && !authState.isVerified && (
            <div className="text-left bg-yellow-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">Account Under Review</h3>
              <p className="text-yellow-700 text-sm">
                Your partner application is currently being reviewed. You'll receive access once approved.
              </p>
              <p className="text-yellow-700 text-sm mt-2">
                Status: <strong>{authState.profile?.verification_status}</strong>
              </p>
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/apply'}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Apply for Partnership
            </button>
            <button
              onClick={handleSignOut}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">Offerly</div>
            <div className="ml-2 text-sm text-gray-500">Partner</div>
          </div>
          <div className="flex items-center space-x-2">
            <NotificationBell />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Partner Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {authState.profile?.business_name?.charAt(0) || 'P'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {authState.profile?.business_name || 'Partner Business'}
              </p>
              <p className="text-xs text-gray-500">
                {authState.profile?.verification_status === 'approved' ? '✅ Verified' : '🔍 Under Review'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <div className="text-left">
                  <div>{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <span className="text-xl mr-3">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-lg font-semibold text-gray-900">
              {navigationItems.find(item => item.id === currentView)?.label || 'Dashboard'}
            </div>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

// Settings component placeholder
const PartnerSettings: React.FC = () => {
  const [authState, setAuthState] = useState<PartnerAuthState | null>(null);

  useEffect(() => {
    const loadAuthState = async () => {
      const state = await partnerAuthService.initialize();
      setAuthState(state);
    };
    loadAuthState();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
          
          {authState?.profile && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={authState.profile.business_name}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type
                  </label>
                  <input
                    type="text"
                    value={authState.profile.business_type || 'Not specified'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={authState.profile.city || 'Not specified'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Status
                  </label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    authState.profile.verification_status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : authState.profile.verification_status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {authState.profile.verification_status.charAt(0).toUpperCase() + 
                     authState.profile.verification_status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🔧</div>
              <p>Additional settings coming soon!</p>
              <p className="text-sm">Contact support if you need to update your business information.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};