import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface StrategyRequest {
  platform: string;
  durationDays: number;
  goals?: string[];
  customInstructions?: string;
  conversationId?: string;
}

interface StrategyPost {
  day_number: number;
  post_date: string;
  post_time: string;
  post_type: string;
  theme: string;
  hook: string;
  caption: string;
  hashtags: string[];
  cta: string;
  predicted_reach: number;
  predicted_engagement: number;
  rationale: string;
}

interface StrategyResponse {
  strategy_overview: {
    title: string;
    platform: string;
    duration_days: number;
    start_date: string;
    end_date: string;
    goals: string[];
    content_mix: Record<string, number>;
    predicted_metrics: {
      total_reach: number;
      avg_engagement_rate: number;
      expected_follower_growth: number;
    };
  };
  posts: StrategyPost[];
}

function buildStrategyPrompt(
  platform: string,
  durationDays: number,
  businessContext: any,
  recentAnalytics: any[],
  goals?: string[],
  customInstructions?: string
): string {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);

  const bp = businessContext?.business_profile || {};
  const businessName = bp.businessName || 'your business';
  const industry = bp.industry || 'general';
  const targetAudience = bp.targetAudience || {};
  const brandIdentity = bp.brandIdentity || {};
  
  // Extract best performing patterns from analytics
  let bestContentType = 'carousel';
  let avgEngagementRate = 3.5;
  let optimalPostingTimes = '9:00 AM, 12:00 PM, 7:00 PM';
  
  if (recentAnalytics?.length > 0) {
    const latestMetrics = recentAnalytics[0]?.metrics || {};
    avgEngagementRate = latestMetrics.engagement_rate || avgEngagementRate;
  }

  return `You are generating a comprehensive ${durationDays}-day ${platform} content strategy for ${businessName}.

BUSINESS CONTEXT:
- Business Name: ${businessName}
- Industry: ${industry}
- Business Type: ${bp.businessType || 'B2C'}
- Target Audience: ${targetAudience.ageRange || '25-44'} years old, ${targetAudience.customerType || 'consumers'}
- Brand Voice: ${brandIdentity.toneCharacteristics?.join(', ') || 'professional, engaging'}
- Value Proposition: ${brandIdentity.valueProposition || 'High-quality products/services'}
${bp.productsServices?.length ? `- Products/Services: ${bp.productsServices.map((p: any) => p.name).join(', ')}` : ''}

CURRENT PERFORMANCE:
- Average Engagement Rate: ${avgEngagementRate}%
- Best Performing Content: ${bestContentType}
- Optimal Posting Times: ${optimalPostingTimes}

USER GOALS:
${goals?.length ? goals.map(g => `- ${g}`).join('\n') : '- Increase engagement\n- Grow follower base\n- Drive conversions'}

${customInstructions ? `ADDITIONAL REQUIREMENTS:\n${customInstructions}\n` : ''}

Generate a ${durationDays}-day content strategy with the following structure:

For EACH day (Day 1 through Day ${durationDays}), provide a post with:
1. day_number: (1-${durationDays})
2. post_date: (actual date starting from ${startDate.toISOString().split('T')[0]})
3. post_time: (optimal time in HH:MM format, 24hr)
4. post_type: (carousel, reel, single_image, video, story, text)
5. theme: (educational, promotional, engagement, social_proof, behind_scenes)
6. hook: (5-10 words, attention-grabbing opening)
7. caption: (150-250 words, ${platform}-optimized, engaging, value-driven, include line breaks for readability)
8. hashtags: (10-15 relevant hashtags as array)
9. cta: (specific call-to-action)
10. predicted_reach: (estimated reach number based on historical data)
11. predicted_engagement: (estimated engagement rate as percentage)
12. rationale: (why this post on this day - brief explanation)

STRATEGY STRUCTURE (narrative arc):
- Week 1: Awareness & Education (introduce value, build trust)
- Week 2: Engagement & Trust (build relationship, share stories)
- Week 3: Consideration & Desire (showcase benefits, social proof)
- Week 4: Conversion & Action (drive goals, strong CTAs)

CONTENT MIX (distribute across ${durationDays} days):
- 30% Educational (teach, inform, provide value)
- 25% Promotional (products, services, offers)
- 20% Engagement (questions, polls, user interaction)
- 15% Social Proof (testimonials, reviews, results)
- 10% Behind-the-Scenes (team, process, culture)

OPTIMIZATION RULES:
- Schedule posts at optimal times for ${platform}
- Reference specific products/services from business profile
- Match the brand voice described above
- Target the specified audience demographics
- Aim for ${Math.max(avgEngagementRate * 1.1, 4)}% engagement or higher

IMPORTANT: Return ONLY valid JSON (no markdown, no code blocks). Return the response in this exact format:
{
  "strategy_overview": {
    "title": "${durationDays}-Day ${platform.charAt(0).toUpperCase() + platform.slice(1)} Strategy",
    "platform": "${platform}",
    "duration_days": ${durationDays},
    "start_date": "${startDate.toISOString().split('T')[0]}",
    "end_date": "${endDate.toISOString().split('T')[0]}",
    "goals": ${JSON.stringify(goals || ["Increase engagement", "Grow followers", "Drive conversions"])},
    "content_mix": {
      "educational": 30,
      "promotional": 25,
      "engagement": 20,
      "social_proof": 15,
      "behind_scenes": 10
    },
    "predicted_metrics": {
      "total_reach": 60000,
      "avg_engagement_rate": 4.8,
      "expected_follower_growth": 450
    }
  },
  "posts": [
    {
      "day_number": 1,
      "post_date": "${startDate.toISOString().split('T')[0]}",
      "post_time": "19:00",
      "post_type": "carousel",
      "theme": "educational",
      "hook": "5 Mistakes Killing Your Results",
      "caption": "[Full 200-word caption here with line breaks]",
      "hashtags": ["#marketing", "#socialmedia", "#business"],
      "cta": "Save this for later reference!",
      "predicted_reach": 1500,
      "predicted_engagement": 5.2,
      "rationale": "Educational carousel posts perform well. Week 1 focuses on awareness."
    }
  ]
}

Make each post unique, valuable, and aligned with the narrative arc. Generate exactly ${durationDays} posts.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { platform, durationDays = 30, goals, customInstructions, conversationId } = await req.json() as StrategyRequest;

    console.log(`Generating ${durationDays}-day strategy for ${platform} for user ${user.id}`);

    // Fetch business context
    const { data: businessContext } = await supabase
      .from('business_context')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    // Fetch recent analytics
    const { data: recentAnalytics } = await supabase
      .from('uploaded_analytics')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false })
      .limit(3);

    const prompt = buildStrategyPrompt(
      platform,
      durationDays,
      businessContext,
      recentAnalytics || [],
      goals,
      customInstructions
    );

    console.log('Calling AI gateway for strategy generation...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert content strategist. Generate detailed, actionable content plans. Always respond with valid JSON only, no markdown formatting.' 
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    let strategyText = aiResponse.choices?.[0]?.message?.content || '';
    
    console.log('Raw AI response length:', strategyText.length);

    // Clean up the response - remove markdown code blocks if present
    strategyText = strategyText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    let strategyData: StrategyResponse;
    try {
      strategyData = JSON.parse(strategyText);
    } catch (parseError) {
      console.error('Failed to parse strategy JSON:', parseError);
      console.error('Raw text (first 500 chars):', strategyText.substring(0, 500));
      
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate we have posts
    if (!strategyData.posts || strategyData.posts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No posts generated. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generated ${strategyData.posts.length} posts`);

    // Save strategy to database
    const { data: savedStrategy, error: strategyError } = await supabase
      .from('content_strategies')
      .insert({
        user_id: user.id,
        title: strategyData.strategy_overview.title,
        platform: platform,
        duration_days: durationDays,
        start_date: strategyData.strategy_overview.start_date,
        end_date: strategyData.strategy_overview.end_date,
        goals: strategyData.strategy_overview.goals,
        content_mix: strategyData.strategy_overview.content_mix,
        predicted_metrics: strategyData.strategy_overview.predicted_metrics,
        conversation_id: conversationId || null,
      })
      .select()
      .single();

    if (strategyError) {
      console.error('Error saving strategy:', strategyError);
      return new Response(
        JSON.stringify({ error: 'Failed to save strategy' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save all posts
    const postsToInsert = strategyData.posts.map((post, index) => ({
      strategy_id: savedStrategy.id,
      day_number: post.day_number || index + 1,
      post_date: post.post_date,
      post_time: post.post_time,
      post_type: post.post_type,
      theme: post.theme,
      hook: post.hook,
      caption: post.caption,
      hashtags: post.hashtags,
      cta: post.cta,
      predicted_reach: post.predicted_reach,
      predicted_engagement: post.predicted_engagement,
      rationale: post.rationale,
      sort_order: index + 1,
    }));

    const { error: postsError } = await supabase
      .from('strategy_posts')
      .insert(postsToInsert);

    if (postsError) {
      console.error('Error saving posts:', postsError);
      // Clean up the strategy if posts failed
      await supabase.from('content_strategies').delete().eq('id', savedStrategy.id);
      return new Response(
        JSON.stringify({ error: 'Failed to save strategy posts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Strategy ${savedStrategy.id} saved with ${postsToInsert.length} posts`);

    return new Response(
      JSON.stringify({
        success: true,
        strategyId: savedStrategy.id,
        strategy: {
          ...strategyData.strategy_overview,
          id: savedStrategy.id,
        },
        postsCount: strategyData.posts.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate strategy error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
