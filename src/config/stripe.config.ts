export const STRIPE_TIERS = {
  starter: {
    name: 'Starter',
    price_id: 'price_1TJzknB3lJMypeTCUo69ZLQj',
    product_id: 'prod_UIawRkLpiYZXzx',
    price: 29,
    strategies_limit: 5,
  },
  pro: {
    name: 'Pro',
    price_id: 'price_1TJzl6B3lJMypeTC9ZfbbGfi',
    product_id: 'prod_UIax8nuGLyp6xt',
    price: 99,
    strategies_limit: Infinity,
  },
  agency: {
    name: 'Agency',
    price_id: 'price_1TJzlPB3lJMypeTCf7dMsvxN',
    product_id: 'prod_UIaxJi5q8GgkP0',
    price: 299,
    strategies_limit: Infinity,
  },
} as const;

export type SubscriptionTier = keyof typeof STRIPE_TIERS | null;

export interface SubscriptionState {
  subscribed: boolean;
  tier: SubscriptionTier;
  subscription_end: string | null;
  trial_end: string | null;
  is_trialing: boolean;
  isLoading: boolean;
}
