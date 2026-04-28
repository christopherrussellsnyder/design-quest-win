import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { STRIPE_TIERS } from '@/config/stripe.config';
import { toast } from 'sonner';
import { KorexLogoLockup } from '@/components/branding/KorexLogoLockup';

const plans = [
  {
    key: 'pro' as const,
    name: 'Pro',
    monthlyPrice: 49,
    yearlyPrice: 490,
    popular: true,
    features: [
      'Unlimited AI strategies',
      'Unlimited analytics uploads',
      'All platforms supported',
      'Export to PDF',
      'Priority support',
      'Cancel anytime',
    ],
  },
  {
    key: 'agency' as const,
    name: 'Agency',
    monthlyPrice: 149,
    yearlyPrice: 1490,
    popular: false,
    features: [
      'Everything in Pro',
      'Multi-client management (coming soon)',
      'White-label reports (coming soon)',
      'API access (coming soon)',
      'Dedicated support',
    ],
    badge: 'Popular for agencies',
  },
];

export default function Pricing() {
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { tier, subscribed, refreshSubscription } = useSubscription();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Subscription activated! Welcome to Korex.');
      refreshSubscription();
    }
  }, [searchParams, refreshSubscription]);

  const handleCheckout = async (planKey: 'pro' | 'agency') => {
    setLoadingPlan(planKey);
    try {
      const interval = billingAnnual ? 'yearly' : 'monthly';
      const priceId = STRIPE_TIERS[planKey][interval].price_id;
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        // Mobile browsers block window.open() after an await (gesture is "consumed"),
        // so use top-level navigation on touch devices and a new tab on desktop.
        const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
        if (isMobile) {
          window.location.href = data.url;
        } else {
          const opened = window.open(data.url, '_blank');
          if (!opened) window.location.href = data.url;
        }
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
        const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
        if (isMobile) {
          window.location.href = data.url;
        } else {
          const opened = window.open(data.url, '_blank');
          if (!opened) window.location.href = data.url;
        }
      }
    } catch (err) {
      toast.error('Failed to open billing portal.');
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] text-[#EEEEEE] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-8">
            <KorexLogoLockup height={48} className="mx-auto" />
          </Link>
          <h1 className="text-3xl sm:text-[48px] font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '3px' }}>
            Simple, Transparent Pricing
          </h1>
          <p className="text-[#A0A0A8] mb-6">Includes 2 free strategy generations. Upgrade anytime.</p>
          
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!billingAnnual ? 'text-white' : 'text-[#6B6B73]'}`}>Monthly</span>
            <button
              onClick={() => setBillingAnnual(!billingAnnual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${billingAnnual ? 'bg-[#CC0000]' : 'bg-[#3A3B3E]'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${billingAnnual ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
            <span className={`text-sm ${billingAnnual ? 'text-white' : 'text-[#6B6B73]'}`}>Yearly</span>
            {billingAnnual && <span className="text-xs bg-[#CC0000]/20 text-[#CC0000] px-2 py-0.5 rounded-full font-semibold">Save 2 months</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = tier === plan.key && subscribed;
            const displayPrice = billingAnnual ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
            const totalYearly = plan.yearlyPrice;
            const savings = plan.monthlyPrice * 12 - plan.yearlyPrice;

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
                <div className="mb-2">
                  <span className="text-4xl font-black" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                    ${displayPrice}
                  </span>
                  <span className="text-[#6B6B73] text-sm">/month</span>
                </div>
                {billingAnnual && (
                  <p className="text-xs text-[#6B6B73] mb-4">
                    ${totalYearly}/year · Save ${savings}
                  </p>
                )}
                {!billingAnnual && <div className="mb-4" />}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm text-[#A0A0A8]">
                      <Check className="w-4 h-4 text-[#CC0000] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrentPlan ? (
                  <button
                    onClick={handleManage}
                    className="block text-center py-3 rounded-lg font-bold text-sm border border-green-500 text-green-400 hover:bg-green-500/10 transition-all w-full"
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
                    {loadingPlan === plan.key ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Start Free'}
                  </button>
                )}
                <p className="text-xs text-[#6B6B73] text-center mt-3">No credit card required</p>
                {plan.badge && <p className="text-xs text-[#A0A0A8] text-center mt-1">{plan.badge}</p>}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link to="/" className="text-[#6B6B73] hover:text-[#CC0000] transition-colors text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
