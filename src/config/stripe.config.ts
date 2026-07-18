export const STRIPE_TIERS = {
  pro: {
    name: 'Pro',
    monthly: {
      price_id: 'price_1Tub2eL7HyckspfcSDvFWQUV',
      product_id: 'prod_UuPs7XFGchuAOC',
      price: 49,
    },
    yearly: {
      price_id: 'price_1Tub2tL7Hyckspfc48whRVvm',
      product_id: 'prod_UuPsofAJQj79gO',
      price: 490,
    },
    strategies_limit: Infinity,
  },
  agency: {
    name: 'Agency',
    monthly: {
      price_id: 'price_1Tub34L7HyckspfcEMih6qkz',
      product_id: 'prod_UuPsM90xu8d47e',
      price: 149,
    },
    yearly: {
      price_id: 'price_1Tub3HL7Hyckspfchn3uIgnA',
      product_id: 'prod_UuPtrGta7sU60Q',
      price: 1490,
    },
    strategies_limit: Infinity,
  },
} as const;

// Lifetime cap for the free Starter plan
export const STARTER_STRATEGY_LIMIT = 2;
// Backwards-compat alias (used by existing imports)
export const TRIAL_STRATEGY_LIMIT = STARTER_STRATEGY_LIMIT;

// Map all product IDs to tiers
export const PRODUCT_TO_TIER: Record<string, string> = {
  'prod_UuPs7XFGchuAOC': 'pro',
  'prod_UuPsofAJQj79gO': 'pro',
  'prod_UuPsM90xu8d47e': 'agency',
  'prod_UuPtrGta7sU60Q': 'agency',
};

export type SubscriptionTier = 'pro' | 'agency' | null;

export interface SubscriptionState {
  subscribed: boolean;
  tier: SubscriptionTier;
  subscription_end: string | null;
  isLoading: boolean;
}
