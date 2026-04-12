import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TRIAL_STRATEGY_LIMIT } from '@/config/stripe.config';

export type SubscriptionTier = 'pro' | 'agency' | null;

interface SubscriptionState {
  subscribed: boolean;
  tier: SubscriptionTier;
  subscription_end: string | null;
  isLoading: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
  refreshSubscription: () => Promise<void>;
  planLabel: string;
  strategiesUsed: number;
  canGenerateStrategy: boolean;
}

const defaultState: SubscriptionState = {
  subscribed: false,
  tier: null,
  subscription_end: null,
  isLoading: true,
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  ...defaultState,
  refreshSubscription: async () => {},
  planLabel: 'Starter',
  strategiesUsed: 0,
  canGenerateStrategy: true,
});

export const useSubscription = () => useContext(SubscriptionContext);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>(defaultState);
  const [strategiesUsed, setStrategiesUsed] = useState(0);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({ ...defaultState, isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;

      setState({
        subscribed: data.subscribed || false,
        tier: (data.tier as SubscriptionTier) || null,
        subscription_end: data.subscription_end || null,
        isLoading: false,
      });
      setStrategiesUsed(data.strategies_used || 0);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Subscription check failed:', err);
      setState({ ...defaultState, isLoading: false });
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const planLabel = state.subscribed
    ? state.tier
      ? `${state.tier.charAt(0).toUpperCase() + state.tier.slice(1)} Plan`
      : 'Active'
    : 'Starter';

  const canGenerateStrategy = state.subscribed || strategiesUsed < TRIAL_STRATEGY_LIMIT;

  return (
    <SubscriptionContext.Provider value={{ ...state, refreshSubscription: checkSubscription, planLabel, strategiesUsed, canGenerateStrategy }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
