/**
 * Gem Wallet Interface
 * Shows gem balance, transaction history, and purchase options
 */

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingCart
} from 'lucide-react';
import { gemEconomyService } from '../../services/gem-economy.service';
import type { GemBalance, GemTransaction, GemPackage } from '../../services/gem-economy.service';

export function GemWallet() {
  const [gemBalance, setGemBalance] = useState<GemBalance | null>(null);
  const [transactions, setTransactions] = useState<GemTransaction[]>([]);
  const [gemPackages, setGemPackages] = useState<GemPackage[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'purchase'>('overview');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [balance, transactionHistory, packages, transactionStats] = await Promise.all([
        gemEconomyService.getUserGemBalance(),
        gemEconomyService.getUserGemTransactions(20),
        gemEconomyService.getGemPackages(),
        gemEconomyService.getGemTransactionStats()
      ]);

      setGemBalance(balance);
      setTransactions(transactionHistory);
      setGemPackages(packages);
      setStats(transactionStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchasePackage = async (packageId: string) => {
    try {
      setPurchasing(packageId);
      
      await gemEconomyService.purchaseGemPackage(packageId, 'demo');
      
      alert('Gem package purchased successfully! 💎');
      await loadWalletData(); // Refresh data
    } catch (err) {
      alert(`Failed to purchase gem package: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setPurchasing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (transaction: GemTransaction) => {
    const isIncoming = transaction.recipient_id && transaction.amount > 0;
    return isIncoming ? (
      <ArrowDownLeft className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowUpRight className="w-4 h-4 text-red-600" />
    );
  };

  const getTransactionColor = (transaction: GemTransaction) => {
    const isIncoming = transaction.recipient_id && transaction.amount > 0;
    return isIncoming ? 'text-green-600' : 'text-red-600';
  };

  const formatTransactionType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading wallet data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="text-red-600">⚠️</div>
            <div>
              <h3 className="font-medium text-red-800">Error Loading Wallet</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={loadWalletData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-blue-600" />
            Gem Wallet
          </h1>
          <p className="text-gray-600 mt-2">Manage your gems and track transactions</p>
        </div>
        
        <button
          onClick={loadWalletData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: Wallet },
          { id: 'transactions', label: 'Transactions', icon: Calendar },
          { id: 'purchase', label: 'Purchase Gems', icon: ShoppingCart }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium">Total Balance</h2>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="text-4xl font-bold mb-6">
              {gemBalance?.total_gems?.toLocaleString() || 0} gems
            </div>
            
            {showDetails && gemBalance && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-sm opacity-90">Allocated</div>
                  <div className="font-semibold">{gemBalance.allocated_gems.toLocaleString()}</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-sm opacity-90">Purchased</div>
                  <div className="font-semibold">{gemBalance.purchased_gems.toLocaleString()}</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-sm opacity-90">Commission</div>
                  <div className="font-semibold">{gemBalance.commission_gems.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-gray-900">Total Earned</h3>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.total_earned.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <h3 className="font-medium text-gray-900">Total Spent</h3>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {stats.total_spent.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">This Month</h3>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.transactions_this_month}
                </div>
                <div className="text-sm text-gray-600">transactions</div>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-medium text-gray-900 mb-4">Recent Transactions</h3>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatTransactionType(transaction.transaction_type)}
                        </div>
                        <div className="text-sm text-gray-600">{formatDate(transaction.created_at)}</div>
                      </div>
                    </div>
                    <div className={`font-bold ${getTransactionColor(transaction)}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} gems
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {transactions.length > 5 && (
              <button
                onClick={() => setActiveTab('transactions')}
                className="w-full mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                View All Transactions
              </button>
            )}
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-medium text-gray-900">Transaction History</h2>
          </div>
          
          <div className="p-6">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No transactions found</p>
            ) : (
              <div className="space-y-3">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(transaction)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatTransactionType(transaction.transaction_type)}
                        </div>
                        <div className="text-sm text-gray-600">{transaction.reason}</div>
                        <div className="text-xs text-gray-500">{formatDate(transaction.created_at)}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-bold ${getTransactionColor(transaction)}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} gems
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        transaction.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Purchase Tab */}
      {activeTab === 'purchase' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Additional Gems</h2>
            <p className="text-gray-600">Boost your gem balance with these exclusive packages</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gemPackages.map(gemPackage => {
              const totalGems = gemPackage.gem_amount + Math.floor(gemPackage.gem_amount * gemPackage.bonus_percentage / 100);
              const bonusGems = totalGems - gemPackage.gem_amount;
              
              return (
                <div key={gemPackage.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{gemPackage.name}</h3>
                    {gemPackage.description && (
                      <p className="text-gray-600 text-sm mb-4">{gemPackage.description}</p>
                    )}
                    
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        ${gemPackage.price_usd}
                      </div>
                      <div className="text-lg font-medium text-gray-900">
                        {gemPackage.gem_amount.toLocaleString()} gems
                      </div>
                      {bonusGems > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          +{bonusGems.toLocaleString()} bonus gems ({gemPackage.bonus_percentage}%)
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handlePurchasePackage(gemPackage.id)}
                      disabled={purchasing === gemPackage.id}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                        purchasing === gemPackage.id
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {purchasing === gemPackage.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Purchase Package
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {gemPackages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No gem packages available at the moment</p>
              <button
                onClick={loadWalletData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Refresh Packages
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GemWallet;