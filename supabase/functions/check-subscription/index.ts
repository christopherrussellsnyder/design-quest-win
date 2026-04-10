import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRODUCT_TO_TIER: Record<string, string> = {
  "prod_UJLxjx4LDdH1Ps": "pro",
  "prod_UJLxyYaqUCGjHg": "pro",
  "prod_UJLyj76FsosYjb": "agency",
  "prod_UJLyrKQhr9PclL": "agency",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    // Check local subscription record
    const { data: localSub } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (customers.data.length === 0) {
      // No Stripe customer - check if user has trial
      if (localSub && localSub.status === "trialing") {
        const trialEnd = localSub.trial_end;
        const isExpired = trialEnd && new Date(trialEnd) < new Date();
        
        // Get usage
        const monthYear = new Date().toISOString().slice(0, 7);
        const { data: usage } = await supabaseClient
          .from("usage_tracking")
          .select("strategies_generated")
          .eq("user_id", user.id)
          .eq("month_year", monthYear)
          .single();

        return new Response(JSON.stringify({
          subscribed: false,
          tier: null,
          subscription_end: null,
          trial_end: trialEnd,
          is_trialing: !isExpired,
          strategies_used: usage?.strategies_generated || 0,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      return new Response(JSON.stringify({ subscribed: false, tier: null, subscription_end: null, trial_end: null, is_trialing: false, strategies_used: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
    const activeSub = subscriptions.data.find(s => s.status === "active" || s.status === "trialing");

    // Get usage
    const monthYear = new Date().toISOString().slice(0, 7);
    const { data: usage } = await supabaseClient
      .from("usage_tracking")
      .select("strategies_generated")
      .eq("user_id", user.id)
      .eq("month_year", monthYear)
      .single();

    if (!activeSub) {
      return new Response(JSON.stringify({
        subscribed: false, tier: null, subscription_end: null,
        trial_end: localSub?.trial_end || null,
        is_trialing: false,
        strategies_used: usage?.strategies_generated || 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const productId = activeSub.items.data[0].price.product as string;
    const tier = PRODUCT_TO_TIER[productId] || "pro";
    const subscriptionEnd = new Date(activeSub.current_period_end * 1000).toISOString();
    const trialEnd = activeSub.trial_end ? new Date(activeSub.trial_end * 1000).toISOString() : null;
    const isTrialing = activeSub.status === "trialing";

    // Sync to local subscriptions table
    await supabaseClient
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: activeSub.id,
        plan_type: tier,
        status: activeSub.status,
        current_period_end: subscriptionEnd,
        trial_end: trialEnd,
        cancel_at_period_end: activeSub.cancel_at_period_end,
      }, { onConflict: "user_id" });

    return new Response(JSON.stringify({
      subscribed: true,
      tier,
      subscription_end: subscriptionEnd,
      trial_end: trialEnd,
      is_trialing: isTrialing,
      strategies_used: usage?.strategies_generated || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
