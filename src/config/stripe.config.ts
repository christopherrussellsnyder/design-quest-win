export const STRIPE_TIERS = {
  pro: {
    name: 'Pro',
    monthly: {
      price_id: 'price_1TKjFMB3lJMypeTCDX5ocIGJ',
      product_id: 'prod_UJLxjx4LDdH1Ps',
      price: 49,
    },
    yearly: {
      price_id: 'price_1TKjFeB3lJMypeTCAXRa1u1e',
      product_id: 'prod_UJLxyYaqUCGjHg',
      price: 490,
    },
    strategies_limit: Infinity,
  },
  agency: {
    name: 'Agency',
    monthly: {
      price_id: 'price_1TKjGBB3lJMypeTCYvd6pNta',
      product_id: 'prod_UJLyj76FsosYjb',
      price: 149,
    },
    yearly: {
      price_id: 'price_1TKjGeB3lJMypeTCVkybzQnM',
      product_id: 'prod_UJLyrKQhr9PclL',
      price: 1490,
    },
    strategies_limit: Infinity,
  },
} as const;

export const TRIAL_STRATEGY_LIMIT = 2;

// Map all product IDs to tiers
export const PRODUCT_TO_TIER: Record<string, string> = {
  'prod_UJLxjx4LDdH1Ps': 'pro',
  'prod_UJLxyYaqUCGjHg': 'pro',
  'prod_UJLyj76FsosYjb': 'agency',
  'prod_UJLyrKQhr9PclL': 'agency',
};

export type SubscriptionTier = 'pro' | 'agency' | null;

export interface SubscriptionState {
  subscribed: boolean;
  tier: SubscriptionTier;
  subscription_end: string | null;
  trial_end: string | null;
  is_trialing: boolean;
  isLoading: boolean;
}
