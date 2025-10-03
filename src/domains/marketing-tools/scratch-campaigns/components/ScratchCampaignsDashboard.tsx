/**
 * Scratch Campaigns Dashboard
 * Allows partners to view and manage their scratch campaigns
 */

import React, { useState, useEffect } from 'react';
import { Plus, Eye, BarChart3, Settings, Play, Pause, Trash2, ExternalLink } from 'lucide-react';
import { scratchCampaignService } from '../service';
import ScratchCampaignBuilder from './ScratchCampaignBuilder';

interface Campaign {
  id: string;
  name: string;
  business_name: string;
  status: string;
  type: string;
  created_at: string;
  config?: any;
  metrics?: {
    total_plays: number;
    total_wins: number;
    win_rate: number;
  };
}

export function ScratchCampaignsDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const campaignData = await scratchCampaignService.getUserCampaigns();
      setCampaigns(campaignData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampaignCreated = (campaignId: string) => {
    setShowBuilder(false);
    loadCampaigns(); // Refresh the list
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      archived: 'bg-gray-100 text-gray-600'
    };

    return styles[status as keyof typeof styles] || styles.draft;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const generatePublicUrl = (campaignId: string) => {
    return `${window.location.origin}/play/${campaignId}`;
  };

  if (showBuilder) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setShowBuilder(false)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </button>
        </div>
        <ScratchCampaignBuilder onCampaignCreated={handleCampaignCreated} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🎮 Scratch-and-Win Campaigns
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage your interactive scratch-off marketing campaigns
          </p>
        </div>
        
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus className="w-5 h-5" />
          Create Campaign
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="text-red-600">⚠️</div>
            <div>
              <h3 className="font-medium text-red-800">Error loading campaigns</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={loadCampaigns}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && campaigns.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No campaigns yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first scratch-and-win campaign to start engaging customers
          </p>
          <button
            onClick={() => setShowBuilder(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Create Your First Campaign
          </button>
        </div>
      )}

      {/* Campaigns Grid */}
      {!isLoading && !error && campaigns.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              {/* Campaign Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {campaign.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {campaign.business_name}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Analytics"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Campaign Metrics */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {campaign.metrics?.total_plays || 0}
                    </div>
                    <div className="text-xs text-gray-600">Plays</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {campaign.metrics?.total_wins || 0}
                    </div>
                    <div className="text-xs text-gray-600">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {campaign.metrics?.win_rate?.toFixed(1) || '0.0'}%
                    </div>
                    <div className="text-xs text-gray-600">Win Rate</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Created {formatDate(campaign.created_at)}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const url = generatePublicUrl(campaign.id);
                      navigator.clipboard.writeText(url);
                      alert('Campaign URL copied to clipboard!');
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Share
                  </button>
                  
                  {campaign.status === 'active' ? (
                    <button className="flex items-center gap-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-md hover:bg-yellow-100 text-sm">
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                  ) : (
                    <button className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 text-sm">
                      <Play className="w-4 h-4" />
                      Activate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium text-gray-900">
                  Campaign Details
                </h3>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Campaign Information</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span>{selectedCampaign.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business:</span>
                    <span>{selectedCampaign.business_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedCampaign.status)}`}>
                      {selectedCampaign.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{formatDate(selectedCampaign.created_at)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Public URL</h4>
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <code className="text-sm text-gray-800 break-all">
                    {generatePublicUrl(selectedCampaign.id)}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatePublicUrl(selectedCampaign.id));
                      alert('URL copied!');
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => window.open(generatePublicUrl(selectedCampaign.id), '_blank')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Preview Campaign
                </button>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScratchCampaignsDashboard;