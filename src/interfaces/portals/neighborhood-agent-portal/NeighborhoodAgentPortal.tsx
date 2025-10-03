// Neighborhood Agent Portal - Interface for creating marketing campaigns
// Demonstrates marketing tools domain usage with gem economy integration

import React from 'react';
import type { AuthUser } from '@shared/auth/auth.service';

interface NeighborhoodAgentPortalProps {
  user: AuthUser;
}

const NeighborhoodAgentPortal: React.FC<NeighborhoodAgentPortalProps> = ({ user }) => {
  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="bg-brand-card border-b border-brand-card-border">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gradient">
              🎯 Neighborhood Agent Portal
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Gem Balance</div>
                <div className="text-lg font-bold text-brand-yellow">💎 750</div>
              </div>
              <div className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center">
                🎯
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="space-y-8">
          {/* Business Overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Business Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-brand-light-purple/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-brand-yellow">5</div>
                <div className="text-sm text-gray-400">Active Campaigns</div>
              </div>
              <div className="bg-green-600/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">12</div>
                <div className="text-sm text-gray-400">Total Clients</div>
              </div>
              <div className="bg-brand-pink/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-brand-pink">$2,800</div>
                <div className="text-sm text-gray-400">Monthly Revenue</div>
              </div>
              <div className="bg-brand-yellow/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-brand-yellow">750</div>
                <div className="text-sm text-gray-400">Available Gems</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <p className="text-sm text-gray-400 mt-1">
                Marketing Tools Domain - Create engaging campaigns for your clients
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-6 border-2 border-dashed border-brand-card-border rounded-lg hover:border-brand-yellow transition-colors group">
                <div className="text-3xl mb-2 group-hover:animate-bounce">🎲</div>
                <h4 className="font-semibold mb-2">Create Scratch & Win</h4>
                <p className="text-sm text-gray-400">Interactive scratch game</p>
                <p className="text-xs text-brand-yellow mt-2">Cost: 50 💎</p>
              </button>
              
              <button className="p-6 border-2 border-dashed border-brand-card-border rounded-lg hover:border-brand-yellow transition-colors group">
                <div className="text-3xl mb-2 group-hover:animate-bounce">🎉</div>
                <h4 className="font-semibold mb-2">Social Contest</h4>
                <p className="text-sm text-gray-400">Social media engagement</p>
                <p className="text-xs text-brand-yellow mt-2">Cost: 30 💎</p>
              </button>
              
              <button className="p-6 border-2 border-dashed border-brand-card-border rounded-lg hover:border-brand-yellow transition-colors group">
                <div className="text-3xl mb-2 group-hover:animate-bounce">🏆</div>
                <h4 className="font-semibold mb-2">Loyalty Program</h4>
                <p className="text-sm text-gray-400">Customer retention tool</p>
                <p className="text-xs text-brand-yellow mt-2">Cost: 75 💎</p>
              </button>
            </div>
          </div>

          {/* Recent Campaigns */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Recent Campaigns</h3>
            </div>
            <div className="space-y-4">
              <div className="border border-brand-card-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Summer Sale - Joe's Pizza</h4>
                    <p className="text-sm text-gray-400">Scratch & Win Campaign</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Views: 1,247</div>
                    <div className="text-xs text-brand-yellow">Cost: 50 💎</div>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button className="btn-secondary px-4 py-2 text-sm">View Analytics</button>
                  <button className="btn-primary px-4 py-2 text-sm">Edit</button>
                  <button className="btn-danger px-4 py-2 text-sm">Pause</button>
                </div>
              </div>

              <div className="border border-brand-card-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Grand Opening - Maria's Bakery</h4>
                    <p className="text-sm text-gray-400">Social Contest Campaign</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Views: 892</div>
                    <div className="text-xs text-brand-yellow">Cost: 30 💎</div>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button className="btn-secondary px-4 py-2 text-sm">View Analytics</button>
                  <button className="btn-primary px-4 py-2 text-sm">Edit</button>
                  <button className="btn-danger px-4 py-2 text-sm">Pause</button>
                </div>
              </div>
            </div>
          </div>

          {/* Service Pricing */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Your Service Pricing</h3>
              <p className="text-sm text-gray-400 mt-1">
                Independent pricing - You control your rates and collect payments directly
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Hourly Rate</h4>
                <div className="text-2xl font-bold text-brand-yellow">$75/hour</div>
                <button className="text-sm text-brand-light-purple hover:underline mt-1">
                  Update Rate
                </button>
              </div>
              <div>
                <h4 className="font-medium mb-2">Campaign Creation</h4>
                <div className="text-2xl font-bold text-brand-yellow">$150/campaign</div>
                <button className="text-sm text-brand-light-purple hover:underline mt-1">
                  Update Rate
                </button>
              </div>
              <div>
                <h4 className="font-medium mb-2">Monthly Retainer</h4>
                <div className="text-2xl font-bold text-brand-yellow">$500/month</div>
                <button className="text-sm text-brand-light-purple hover:underline mt-1">
                  Update Rate
                </button>
              </div>
            </div>
          </div>

          {/* Domain Separation Demo */}
          <div className="card bg-gradient-to-r from-brand-purple/10 to-brand-pink/10 border-brand-light-purple">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-brand-yellow">
                🏗️ Architecture Demo: Domain Separation
              </h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-brand-yellow mb-3">
                  🎯 Marketing Tools Domain
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Campaign creation and management</li>
                  <li>• Game mechanics (scratch & win)</li>
                  <li>• Customer engagement tracking</li>
                  <li>• Analytics and reporting</li>
                  <li>• Prize management</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-brand-pink mb-3">
                  🏢 Franchise Network Domain
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Gem balance management</li>
                  <li>• Service pricing control</li>
                  <li>• Regional partner relationship</li>
                  <li>• Subscription management</li>
                  <li>• Independent billing</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-brand-bg/30 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong>Clean Separation:</strong> You use marketing tools to serve clients, 
                while the franchise network handles your business relationship and gem economy. 
                Each domain can evolve independently without affecting the other.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NeighborhoodAgentPortal;
