/**
 * Gem Economy Service
 * Handles all gem transactions, subscriptions, and payment processing
 */

import { supabase } from '../../../shared-kernel/supabase/client';

export interface GemBalance {
  id: string;
  user_id: string;
  total_gems: number;
  allocated_gems: number;
  purchased_gems: number;
  commission_gems: number;
  last_updated: string;
}

export interface GemTransaction {
  id: string;
  sender_id?: string;
  recipient_id?: string;
  amount: number;
  transaction_type: 
    | 'subscription_allocation'
    | 'agent_approval'
    | 'campaign_creation'
    | 'add_on_purchase'
    | 'manual_transfer'
    | 'commission_earned'
    | 'refund'
    | 'admin_adjustment';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reason: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionMilestone {
  id: string;
  name: string;
  description?: string;
  spots_allocated: number;
  spots_remaining: number;
  monthly_price: number; // in USD cents
  trial_price: number; // in USD cents
  monthly_gem_quota: number;
  bonus_gems: number;
  is_active: boolean;
  order_index: number;
  auto_progress: boolean;
  created_at: string;
  updated_at: string;
}

export interface GemPackage {
  id: string;
  name: string;
  description?: string;
  gem_amount: number;
  price_usd: number;
  bonus_percentage: number;
  target_audience: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGemTransactionRequest {
  recipient_id?: string;
  amount: number;
  transaction_type: GemTransaction['transaction_type'];
  reason: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionPurchaseRequest {
  milestone_id: string;
  payment_method: 'stripe' | 'paypal' | 'demo';
  payment_metadata?: Record<string, any>;
}

export class GemEconomyService {
  
  /**
   * Get current user's gem balance
   */
  async getUserGemBalance(): Promise<GemBalance> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: balance, error } = await supabase
      .from('gem_balances')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to fetch gem balance: ${error.message}`);
    }

    // Create balance if it doesn't exist
    if (!balance) {
      const { data: newBalance, error: createError } = await supabase
        .from('gem_balances')
        .insert({
          user_id: user.user.id,
          total_gems: 0,
          allocated_gems: 0,
          purchased_gems: 0,
          commission_gems: 0
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create gem balance: ${createError.message}`);
      }

      return newBalance;
    }

    return balance;
  }

  /**
   * Get all available subscription milestones
   */
  async getSubscriptionMilestones(): Promise<SubscriptionMilestone[]> {
    const { data: milestones, error } = await supabase
      .from('subscription_milestones')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch subscription milestones: ${error.message}`);
    }

    return milestones || [];
  }

  /**
   * Get available gem packages for purchase
   */
  async getGemPackages(): Promise<GemPackage[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.user.id)
      .single();

    const userRole = profile?.role || 'user';

    const { data: packages, error } = await supabase
      .from('gem_packages')
      .select('*')
      .eq('is_active', true)
      .contains('target_audience', [userRole])
      .order('price_usd', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch gem packages: ${error.message}`);
    }

    return packages || [];
  }

  /**
   * Create a gem transaction
   */
  async createGemTransaction(request: CreateGemTransactionRequest): Promise<string> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Validate the user has sufficient gems for spending transactions
    if (request.amount < 0) {
      const balance = await this.getUserGemBalance();
      if (balance.total_gems < Math.abs(request.amount)) {
        throw new Error('Insufficient gem balance');
      }
    }

    // Create the transaction
    const { data: transaction, error } = await supabase
      .from('gem_transactions')
      .insert({
        sender_id: request.amount < 0 ? user.user.id : null,
        recipient_id: request.recipient_id || (request.amount > 0 ? user.user.id : null),
        amount: request.amount,
        transaction_type: request.transaction_type,
        reason: request.reason,
        metadata: request.metadata || {},
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create gem transaction: ${error.message}`);
    }

    // Process the transaction
    await this.processGemTransaction(transaction.id);

    return transaction.id;
  }

  /**
   * Process a pending gem transaction
   */
  private async processGemTransaction(transactionId: string): Promise<void> {
    const { data: transaction, error: fetchError } = await supabase
      .from('gem_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !transaction) {
      throw new Error('Transaction not found or already processed');
    }

    try {
      // Update gem balances based on transaction type
      if (transaction.recipient_id) {
        await this.updateUserGemBalance(
          transaction.recipient_id,
          transaction.amount,
          transaction.transaction_type
        );
      }

      if (transaction.sender_id && transaction.amount < 0) {
        await this.updateUserGemBalance(
          transaction.sender_id,
          transaction.amount,
          transaction.transaction_type
        );
      }

      // Mark transaction as completed
      const { error: updateError } = await supabase
        .from('gem_transactions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) {
        throw new Error(`Failed to complete transaction: ${updateError.message}`);
      }

    } catch (error) {
      // Mark transaction as failed
      await supabase
        .from('gem_transactions')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      throw error;
    }
  }

  /**
   * Update user gem balance
   */
  private async updateUserGemBalance(
    userId: string, 
    amount: number, 
    transactionType: GemTransaction['transaction_type']
  ): Promise<void> {
    const { data: currentBalance, error: fetchError } = await supabase
      .from('gem_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch user balance: ${fetchError.message}`);
    }

    const newBalance = { ...currentBalance };
    newBalance.total_gems += amount;

    // Update specific balance categories
    switch (transactionType) {
      case 'subscription_allocation':
        newBalance.allocated_gems += amount;
        break;
      case 'add_on_purchase':
        newBalance.purchased_gems += amount;
        break;
      case 'commission_earned':
        newBalance.commission_gems += amount;
        break;
      case 'agent_approval':
      case 'campaign_creation':
        // These are spending transactions, subtract from total
        break;
      default:
        // Other transaction types just affect total
        break;
    }

    const { error: updateError } = await supabase
      .from('gem_balances')
      .update({
        total_gems: newBalance.total_gems,
        allocated_gems: newBalance.allocated_gems,
        purchased_gems: newBalance.purchased_gems,
        commission_gems: newBalance.commission_gems,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(`Failed to update gem balance: ${updateError.message}`);
    }
  }

  /**
   * Purchase a subscription milestone
   */
  async purchaseSubscription(request: SubscriptionPurchaseRequest): Promise<string> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Get milestone details
    const { data: milestone, error: milestoneError } = await supabase
      .from('subscription_milestones')
      .select('*')
      .eq('id', request.milestone_id)
      .eq('is_active', true)
      .single();

    if (milestoneError || !milestone) {
      throw new Error('Subscription milestone not found');
    }

    // Check if spots are available
    if (milestone.spots_remaining <= 0) {
      throw new Error('No spots remaining for this subscription tier');
    }

    // For demo purposes, we'll simulate payment processing
    if (request.payment_method === 'demo') {
      // Simulate successful payment
      await this.processSubscriptionPayment(user.user.id, milestone);
      return `demo_payment_${Date.now()}`;
    }

    // In a real implementation, you would integrate with Stripe, PayPal, etc.
    throw new Error('Payment processing not implemented for non-demo payments');
  }

  /**
   * Process successful subscription payment
   */
  private async processSubscriptionPayment(
    userId: string, 
    milestone: SubscriptionMilestone
  ): Promise<void> {
    // 1. Update subscription milestone spots
    const { error: milestoneError } = await supabase
      .from('subscription_milestones')
      .update({
        spots_remaining: milestone.spots_remaining - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestone.id);

    if (milestoneError) {
      throw new Error(`Failed to update milestone: ${milestoneError.message}`);
    }

    // 2. Allocate monthly gems
    const totalGems = milestone.monthly_gem_quota + milestone.bonus_gems;
    await this.createGemTransaction({
      amount: totalGems,
      transaction_type: 'subscription_allocation',
      reason: `Monthly allocation for ${milestone.name} subscription`,
      metadata: {
        milestone_id: milestone.id,
        milestone_name: milestone.name,
        base_gems: milestone.monthly_gem_quota,
        bonus_gems: milestone.bonus_gems
      }
    });

    // 3. Update user profile status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }
  }

  /**
   * Purchase additional gem package
   */
  async purchaseGemPackage(packageId: string, paymentMethod: 'stripe' | 'paypal' | 'demo'): Promise<string> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Get package details
    const { data: gemPackage, error: packageError } = await supabase
      .from('gem_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (packageError || !gemPackage) {
      throw new Error('Gem package not found');
    }

    // For demo purposes, simulate payment
    if (paymentMethod === 'demo') {
      const totalGems = gemPackage.gem_amount + Math.floor(gemPackage.gem_amount * gemPackage.bonus_percentage / 100);
      
      await this.createGemTransaction({
        amount: totalGems,
        transaction_type: 'add_on_purchase',
        reason: `Purchased ${gemPackage.name} gem package`,
        metadata: {
          package_id: packageId,
          package_name: gemPackage.name,
          base_gems: gemPackage.gem_amount,
          bonus_gems: totalGems - gemPackage.gem_amount,
          price_paid: gemPackage.price_usd
        }
      });

      return `gem_purchase_${Date.now()}`;
    }

    throw new Error('Payment processing not implemented for non-demo payments');
  }

  /**
   * Get user's gem transaction history
   */
  async getUserGemTransactions(limit: number = 50): Promise<GemTransaction[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: transactions, error } = await supabase
      .from('gem_transactions')
      .select('*')
      .or(`sender_id.eq.${user.user.id},recipient_id.eq.${user.user.id}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    return transactions || [];
  }

  /**
   * Get gem transaction statistics
   */
  async getGemTransactionStats(): Promise<{
    total_earned: number;
    total_spent: number;
    transactions_this_month: number;
    most_common_transaction_type: string;
  }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const transactions = await this.getUserGemTransactions(1000); // Get more for stats

    const earned = transactions
      .filter(t => t.recipient_id === user.user.id && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const spent = Math.abs(transactions
      .filter(t => t.sender_id === user.user.id && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0));

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const transactionsThisMonth = transactions.filter(t => 
      new Date(t.created_at) >= thisMonth
    ).length;

    // Find most common transaction type
    const typeCounts: Record<string, number> = {};
    transactions.forEach(t => {
      typeCounts[t.transaction_type] = (typeCounts[t.transaction_type] || 0) + 1;
    });

    const mostCommonType = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b, 'none'
    );

    return {
      total_earned: earned,
      total_spent: spent,
      transactions_this_month: transactionsThisMonth,
      most_common_transaction_type: mostCommonType
    };
  }

  /**
   * Check if user can afford a gem cost
   */
  async canAfford(gemCost: number): Promise<boolean> {
    const balance = await this.getUserGemBalance();
    return balance.total_gems >= gemCost;
  }

  /**
   * Spend gems for a specific purpose
   */
  async spendGems(
    amount: number, 
    purpose: 'agent_approval' | 'campaign_creation', 
    metadata: Record<string, any> = {}
  ): Promise<string> {
    if (amount <= 0) {
      throw new Error('Spend amount must be positive');
    }

    const canAfford = await this.canAfford(amount);
    if (!canAfford) {
      throw new Error('Insufficient gems for this transaction');
    }

    return await this.createGemTransaction({
      amount: -amount, // Negative for spending
      transaction_type: purpose,
      reason: `Spent ${amount} gems for ${purpose.replace('_', ' ')}`,
      metadata
    });
  }
}

// Export singleton instance
export const gemEconomyService = new GemEconomyService();