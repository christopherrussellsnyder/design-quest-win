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

    // Lifetime strategy usage (Starter plan = 2 lifetime cap)
    const { data: usageRows } = await supabaseClient
      .from("usage_tracking")
      .select("lifetime_strategies_generated")
      .eq("user_id", user.id)
      .order("lifetime_strategies_generated", { ascending: false })
      .limit(1);
    const strategiesUsed = usageRows?.[0]?.lifetime_strategies_generated ?? 0;

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({
        subscribed: false,
        tier: null,
        subscription_end: null,
        strategies_used: strategiesUsed,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
    const activeSub = subscriptions.data.find(s => s.status === "active");

    if (!activeSub) {
      return new Response(JSON.stringify({
        subscribed: false,
        tier: null,
        subscription_end: null,
        strategies_used: strategiesUsed,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const productId = activeSub.items.data[0].price.product as string;
    const tier = PRODUCT_TO_TIER[productId] || "pro";
    const subscriptionEnd = new Date(activeSub.current_period_end * 1000).toISOString();

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
        cancel_at_period_end: activeSub.cancel_at_period_end,
      }, { onConflict: "user_id" });

    return new Response(JSON.stringify({
      subscribed: true,
      tier,
      subscription_end: subscriptionEnd,
      strategies_used: strategiesUsed,
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
