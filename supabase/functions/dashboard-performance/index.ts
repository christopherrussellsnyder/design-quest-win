import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PerformanceData {
  date: string;
  day_name: string;
  engagement: number;
  conversions: number;
  reach: number;
}

const VALID_TIME_RANGES = ['7d', '30d', '90d'] as const;
type TimeRange = typeof VALID_TIME_RANGES[number];

function getDaysFromTimeRange(timeRange: TimeRange): number {
  const mapping: Record<TimeRange, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };
  return mapping[timeRange];
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

    // Parse query parameters from URL or body
    const url = new URL(req.url);
    let timeRangeParam = url.searchParams.get('timeRange');
    
    // If not in URL, check request body
    if (!timeRangeParam && req.method === 'POST') {
      try {
        const body = await req.json();
        timeRangeParam = body.timeRange;
      } catch {
        // Body parsing failed, use default
      }
    }
    
    timeRangeParam = timeRangeParam || '7d';

    // Validate timeRange parameter
    if (!VALID_TIME_RANGES.includes(timeRangeParam as TimeRange)) {
      console.error('Invalid timeRange parameter:', timeRangeParam);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid timeRange parameter. Must be one of: 7d, 30d, 90d' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const timeRange = timeRangeParam as TimeRange;
    const days = getDaysFromTimeRange(timeRange);

    console.log(`Fetching performance data for user: ${user.id}, timeRange: ${timeRange} (${days} days)`);

    // Calculate the date threshold
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    console.log(`Querying data from ${startDateStr} onwards`);

    // Query performance data for the specified time range
    const { data: performanceData, error: performanceError } = await supabaseClient
      .from('performance_data')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDateStr)
      .order('date', { ascending: true });

    if (performanceError) {
      console.error('Database error fetching performance data:', performanceError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch performance data' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!performanceData) {
      console.log('No performance data found for user');
      return new Response(
        JSON.stringify([]),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Format data for chart display
    const formattedData = performanceData.map((item: PerformanceData) => ({
      name: item.day_name,
      engagement: item.engagement,
      conversions: item.conversions,
      reach: item.reach,
    }));

    console.log(`Successfully fetched ${formattedData.length} performance records`);

    return new Response(JSON.stringify(formattedData), {
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
