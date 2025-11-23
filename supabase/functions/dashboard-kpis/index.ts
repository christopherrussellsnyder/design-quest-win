import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetricRecord {
  reach: number | null;
  engagement_rate: number | null;
  conversions: number | null;
  email_open_rate: number | null;
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return value.toLocaleString('en-US');
  }
  return value.toString();
}

function calculateChange(current: number, previous: number): { change: string; up: boolean } {
  if (previous === 0) return { change: '+100%', up: true };
  const percentChange = ((current - previous) / previous) * 100;
  const sign = percentChange >= 0 ? '+' : '';
  return {
    change: `${sign}${percentChange.toFixed(1)}%`,
    up: percentChange >= 0,
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header (check both cases)
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Authorization header present:', authHeader.substring(0, 20) + '...');

    // Create Supabase client with auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Fetching KPIs for user: ${user.id}`);

    // Get current date and 7 days ago
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Query latest metrics
    const { data: latestMetrics, error: latestError } = await supabaseClient
      .from('metrics_daily')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (latestError && latestError.code !== 'PGRST116') {
      console.error('Error fetching latest metrics:', latestError);
      throw latestError;
    }

    // Query metrics from 7 days ago
    const { data: previousMetrics, error: previousError } = await supabaseClient
      .from('metrics_daily')
      .select('*')
      .eq('user_id', user.id)
      .lte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (previousError && previousError.code !== 'PGRST116') {
      console.error('Error fetching previous metrics:', previousError);
    }

    // Default values if no data
    const current: MetricRecord = latestMetrics || {
      reach: 0,
      engagement_rate: 0,
      conversions: 0,
      email_open_rate: 0,
    };

    const previous: MetricRecord = previousMetrics || {
      reach: 0,
      engagement_rate: 0,
      conversions: 0,
      email_open_rate: 0,
    };

    // Calculate KPIs with changes
    const reachChange = calculateChange(current.reach ?? 0, previous.reach ?? 0);
    const engagementChange = calculateChange(
      current.engagement_rate ?? 0,
      previous.engagement_rate ?? 0
    );
    const conversionsChange = calculateChange(
      current.conversions ?? 0,
      previous.conversions ?? 0
    );
    const emailChange = calculateChange(
      current.email_open_rate ?? 0,
      previous.email_open_rate ?? 0
    );

    const response = {
      reach: {
        value: formatNumber(current.reach ?? 0),
        change: reachChange.change,
        up: reachChange.up,
        benchmark: 'Top 15%',
      },
      engagement_rate: {
        value: `${(current.engagement_rate ?? 0).toFixed(1)}%`,
        change: engagementChange.change,
        up: engagementChange.up,
        benchmark: 'Top 20%',
      },
      conversions: {
        value: formatNumber(current.conversions ?? 0),
        change: conversionsChange.change,
        up: conversionsChange.up,
        benchmark: 'Top 10%',
      },
      email_open_rate: {
        value: `${(current.email_open_rate ?? 0).toFixed(1)}%`,
        change: emailChange.change,
        up: emailChange.up,
        benchmark: 'Average',
      },
    };

    console.log('KPIs calculated successfully');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
