// Regional Partner Portal - Interface for franchise territory management
// Demonstrates franchise network domain operations and gem economy control

import React from 'react';
import type { AuthUser } from '@shared/auth/auth.service';

interface RegionalPartnerPortalProps {
  user: AuthUser;
}

const RegionalPartnerPortal: React.FC<RegionalPartnerPortalProps> = ({ user }) => {
  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="bg-brand-card border-b border-brand-card-border">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gradient">
              🏢 Regional Partner Portal
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Gem Balance</div>
                <div className="text-lg font-bold text-brand-yellow">💎 2,500</div>
              </div>
              <div className="w-8 h-8 bg-brand-light-purple rounded-full flex items-center justify-center">
                🏢
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="space-y-8">
          {/* Network Overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Network Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-brand-light-purple/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-brand-yellow">12</div>
                <div className="text-sm text-gray-400">Total Agents</div>
              </div>
              <div className="bg-green-600/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">8</div>
                <div className="text-sm text-gray-400">Active Agents</div>
              </div>
              <div className="bg-brand-pink/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-brand-pink">4</div>
                <div className="text-sm text-gray-400">Pending Applications</div>
              </div>
              <div className="bg-brand-yellow/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-brand-yellow">2,500</div>
                <div className="text-sm text-gray-400">Available Gems</div>
              </div>
            </div>
          </div>

          {/* Pending Agent Applications */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Pending Agent Applications</h3>
              <p className="text-sm text-gray-400 mt-1">
                Review and approve neighborhood agents in your territory
              </p>
            </div>
            <div className="space-y-4">
              <div className="border border-brand-card-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Sarah Johnson</h4>
                    <p className="text-sm text-gray-400">Downtown District</p>
                    <p className="text-xs text-gray-500">Applied 2 days ago</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="btn-success px-4 py-2 text-sm">
                      Approve (500 💎)
                    </button>
                    <button className="btn-danger px-4 py-2 text-sm">
                      Reject
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-300">
                  <strong>Experience:</strong> 3 years in local marketing<br />
                  <strong>Why interested:</strong> "Passionate about helping local businesses grow..."
                </div>
              </div>
            </div>
          </div>

          {/* Gem Management */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Gem Management</h3>
              <p className="text-sm text-gray-400 mt-1">
                Franchise Network Domain - Resource allocation and control
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Recent Transactions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-brand-bg/30 rounded">
                    <span className="text-sm">Agent Approval - Sarah</span>
                    <span className="text-red-400">-500 💎</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-brand-bg/30 rounded">
                    <span className="text-sm">Monthly Allocation</span>
                    <span className="text-green-400">+3,000 💎</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Transfer Gems</h4>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Agent Name" 
                    className="form-input w-full"
                  />
                  <input 
                    type="number" 
                    placeholder="Amount" 
                    className="form-input w-full"
                  />
                  <button className="btn-primary w-full">
                    Transfer Gems
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Agents */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Active Agents</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-brand-card-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-brand-purple rounded-full flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <h5 className="font-medium">Mike Chen</h5>
                    <p className="text-sm text-gray-400">Westside Area</p>
                  </div>
                </div>
                <div className="mt-3 text-sm">
                  <div className="flex justify-between">
                    <span>Campaigns</span>
                    <span>5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gems</span>
                    <span>750 💎</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegionalPartnerPortal;
