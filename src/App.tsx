import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from '@/shared-kernel/auth/AuthContext';
import { ProtectedRoute } from '@/shared-kernel/auth/components/ProtectedRoute';
import { LoginForm } from '@/shared-kernel/auth/components/LoginForm';
import { UserMenu } from '@/shared-kernel/auth/components/UserMenu';
import { PartnerApplicationForm } from './interfaces/public/components/PartnerApplicationForm';
import { PendingApplicationsManager } from './interfaces/admin-portal/components/PendingApplicationsManager';
import { ScratchCampaignsDashboard, ScratchGame } from './domains/marketing-tools';
import { SubscriptionDashboard } from './domains/franchise-network';
import { PartnerDashboard } from './domains/franchise-network/components/partner-dashboard/PartnerDashboard';
import { AgentApplicationForm } from './domains/franchise-network/components/agent-approval/AgentApplicationForm';

// Enhanced navigation component with auth
const Navigation: React.FC = () => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Offerly
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/partner-application" 
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Become a Partner
            </Link>
            <Link 
              to="/agent-application" 
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              🏪 Apply as Agent
            </Link>
            <Link 
              to="/partner-dashboard" 
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              🏢 Partner Portal
            </Link>
            <Link 
              to="/campaigns" 
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              🎮 Campaigns
            </Link>
            <Link 
              to="/subscription" 
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              💎 Subscription
            </Link>
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

// Simple home page
const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to <span className="text-blue-600">Offerly</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Create engaging marketing campaigns with interactive tools. Build your business network and help local businesses grow.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to="/partner-application"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Become a Regional Partner
              </Link>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <Link
                to="/agent-application"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Apply as Agent
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Admin Portal
const AdminPortal: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
              <p className="text-gray-600">Manage partner applications and platform settings</p>
            </div>
            <PendingApplicationsManager />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

// Partner Application Page wrapper
const PartnerApplicationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <PartnerApplicationForm />
    </div>
  );
};

// Login page wrapper
const LoginPage: React.FC = () => {
  return <LoginForm redirectTo="/admin" />;
};

// Scratch Campaigns Dashboard Page (Protected)
const CampaignsDashboardPage: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="regional_partner">
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-6">
          <ScratchCampaignsDashboard />
        </div>
      </div>
    </ProtectedRoute>
  );
};

// Subscription Dashboard Page (Protected)
const SubscriptionDashboardPage: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="regional_partner">
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <SubscriptionDashboard />
      </div>
    </ProtectedRoute>
  );
};

// Partner Dashboard Page (Protected)
const PartnerDashboardPage: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="regional_partner">
      <PartnerDashboard />
    </ProtectedRoute>
  );
};

// Agent Application Page wrapper
const AgentApplicationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <AgentApplicationForm />
    </div>
  );
};

// Public Scratch Game Play Page
const ScratchGamePage: React.FC = () => {
  const pathSegments = window.location.pathname.split('/');
  const campaignId = pathSegments[pathSegments.length - 1];
  const urlParams = new URLSearchParams(window.location.search);
  const playerIdentifier = urlParams.get('player') || `player_${Date.now()}`;

  if (!campaignId || campaignId === 'play') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Campaign</h1>
          <p className="text-gray-600">The campaign link appears to be invalid.</p>
          <Link 
            to="/" 
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="pt-8 pb-16">
        <div className="text-center mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Offerly
          </Link>
        </div>
        <ScratchGame 
          campaignId={campaignId} 
          playerIdentifier={playerIdentifier}
          onGameComplete={(result) => {
            console.log('Game completed:', result);
            // Could track analytics here
          }}
        />
      </div>
    </div>
  );
};

// Main App component with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/partner-application" element={<PartnerApplicationPage />} />
          <Route path="/agent-application" element={<AgentApplicationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/partner-dashboard" element={<PartnerDashboardPage />} />
          <Route path="/campaigns" element={<CampaignsDashboardPage />} />
          <Route path="/subscription" element={<SubscriptionDashboardPage />} />
          <Route path="/play/:campaignId" element={<ScratchGamePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;