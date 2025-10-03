/**
 * Subscription Management Dashboard
 * Allows users to view and purchase subscription tiers
 */

import React, { useState, useEffect } from 'react';
import { Crown, Zap, Star, Check, ArrowRight, CreditCard, Users, Calendar } from 'lucide-react';
import { gemEconomyService } from '../../services/gem-economy.service';
import type { SubscriptionMilestone, GemBalance } from '../../services/gem-economy.service';

export function SubscriptionManagement() {
  const [milestones, setMilestones] = useState<SubscriptionMilestone[]>([]);
  const [gemBalance, setGemBalance] = useState<GemBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [milestonesData, balanceData] = await Promise.all([
        gemEconomyService.getSubscriptionMilestones(),
        gemEconomyService.getUserGemBalance()
      ]);
      
      setMilestones(milestonesData);
      setGemBalance(balanceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (milestoneId: string, milestonePrice: number) => {
    try {
      setPurchasing(milestoneId);
      
      await gemEconomyService.purchaseSubscription({
        milestone_id: milestoneId,
        payment_method: 'demo' // For demo purposes
      });
      
      alert('Subscription purchased successfully! 💎 Gems have been added to your account.');
      await loadData(); // Refresh data
    } catch (err) {
      alert(`Failed to purchase subscription: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setPurchasing(null);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const getTierIcon = (index: number) => {
    const icons = [Star, Zap, Crown];
    const Icon = icons[index % icons.length];
    return <Icon className="w-6 h-6" />;
  };

  const getTierColor = (index: number) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-purple-500 to-pink-600', 
      'from-pink-500 to-red-600'
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading subscription plans...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="text-red-600">⚠️</div>
            <div>
              <h3 className="font-medium text-red-800">Error Loading Subscriptions</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          💎 Subscription Plans
        </h1>
        <p className="text-gray-600 mb-6">
          Choose your subscription tier to unlock gems and start building your business network
        </p>
        
        {/* Current Gem Balance */}
        {gemBalance && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
            <Zap className="w-5 h-5" />
            <span className="font-medium">Current Balance: {gemBalance.total_gems} gems</span>
          </div>
        )}
      </div>

      {/* Subscription Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {milestones.map((milestone, index) => (
          <div
            key={milestone.id}
            className={`relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${
              milestone.spots_remaining <= 10 ? 'ring-2 ring-orange-400' : ''
            }`}
          >
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${getTierColor(index)} p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                {getTierIcon(index)}
                {milestone.spots_remaining <= 10 && (
                  <span className="px-2 py-1 bg-orange-500 text-orange-100 text-xs font-medium rounded-full">
                    {milestone.spots_remaining} spots left!
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold mb-2">{milestone.name}</h3>
              <p className="text-blue-100 text-sm">{milestone.description}</p>
            </div>

            {/* Pricing */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(milestone.monthly_price)}
                  <span className="text-sm font-normal text-gray-600">/month</span>
                </div>
                {milestone.trial_price < milestone.monthly_price && (
                  <div className="text-green-600 font-medium">
                    First month: {formatPrice(milestone.trial_price)}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    {milestone.monthly_gem_quota.toLocaleString()} gems per month
                  </span>
                </div>
                
                {milestone.bonus_gems > 0 && (
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      +{milestone.bonus_gems} bonus gems
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Create unlimited campaigns
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Agent approval system
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Analytics dashboard
                  </span>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Availability</span>
                  <span>{milestone.spots_remaining} / {milestone.spots_allocated}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ 
                      width: `${((milestone.spots_allocated - milestone.spots_remaining) / milestone.spots_allocated) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => handlePurchase(milestone.id, milestone.trial_price)}
                disabled={milestone.spots_remaining <= 0 || purchasing === milestone.id}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  milestone.spots_remaining <= 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : purchasing === milestone.id
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {purchasing === milestone.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : milestone.spots_remaining <= 0 ? (
                  'Sold Out'
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Start Subscription
                  </>
                )}
              </button>

              {milestone.spots_remaining <= 0 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Join waitlist for next tier opening
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">Dynamic Pricing</h3>
          <p className="text-sm text-gray-600">
            Prices increase as spots fill up. Lock in early bird pricing today!
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">Gem Economy</h3>
          <p className="text-sm text-gray-600">
            Use gems to approve agents, create campaigns, and grow your network.
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">Monthly Allocation</h3>
          <p className="text-sm text-gray-600">
            Receive your gem quota every month to keep your business growing.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionManagement;