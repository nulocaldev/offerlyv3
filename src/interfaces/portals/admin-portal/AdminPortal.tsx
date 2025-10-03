// Admin Portal - Main interface for platform administration
// Demonstrates access to both domains with full administrative control

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import type { AuthUser } from '@shared/auth/auth.service';

interface AdminPortalProps {
  user: AuthUser;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ user }) => {
  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="bg-brand-card border-b border-brand-card-border">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gradient">
              🏢 Admin Portal - Offerly Management
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Welcome, {user.email}</span>
              <div className="w-8 h-8 bg-brand-purple rounded-full flex items-center justify-center">
                👑
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-brand-card/50 border-b border-brand-card-border">
        <div className="container-custom">
          <div className="flex space-x-8 py-3">
            <button className="nav-link-active">Dashboard</button>
            <button className="nav-link">Regional Partners</button>
            <button className="nav-link">Agents</button>
            <button className="nav-link">Campaigns</button>
            <button className="nav-link">Gem Economy</button>
            <button className="nav-link">Settings</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-custom py-8">
        <Routes>
          <Route index element={<AdminDashboard />} />
          {/* Add more routes as needed */}
        </Routes>
      </main>
    </div>
  );
};

// Dashboard component
const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Platform Overview */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Platform Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-brand-light-purple/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-brand-yellow">1,247</div>
            <div className="text-sm text-gray-400">Total Users</div>
          </div>
          <div className="bg-green-600/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">89</div>
            <div className="text-sm text-gray-400">Active Agents</div>
          </div>
          <div className="bg-brand-pink/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-brand-pink">23</div>
            <div className="text-sm text-gray-400">Pending Applications</div>
          </div>
          <div className="bg-brand-yellow/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-brand-yellow">$12,450</div>
            <div className="text-sm text-gray-400">Monthly Revenue</div>
          </div>
        </div>
      </div>

      {/* Domain Separation Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Marketing Tools Domain */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-brand-yellow">
              🎯 Marketing Tools Domain
            </h3>
          </div>
          <div className="space-y-4">
            <div className="text-sm text-gray-400">Customer-facing tools and engagement</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Active Campaigns</span>
                <span className="text-brand-yellow">156</span>
              </div>
              <div className="flex justify-between">
                <span>Total Game Plays</span>
                <span className="text-brand-yellow">45,230</span>
              </div>
              <div className="flex justify-between">
                <span>Customer Interactions</span>
                <span className="text-brand-yellow">128,940</span>
              </div>
              <div className="flex justify-between">
                <span>Prize Redemptions</span>
                <span className="text-brand-yellow">3,420</span>
              </div>
            </div>
          </div>
        </div>

        {/* Franchise Network Domain */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-brand-pink">
              🏢 Franchise Network Domain
            </h3>
          </div>
          <div className="space-y-4">
            <div className="text-sm text-gray-400">Business model and agent hierarchy</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Regional Partners</span>
                <span className="text-brand-pink">12</span>
              </div>
              <div className="flex justify-between">
                <span>Neighborhood Agents</span>
                <span className="text-brand-pink">89</span>
              </div>
              <div className="flex justify-between">
                <span>Gems in Circulation</span>
                <span className="text-brand-pink">247,500</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Subscriptions</span>
                <span className="text-brand-pink">$25,680</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-brand-bg/50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Regional Partner "John Smith" approved</span>
            <span className="text-xs text-gray-500 ml-auto">2 min ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-brand-bg/50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm">Campaign "Summer Sale" launched by Agent #123</span>
            <span className="text-xs text-gray-500 ml-auto">5 min ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-brand-bg/50 rounded-lg">
            <div className="w-2 h-2 bg-brand-yellow rounded-full"></div>
            <span className="text-sm">Gem transfer: 500 gems to Agent #456</span>
            <span className="text-xs text-gray-500 ml-auto">10 min ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
