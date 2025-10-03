/**
 * Partner Analytics Dashboard Component
 * Provides detailed performance insights and data visualization
 */

import React, { useState, useEffect } from 'react';
import { partnerAuthService } from '../../services/partner-auth.service';

interface AnalyticsData {
  metric_date: string;
  total_campaigns: number;
  active_campaigns: number;
  total_participants: number;
  total_conversions: number;
  conversion_rate: number;
  total_revenue: number;
  gems_earned: number;
  gems_spent: number;
  agent_count: number;
}

interface TimeRangeFilter {
  label: string;
  value: string;
  days: number;
}

export const PartnerAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeFilter>({
    label: 'Last 30 Days',
    value: '30d',
    days: 30
  });

  const timeRanges: TimeRangeFilter[] = [
    { label: 'Last 7 Days', value: '7d', days: 7 },
    { label: 'Last 30 Days', value: '30d', days: 30 },
    { label: 'Last 90 Days', value: '90d', days: 90 },
    { label: 'Last 12 Months', value: '12m', days: 365 }
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current partner
      const authState = await partnerAuthService.initialize();
      if (!authState.profile) {
        setError('Partner profile not found');
        return;
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - selectedTimeRange.days);

      // Load analytics data
      const data = await partnerAuthService.getPartnerAnalytics(authState.profile.id, {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      });

      setAnalyticsData(data);

    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return analyticsData.reduce((totals, day) => ({
      totalParticipants: totals.totalParticipants + day.total_participants,
      totalConversions: totals.totalConversions + day.total_conversions,
      totalRevenue: totals.totalRevenue + parseFloat(day.total_revenue.toString()),
      totalGemsEarned: totals.totalGemsEarned + day.gems_earned,
      totalGemsSpent: totals.totalGemsSpent + day.gems_spent,
      maxCampaigns: Math.max(totals.maxCampaigns, day.total_campaigns),
      maxAgents: Math.max(totals.maxAgents, day.agent_count)
    }), {
      totalParticipants: 0,
      totalConversions: 0,
      totalRevenue: 0,
      totalGemsEarned: 0,
      totalGemsSpent: 0,
      maxCampaigns: 0,
      maxAgents: 0
    });
  };

  const calculateGrowthRate = (metric: keyof AnalyticsData) => {
    if (analyticsData.length < 7) return 0;
    
    const recentWeek = analyticsData.slice(0, 7);
    const previousWeek = analyticsData.slice(7, 14);
    
    const recentTotal = recentWeek.reduce((sum, day) => sum + (day[metric] as number), 0);
    const previousTotal = previousWeek.reduce((sum, day) => sum + (day[metric] as number), 0);
    
    if (previousTotal === 0) return 0;
    return ((recentTotal - previousTotal) / previousTotal) * 100;
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

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const generateChartData = () => {
    // Simple ASCII-style chart representation
    const maxRevenue = Math.max(...analyticsData.map(d => parseFloat(d.total_revenue.toString())));
    return analyticsData.reverse().map(day => ({
      date: new Date(day.metric_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: parseFloat(day.total_revenue.toString()),
      participants: day.total_participants,
      height: maxRevenue > 0 ? (parseFloat(day.total_revenue.toString()) / maxRevenue) * 100 : 0
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadAnalyticsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();
  const revenueGrowth = calculateGrowthRate('total_revenue');
  const participantGrowth = calculateGrowthRate('total_participants');
  const chartData = generateChartData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="mt-2 text-gray-600">
                  Track your marketing performance and business growth
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedTimeRange.value}
                  onChange={(e) => {
                    const range = timeRanges.find(r => r.value === e.target.value);
                    if (range) setSelectedTimeRange(range);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timeRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totals.totalRevenue)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${
                revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {revenueGrowth >= 0 ? '↗️' : '↘️'} {formatPercentage(revenueGrowth)} vs last week
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(totals.totalParticipants)}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${
                participantGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {participantGrowth >= 0 ? '↗️' : '↘️'} {formatPercentage(participantGrowth)} vs last week
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totals.totalParticipants > 0 
                    ? ((totals.totalConversions / totals.totalParticipants) * 100).toFixed(1)
                    : '0.0'
                  }%
                </p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
            <div className="mt-4">
              <span className="text-gray-600 text-sm font-medium">
                {formatNumber(totals.totalConversions)} total conversions
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{totals.maxCampaigns}</p>
              </div>
              <div className="text-4xl">🎮</div>
            </div>
            <div className="mt-4">
              <span className="text-gray-600 text-sm font-medium">
                {totals.maxAgents} team members
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h3>
          {chartData.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-end space-x-1 h-64">
                {chartData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${data.height}%`, minHeight: data.height > 0 ? '4px' : '0px' }}
                      title={`${data.date}: ${formatCurrency(data.revenue)}`}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                {chartData.map((data, index) => (
                  index % Math.ceil(chartData.length / 6) === 0 ? (
                    <span key={index}>{data.date}</span>
                  ) : null
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📈</div>
              <p>No revenue data available</p>
              <p className="text-sm">Start running campaigns to see your revenue trends!</p>
            </div>
          )}
        </div>

        {/* Detailed Metrics Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Daily Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conv. Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gems
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.slice(0, 15).map((day) => {
                  const conversionRate = day.total_participants > 0 
                    ? (day.total_conversions / day.total_participants) * 100 
                    : 0;
                  
                  return (
                    <tr key={day.metric_date} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(day.metric_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(day.total_participants)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(day.total_conversions)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {conversionRate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(parseFloat(day.total_revenue.toString()))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        💎 +{day.gems_earned} / -{day.gems_spent}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {analyticsData.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>No analytics data available</p>
              <p className="text-sm">Data will appear here once you start running campaigns.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};