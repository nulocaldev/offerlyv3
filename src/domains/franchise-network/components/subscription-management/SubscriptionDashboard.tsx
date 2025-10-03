/**
 * Subscription Dashboard
 * Main interface for subscription and gem economy management
 */

import React, { useState } from 'react';
import { Crown, Wallet, TrendingUp, Settings } from 'lucide-react';
import SubscriptionManagement from './SubscriptionManagement';
import GemWallet from './GemWallet';

type TabType = 'subscriptions' | 'wallet' | 'analytics' | 'settings';

export function SubscriptionDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('subscriptions');

  const tabs = [
    {
      id: 'subscriptions' as TabType,
      label: 'Subscription Plans',
      icon: Crown,
      description: 'Manage your subscription tier'
    },
    {
      id: 'wallet' as TabType,
      label: 'Gem Wallet',
      icon: Wallet,
      description: 'View balance and transactions'
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Gem usage insights'
    },
    {
      id: 'settings' as TabType,
      label: 'Settings',
      icon: Settings,
      description: 'Payment and billing'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'subscriptions':
        return <SubscriptionManagement />;
      case 'wallet':
        return <GemWallet />;
      case 'analytics':
        return <AnalyticsPlaceholder />;
      case 'settings':
        return <SettingsPlaceholder />;
      default:
        return <SubscriptionManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {renderTabContent()}
      </div>
    </div>
  );
}

// Placeholder components for future implementation
function AnalyticsPlaceholder() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center py-16">
        <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
        <p className="text-gray-600 mb-6">
          Detailed gem usage analytics and spending insights coming soon
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">Coming Soon</div>
            <div className="text-gray-600">Gem spending analytics</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">Coming Soon</div>
            <div className="text-gray-600">ROI tracking</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">Coming Soon</div>
            <div className="text-gray-600">Performance insights</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPlaceholder() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment & Billing Settings</h2>
        
        <div className="space-y-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Payment Methods</h3>
            <p className="text-gray-600 text-sm mb-4">Manage your payment methods and billing information</p>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">
              Coming Soon - Add Payment Method
            </button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Billing History</h3>
            <p className="text-gray-600 text-sm mb-4">View your subscription and gem purchase history</p>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">
              Coming Soon - View History
            </button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Auto-renewal</h3>
            <p className="text-gray-600 text-sm mb-4">Manage automatic subscription renewal settings</p>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">
              Coming Soon - Manage Auto-renewal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionDashboard;