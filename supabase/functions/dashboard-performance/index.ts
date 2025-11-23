import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PerformanceData {
  date: string;
  day_name: string;
  engagement: number | null;
  conversions: number | null;
  reach: number | null;
}

const VALID_TIME_RANGES = ['7d', '30d', '90d'] as const;
type TimeRange = typeof VALID_TIME_RANGES[number];

function getDaysFromTimeRange(timeRange: TimeRange): number {
  switch (timeRange) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    default:
      return 7;
  }
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

    console.log(`Fetching performance data for user: ${user.id}`);

    // Get timeRange from request body or URL params
    let timeRange: string = '7d';
    
    try {
      const url = new URL(req.url);
      const urlTimeRange = url.searchParams.get('timeRange');
      
      if (req.method === 'POST') {
        const body = await req.json();
        timeRange = body.timeRange || urlTimeRange || '7d';
      } else {
        timeRange = urlTimeRange || '7d';
      }
    } catch (e) {
      console.log('Could not parse timeRange, using default 7d');
    }

    // Validate timeRange
    if (!VALID_TIME_RANGES.includes(timeRange as TimeRange)) {
      console.error('Invalid time range:', timeRange);
      return new Response(
        JSON.stringify({ error: 'Invalid time range. Must be one of: 7d, 30d, 90d' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const days = getDaysFromTimeRange(timeRange as TimeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateString = startDate.toISOString().split('T')[0];

    console.log(`Fetching performance data for ${timeRange} (${days} days) starting from ${startDateString}`);

    // Query performance data for the specified time range
    const { data: performanceData, error: performanceError } = await supabaseClient
      .from('performance_data')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDateString)
      .order('date', { ascending: true });

    if (performanceError) {
      console.error('Database error fetching performance data:', performanceError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch performance data', details: performanceError.message }),
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

    // Format performance data for chart
    const formattedData = performanceData.map((record: PerformanceData) => ({
      name: record.day_name,
      engagement: record.engagement ?? 0,
      conversions: record.conversions ?? 0,
      reach: record.reach ?? 0,
    }));

    console.log(`Successfully fetched ${formattedData.length} performance records`);

    return new Response(JSON.stringify(formattedData), {
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
