import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetricRecord {
  date: string;
  reach: number;
  engagement_rate: number;
  conversions: number;
  email_open_rate: number;
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return value.toLocaleString('en-US');
}

function calculateChange(current: number, previous: number): { change: string; up: boolean } {
  if (previous === 0) {
    return { change: '+0.0%', up: true };
  }
  
  const percentChange = ((current - previous) / previous) * 100;
  const isUp = percentChange >= 0;
  const formatted = `${isUp ? '+' : ''}${percentChange.toFixed(1)}%`;
  
  return { change: formatted, up: isUp };
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
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Fetching KPIs for user: ${user.id}`);

    // Get the most recent metrics
    const { data: recentData, error: recentError } = await supabaseClient
      .from('metrics_daily')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (recentError) {
      console.error('Error fetching recent metrics:', recentError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch recent metrics' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!recentData) {
      console.log('No metrics found for user');
      return new Response(
        JSON.stringify({ error: 'No metrics data available' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate date 7 days ago from the most recent record
    const recentDate = new Date(recentData.date);
    const sevenDaysAgo = new Date(recentDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    console.log(`Recent date: ${recentData.date}, Seven days ago: ${sevenDaysAgoStr}`);

    // Get metrics from 7 days ago
    const { data: previousData, error: previousError } = await supabaseClient
      .from('metrics_daily')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', sevenDaysAgoStr)
      .maybeSingle();

    if (previousError) {
      console.error('Error fetching previous metrics:', previousError);
    }

    // Build response with calculated changes
    const recent = recentData as MetricRecord;
    const previous = previousData as MetricRecord | null;

    const reachChange = previous
      ? calculateChange(recent.reach, previous.reach)
      : { change: '+0.0%', up: true };

    const engagementChange = previous
      ? calculateChange(recent.engagement_rate, previous.engagement_rate)
      : { change: '+0.0%', up: true };

    const conversionsChange = previous
      ? calculateChange(recent.conversions, previous.conversions)
      : { change: '+0.0%', up: true };

    const emailChange = previous
      ? calculateChange(recent.email_open_rate, previous.email_open_rate)
      : { change: '+0.0%', up: true };

    const response = {
      reach: {
        value: formatNumber(recent.reach),
        change: reachChange.change,
        up: reachChange.up,
      },
      engagement_rate: {
        value: `${recent.engagement_rate}%`,
        change: engagementChange.change,
        up: engagementChange.up,
      },
      conversions: {
        value: formatNumber(recent.conversions),
        change: conversionsChange.change,
        up: conversionsChange.up,
      },
      email_open_rate: {
        value: `${recent.email_open_rate}%`,
        change: emailChange.change,
        up: emailChange.up,
      },
    };

    console.log('Successfully calculated KPIs');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
