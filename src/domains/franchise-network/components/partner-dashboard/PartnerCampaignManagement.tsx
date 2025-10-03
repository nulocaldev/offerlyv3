/**
 * Partner Campaign Management Component
 * Allows partners to view, edit, and analyze their marketing campaigns
 */

import React, { useState, useEffect } from 'react';
import { partnerAuthService } from '../../services/partner-auth.service';
import { supabase } from '../../../shared-kernel/supabase/client';

interface Campaign {
  id: string;
  name: string;
  business_name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  type: 'scratch_win' | 'social_contest' | 'loyalty_program' | 'quiz_game';
  views: number;
  interactions: number;
  conversion_rate: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

interface CampaignStats {
  views: number;
  participations: number;
  conversions: number;
  revenue: number;
  last_activity: string;
}

export const PartnerCampaignManagement: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState<Record<string, CampaignStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current partner
      const authState = await partnerAuthService.initialize();
      if (!authState.profile) {
        setError('Partner profile not found');
        return;
      }

      // Load campaigns for this partner
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('agent_id', authState.user?.id)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      setCampaigns(campaignsData || []);

      // Load campaign statistics
      const stats = await partnerAuthService.getPartnerCampaignStats(authState.profile.id);
      const statsMap = stats.reduce((acc, stat) => {
        acc[stat.campaign_id] = {
          views: stat.views,
          participations: stat.participations,
          conversions: stat.conversions,
          revenue: parseFloat(stat.revenue.toString()),
          last_activity: stat.last_activity
        };
        return acc;
      }, {} as Record<string, CampaignStats>);

      setCampaignStats(statsMap);

    } catch (err) {
      console.error('Failed to load campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, newStatus: Campaign['status']) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;

      // Update local state
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus }
            : campaign
        )
      );

    } catch (err) {
      console.error('Failed to update campaign status:', err);
      alert('Failed to update campaign status');
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'scratch_win': return '🎮';
      case 'social_contest': return '📱';
      case 'loyalty_program': return '🎁';
      case 'quiz_game': return '🧠';
      default: return '📊';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Campaigns</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadCampaigns}
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
                <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
                <p className="mt-2 text-gray-600">
                  Manage and analyze your marketing campaigns
                </p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Create New Campaign
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Campaign List */}
        {filteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-6">
              {campaigns.length === 0 
                ? "Create your first marketing campaign to get started!"
                : "Try adjusting your search or filter criteria."
              }
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Create New Campaign
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCampaigns.map((campaign) => {
              const stats = campaignStats[campaign.id] || {
                views: 0,
                participations: 0,
                conversions: 0,
                revenue: 0,
                last_activity: ''
              };

              return (
                <div key={campaign.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{getTypeIcon(campaign.type)}</div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{campaign.name}</h3>
                          <p className="text-gray-600">{campaign.business_name}</p>
                          <p className="text-sm text-gray-500 mt-1">{campaign.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                        <div className="relative">
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Campaign Metrics */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Views</p>
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.views)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Participations</p>
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.participations)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Conversions</p>
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.conversions)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
                      </div>
                    </div>

                    {/* Campaign Actions */}
                    <div className="mt-6 flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        Created {formatDate(campaign.created_at)}
                        {campaign.start_date && (
                          <> • Runs {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View Details
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                          Edit
                        </button>
                        {campaign.status === 'active' ? (
                          <button 
                            onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                            className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                          >
                            Pause
                          </button>
                        ) : campaign.status === 'paused' ? (
                          <button 
                            onClick={() => updateCampaignStatus(campaign.id, 'active')}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Resume
                          </button>
                        ) : campaign.status === 'draft' ? (
                          <button 
                            onClick={() => updateCampaignStatus(campaign.id, 'active')}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Launch
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};