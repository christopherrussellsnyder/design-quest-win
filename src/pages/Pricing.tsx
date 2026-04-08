import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { STRIPE_TIERS } from '@/config/stripe.config';
import { toast } from 'sonner';

const plans = [
  {
    key: 'starter' as const,
    name: 'Starter',
    price: '$29',
    period: '/month',
    popular: false,
    features: ['5 AI strategies per month', 'Basic analytics uploads', 'Single platform support', 'Email support'],
    missing: ['Advanced analytics', 'Priority support', 'Multi-client features'],
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    price: '$99',
    period: '/month',
    popular: true,
    features: ['Unlimited AI strategies', 'Multi-format analytics', 'All platform support', 'Priority support', 'Advanced reporting', 'Team collaboration'],
    missing: [],
  },
  {
    key: 'agency' as const,
    name: 'Agency',
    price: '$299',
    period: '/month',
    popular: false,
    features: ['Everything in Pro', 'Multi-client management', 'White-label options', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee'],
    missing: [],
  },
];

export default function Pricing() {
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { tier, subscribed, is_trialing, refreshSubscription } = useSubscription();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Subscription activated! Welcome to Korex.');
      refreshSubscription();
    }
  }, [searchParams, refreshSubscription]);

  const handleCheckout = async (planKey: 'starter' | 'pro' | 'agency') => {
    setLoadingPlan(planKey);
    try {
      const priceId = STRIPE_TIERS[planKey].price_id;
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      toast.error('Failed to start checkout. Please try again.');
      console.error(err);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      toast.error('Failed to open billing portal.');
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] text-[#EEEEEE] py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-8">
            <img src="/korex-wordmark-lockup.svg" alt="Korex" className="h-12 mx-auto" />
          </Link>
          <h1 className="text-3xl sm:text-[42px] font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '3px' }}>
            Choose Your Plan
          </h1>
          <p className="text-[#A0A0A8] mb-6">All plans include a 7-day free trial. No credit card required to start.</p>
          
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!billingAnnual ? 'text-white' : 'text-[#6B6B73]'}`}>Monthly</span>
            <button
              onClick={() => setBillingAnnual(!billingAnnual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${billingAnnual ? 'bg-[#CC0000]' : 'bg-[#3A3B3E]'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${billingAnnual ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
            <span className={`text-sm ${billingAnnual ? 'text-white' : 'text-[#6B6B73]'}`}>Annual</span>
            {billingAnnual && <span className="text-xs bg-[#CC0000]/20 text-[#CC0000] px-2 py-0.5 rounded-full font-semibold">Save 20%</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = tier === plan.key && subscribed;
            const price = parseInt(plan.price.slice(1));
            const displayPrice = billingAnnual ? Math.round(price * 0.8) : price;

            return (
              <div
                key={plan.key}
                className={`relative bg-[#16171A] rounded-2xl p-8 h-full flex flex-col border transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular ? 'border-[#CC0000] shadow-[0_0_30px_rgba(204,0,0,0.15)]' : 'border-[#2A2B2E] hover:border-[#3A3B3E]'
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Your Plan
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                    ${displayPrice}
                  </span>
                  <span className="text-[#6B6B73] text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm text-[#A0A0A8]">
                      <Check className="w-4 h-4 text-[#CC0000] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm text-[#3A3B3E]">
                      <X className="w-4 h-4 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrentPlan ? (
                  <button
                    onClick={handleManage}
                    className="block text-center py-3 rounded-lg font-bold text-sm border border-green-500 text-green-400 hover:bg-green-500/10 transition-all"
                  >
                    Manage Subscription
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={loadingPlan === plan.key}
                    className={`block text-center py-3 rounded-lg font-bold text-sm transition-all w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#CC0000] to-[#990000] text-white hover:shadow-[0_0_20px_rgba(204,0,0,0.3)]'
                        : 'border border-[#3A3B3E] text-[#EEEEEE] hover:border-[#CC0000] hover:text-[#CC0000]'
                    }`}
                  >
                    {loadingPlan === plan.key ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Start Free Trial'}
                  </button>
                )}
                <p className="text-xs text-[#6B6B73] text-center mt-3">7-day free trial included</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link to="/" className="text-[#6B6B73] hover:text-[#CC0000] transition-colors text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
