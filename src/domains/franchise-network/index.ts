/**
 * Franchise Network Domain Exports
 * Business model, subscriptions, and gem economy
 */

// Services
export { gemEconomyService } from './services/gem-economy.service';

// Components
export * from './components/subscription-management';

// Types
export type { 
  GemBalance, 
  GemTransaction, 
  SubscriptionMilestone, 
  GemPackage,
  CreateGemTransactionRequest,
  SubscriptionPurchaseRequest
} from './services/gem-economy.service';