/**
 * Partner Dashboard - Main Overview Component
 * Provides comprehensive business insights and quick access to key functions
 */

import React, { useState, useEffect } from 'react';
import { partnerAuthService, type PartnerProfile } from '../../services/partner-auth.service';
import { gemEconomyService } from '../../services/gem-economy.service';

interface DashboardMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalParticipants: number;
  conversionRate: number;
  totalRevenue: number;
  gemsBalance: number;
  agentCount: number;
  monthlyGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'campaign_created' | 'agent_approved' | 'milestone_reached' | 'payment_received';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export const PartnerDashboardOverview: React.FC = () => {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth state
      const authState = await partnerAuthService.initialize();
      
      if (!authState.profile) {
        setError('Partner profile not found');
        return;
      }

      setProfile(authState.profile);

      // Load metrics
      const analyticsData = await partnerAuthService.getPartnerAnalytics(authState.profile.id);
      const campaignStats = await partnerAuthService.getPartnerCampaignStats(authState.profile.id);
      const gemBalance = await gemEconomyService.getUserGemBalance(authState.user?.id || '');

      // Calculate aggregated metrics
      const totalMetrics = analyticsData.reduce((acc, day) => ({
        totalCampaigns: Math.max(acc.totalCampaigns, day.total_campaigns),
        activeCampaigns: Math.max(acc.activeCampaigns, day.active_campaigns),
        totalParticipants: acc.totalParticipants + day.total_participants,
        totalRevenue: acc.totalRevenue + parseFloat(day.total_revenue.toString()),
        agentCount: Math.max(acc.agentCount, day.agent_count)
      }), {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalParticipants: 0,
        totalRevenue: 0,
        agentCount: 0
      });

      // Calculate conversion rate
      const totalConversions = analyticsData.reduce((sum, day) => sum + day.total_conversions, 0);
      const conversionRate = totalMetrics.totalParticipants > 0 
        ? (totalConversions / totalMetrics.totalParticipants) * 100 
        : 0;

      // Calculate monthly growth (simplified)
      const currentMonth = analyticsData.slice(0, 30);
      const previousMonth = analyticsData.slice(30, 60);
      const currentRevenue = currentMonth.reduce((sum, day) => sum + parseFloat(day.total_revenue.toString()), 0);
      const previousRevenue = previousMonth.reduce((sum, day) => sum + parseFloat(day.total_revenue.toString()), 0);
      const monthlyGrowth = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;

      setMetrics({
        ...totalMetrics,
        conversionRate,
        monthlyGrowth,
        gemsBalance: gemBalance?.total_gems || 0
      });

      // Generate recent activity (mock data for now)
      setRecentActivity([
        {
          id: '1',
          type: 'campaign_created',
          title: 'New Scratch Campaign Created',
          description: 'Holiday Special campaign is now live',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'milestone_reached',
          title: '1000 Participants Milestone',
          description: 'Your campaigns have reached 1000 total participants!',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'agent_approved',
          title: 'New Agent Approved',
          description: 'Sarah Johnson has joined your team',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'campaign_created': return '🎮';
      case 'agent_approved': return '👥';
      case 'milestone_reached': return '🎯';
      case 'payment_received': return '💰';
      default: return '📊';
    }
  };

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
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
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {profile?.business_name}!
                </h1>
                <p className="mt-2 text-gray-600">
                  Here's what's happening with your marketing campaigns today.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Gem Balance</p>
                  <p className="text-2xl font-bold text-blue-600">
                    💎 {formatNumber(metrics?.gemsBalance || 0)}
                  </p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.totalCampaigns || 0}</p>
              </div>
              <div className="text-4xl">🎮</div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 text-sm font-medium">
                {metrics?.activeCampaigns || 0} active
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(metrics?.totalParticipants || 0)}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
            <div className="mt-4">
              <span className="text-blue-600 text-sm font-medium">
                {metrics?.conversionRate?.toFixed(1) || 0}% conversion rate
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics?.totalRevenue || 0)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${
                (metrics?.monthlyGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(metrics?.monthlyGrowth || 0) >= 0 ? '↗️' : '↘️'} 
                {Math.abs(metrics?.monthlyGrowth || 0).toFixed(1)}% this month
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.agentCount || 0}</p>
              </div>
              <div className="text-4xl">🏪</div>
            </div>
            <div className="mt-4">
              <span className="text-gray-600 text-sm font-medium">
                Active agents
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 text-left border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🎮</span>
                    <span className="font-medium">Create New Campaign</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 text-left border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👥</span>
                    <span className="font-medium">Invite Team Member</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 text-left border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📊</span>
                    <span className="font-medium">View Analytics</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 text-left border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">💎</span>
                    <span className="font-medium">Purchase Gems</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
                
                {recentActivity.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📋</div>
                    <p>No recent activity</p>
                    <p className="text-sm">Create your first campaign to get started!</p>
                  </div>
                )}
              </div>
              
              {recentActivity.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View all activity →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};