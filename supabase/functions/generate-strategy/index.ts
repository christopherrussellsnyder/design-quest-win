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

function buildEnhancedStrategyPrompt(
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
  const productsServices = bp.productsServices || [];
  
  // Extract best performing patterns from analytics
  let bestContentType = 'carousel';
  let avgEngagementRate = 3.5;
  let optimalPostingTimes = ['09:00', '12:00', '19:00'];
  let currentFollowers = 1000;
  
  if (recentAnalytics?.length > 0) {
    const latestMetrics = recentAnalytics[0]?.metrics || {};
    avgEngagementRate = latestMetrics.engagement_rate || avgEngagementRate;
    currentFollowers = latestMetrics.followers || currentFollowers;
  }

  const targetEngagementRate = Math.max(avgEngagementRate * 1.15, 4.5);
  const goalsText = goals?.length ? goals.join(', ') : 'Increase engagement, Grow followers, Drive conversions';

  return `You are a world-class content strategist creating a comprehensive social media strategy.

STRATEGIC BRIEF:

CLIENT: ${businessName}
INDUSTRY: ${industry}
PLATFORM: ${platform}
DURATION: ${durationDays} days
START DATE: ${startDate.toISOString().split('T')[0]}
END DATE: ${endDate.toISOString().split('T')[0]}

BUSINESS INTELLIGENCE:
- Business Name: ${businessName}
- Industry: ${industry}
- Business Type: ${bp.businessType || 'B2C'}
- Products/Services: ${productsServices.length ? productsServices.map((p: any) => p.name || p).join(', ') : 'Various products/services'}
- Target Audience: ${targetAudience.ageRange || '25-44'} years old, ${targetAudience.customerType || 'consumers'}
- Brand Voice: ${brandIdentity.toneCharacteristics?.join(', ') || 'professional, engaging, authentic'}
- Value Proposition: ${brandIdentity.valueProposition || 'High-quality solutions for target audience'}

HISTORICAL PERFORMANCE DATA:
- Current Engagement Rate: ${avgEngagementRate}%
- Industry Benchmark: 3.5%
- Target Engagement Rate: ${targetEngagementRate.toFixed(1)}%
- Current Followers: ${currentFollowers.toLocaleString()}
- Best Performing Content: ${bestContentType}
- Optimal Posting Times: ${optimalPostingTimes.join(', ')}

STRATEGIC OBJECTIVES:
Primary Goals: ${goalsText}
${customInstructions ? `Custom Requirements: ${customInstructions}` : ''}

───────────────────────────────────────────────────────────────

STRATEGY DEVELOPMENT FRAMEWORK:

Generate a complete ${durationDays}-day content strategy with:

1. STRATEGY OVERVIEW with:
   - Strategic approach (core strategy, differentiator, competitive edge)
   - Content distribution by type and theme
   - Predicted outcomes (reach, engagement, follower growth)
   - Key tactics (5-7 specific tactics)
   - Weekly milestones
   - Risk assessment

2. WEEKLY BREAKDOWN (4 weeks):
   - Week 1: AWARENESS & EDUCATION - Introduce value, establish authority
   - Week 2: ENGAGEMENT & TRUST - Build relationship, encourage interaction
   - Week 3: CONSIDERATION & DESIRE - Showcase benefits, create desire
   - Week 4: CONVERSION & ACTION - Drive specific actions, convert interest

3. DETAILED POSTS (exactly ${durationDays} posts) - each with:
   - Timing and scheduling
   - Content details (type, category, theme, emotion, pillar)
   - Copy elements (hook with technique, opening, body, CTA with type/strength)
   - Hashtag strategy (organized by volume tier)
   - Visual guidance (description, colors, text overlay)
   - Performance predictions (reach, impressions, engagement, likes, comments, shares, saves, confidence level)
   - Strategic rationale (why this day, arc positioning, success metrics)
   - Optimization tips (engagement boosters, A/B test ideas, risk mitigation)

CONTENT MIX (distribute across ${durationDays} days):
- 30% Educational (teach, inform, provide value)
- 25% Promotional (products, services, offers)
- 20% Engagement (questions, polls, user interaction)
- 15% Social Proof (testimonials, reviews, results)
- 10% Behind-the-Scenes (team, process, culture)

POST TYPE MIX for ${platform}:
- 35% Carousels (highest engagement)
- 30% Reels/Videos (best reach)
- 20% Single Images (quick consumption)
- 15% Stories/Text (engagement drivers)

IMPORTANT: Return ONLY valid JSON with this exact structure:
{
  "strategy_overview": {
    "title": "${durationDays}-Day ${platform.charAt(0).toUpperCase() + platform.slice(1)} Strategy for ${businessName}",
    "platform": "${platform}",
    "duration_days": ${durationDays},
    "start_date": "${startDate.toISOString().split('T')[0]}",
    "end_date": "${endDate.toISOString().split('T')[0]}",
    "total_posts": ${durationDays},
    "strategic_approach": {
      "core_strategy": "[1-2 sentence strategic summary]",
      "key_differentiator": "[what makes this unique]",
      "competitive_edge": "[how this beats competitors]"
    },
    "goals": ${JSON.stringify(goals || ["Increase engagement", "Grow followers", "Drive conversions"])},
    "content_mix": {
      "educational": 30,
      "promotional": 25,
      "engagement": 20,
      "social_proof": 15,
      "behind_scenes": 10
    },
    "post_type_distribution": {
      "carousel": 11,
      "reel": 9,
      "single_image": 6,
      "video": 2,
      "story": 2
    },
    "predicted_metrics": {
      "total_reach": 75000,
      "total_impressions": 120000,
      "avg_engagement_rate": ${targetEngagementRate.toFixed(1)},
      "expected_follower_growth": 500,
      "expected_follower_growth_percentage": 5.0,
      "expected_profile_visits": 2500,
      "expected_website_clicks": 450,
      "expected_conversions": 25
    },
    "key_tactics": [
      "Lead with value-first educational content",
      "Use pattern-interrupt hooks for scroll-stopping",
      "Leverage social proof in week 3 for trust",
      "Include clear CTAs with urgency in week 4",
      "Optimize posting times based on audience activity"
    ],
    "success_milestones": {
      "week_1": "Reach 15K+ accounts, establish content rhythm",
      "week_2": "Achieve 4%+ engagement rate, grow community interaction",
      "week_3": "Drive 500+ profile visits, build purchase intent",
      "week_4": "Generate 25+ conversions, capture momentum"
    },
    "risk_assessment": {
      "potential_challenges": ["Algorithm changes", "Content fatigue", "Low initial reach"],
      "mitigation_strategies": ["Diversify content types", "A/B test hooks", "Engage with comments quickly"],
      "pivot_triggers": ["Engagement drops below 2%", "Reach declines 3 days in a row"]
    },
    "implementation_guide": {
      "posting_schedule": "Post daily at optimal times",
      "content_creation_timeline": "Create week's content 2-3 days ahead",
      "engagement_protocol": "Reply to comments within 1 hour of posting",
      "monitoring_schedule": "Check metrics daily, analyze weekly",
      "adjustment_criteria": "Pivot if engagement drops below 2.5%"
    }
  },
  "weekly_breakdown": [
    {
      "week": 1,
      "theme": "Awareness & Education",
      "objective": "Introduce value and establish authority",
      "post_count": 7,
      "key_messages": ["Position as industry expert", "Address pain points", "Provide actionable tips"],
      "expected_metrics": {
        "reach": 15000,
        "engagement_rate": 4.2,
        "follower_growth": 80
      },
      "focus_areas": ["Educational carousels", "How-to content", "Industry insights"]
    }
  ],
  "posts": [
    {
      "day_number": 1,
      "post_date": "${startDate.toISOString().split('T')[0]}",
      "post_time": "19:00",
      "week_number": 1,
      "week_theme": "Awareness & Education",
      "content_details": {
        "post_type": "carousel",
        "content_category": "educational",
        "specific_theme": "[specific topic]",
        "primary_emotion": "curiosity",
        "content_pillar": "expertise"
      },
      "copy_elements": {
        "hook": {
          "text": "[5-10 words, scroll-stopping]",
          "technique": "curiosity_gap",
          "psychological_principle": "Creates open loop that demands closure"
        },
        "opening": "[First 2-3 sentences expanding on hook]",
        "body": "[Main content, 100-150 words]",
        "cta": {
          "text": "[Specific call-to-action]",
          "type": "engage",
          "strength": "medium"
        },
        "full_caption": "[Complete formatted caption, 150-250 words]"
      },
      "hashtag_strategy": {
        "hashtags": ["#hashtag1", "#hashtag2"],
        "mix_breakdown": {
          "high_volume": ["#tag1", "#tag2", "#tag3"],
          "medium_volume": ["#tag4", "#tag5", "#tag6", "#tag7", "#tag8"],
          "niche": ["#tag9", "#tag10", "#tag11", "#tag12"],
          "branded": ["#brandtag1", "#brandtag2"]
        },
        "selection_rationale": "[Why these specific tags]"
      },
      "visual_guidance": {
        "visual_type": "carousel",
        "description": "[What the visual should show]",
        "color_palette": "[Colors based on brand]",
        "text_overlay": "[If applicable]",
        "attention_hook": "[What grabs attention visually]"
      },
      "performance_prediction": {
        "predicted_reach": 2000,
        "predicted_impressions": 3500,
        "predicted_engagement_rate": 5.2,
        "predicted_likes": 95,
        "predicted_comments": 12,
        "predicted_shares": 8,
        "predicted_saves": 25,
        "confidence_level": "High",
        "prediction_basis": "Based on educational carousel benchmarks"
      },
      "strategic_rationale": {
        "why_this_day": "[Strategic reason for this timing]",
        "arc_positioning": "[How it fits narrative arc]",
        "builds_toward": "[What this sets up]",
        "success_metrics": "[Key metrics to watch]"
      },
      "optimization_tips": {
        "engagement_boosters": ["Ask a question in caption", "Use contrarian hook"],
        "a_b_test_ideas": ["Test with/without emoji in hook", "Compare morning vs evening"],
        "potential_issues": ["May need stronger visual hook"],
        "risk_mitigation": ["Have backup hook ready"]
      }
    }
  ]
}

Generate exactly ${durationDays} detailed posts following this structure. Make each post unique, valuable, and strategically positioned within the narrative arc. Reference the specific business context and optimize for ${platform}.`;
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
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { platform, durationDays = 30, goals, customInstructions, conversationId } = await req.json() as StrategyRequest;

    console.log(`Generating enhanced ${durationDays}-day strategy for ${platform} for user ${user.id}`);

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

    // Fetch previous strategies for learning
    const { data: previousStrategies } = await supabase
      .from('content_strategies')
      .select('predicted_metrics, platform')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .order('created_at', { ascending: false })
      .limit(3);

    const prompt = buildEnhancedStrategyPrompt(
      platform,
      durationDays,
      businessContext,
      recentAnalytics || [],
      goals,
      customInstructions
    );

    console.log('Calling AI gateway for enhanced strategy generation...');

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
            content: 'You are a world-class content strategist specializing in social media marketing. Generate detailed, actionable content strategies with comprehensive data. Always respond with valid JSON only, no markdown formatting or code blocks.' 
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.75,
        max_tokens: 20000,
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

    // Clean up the response
    strategyText = strategyText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    let strategyData: any;
    try {
      strategyData = JSON.parse(strategyText);
    } catch (parseError) {
      console.error('Failed to parse strategy JSON:', parseError);
      console.error('Raw text (first 1000 chars):', strategyText.substring(0, 1000));
      
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

    console.log(`Generated ${strategyData.posts.length} enhanced posts`);

    const overview = strategyData.strategy_overview;
    const predictedMetrics = overview.predicted_metrics || {};

    // Save strategy to database with enhanced fields
    const { data: savedStrategy, error: strategyError } = await supabase
      .from('content_strategies')
      .insert({
        user_id: user.id,
        title: overview.title,
        platform: platform,
        duration_days: durationDays,
        start_date: overview.start_date,
        end_date: overview.end_date,
        goals: overview.goals,
        content_mix: overview.content_mix,
        predicted_metrics: predictedMetrics,
        conversation_id: conversationId || null,
        // Enhanced fields
        strategic_approach: overview.strategic_approach,
        weekly_breakdown: strategyData.weekly_breakdown,
        key_tactics: overview.key_tactics,
        success_milestones: overview.success_milestones,
        risk_assessment: overview.risk_assessment,
        implementation_guide: overview.implementation_guide,
        post_type_distribution: overview.post_type_distribution,
        theme_distribution: overview.content_mix,
        predicted_impressions: predictedMetrics.total_impressions,
        predicted_website_clicks: predictedMetrics.expected_website_clicks,
        predicted_conversions: predictedMetrics.expected_conversions,
        version: 1,
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

    // Save all posts with enhanced fields
    const postsToInsert = strategyData.posts.map((post: any, index: number) => {
      const copyElements = post.copy_elements || {};
      const hookData = copyElements.hook || {};
      const ctaData = copyElements.cta || {};
      const contentDetails = post.content_details || {};
      const perfPrediction = post.performance_prediction || {};
      const stratRationale = post.strategic_rationale || {};
      const optTips = post.optimization_tips || {};
      
      return {
        strategy_id: savedStrategy.id,
        day_number: post.day_number || index + 1,
        post_date: post.post_date,
        post_time: post.post_time,
        post_type: contentDetails.post_type || post.post_type,
        theme: contentDetails.content_category || post.theme,
        hook: hookData.text || post.hook,
        caption: copyElements.full_caption || post.caption,
        hashtags: post.hashtag_strategy?.hashtags || post.hashtags,
        cta: ctaData.text || post.cta,
        predicted_reach: perfPrediction.predicted_reach || post.predicted_reach,
        predicted_engagement: perfPrediction.predicted_engagement_rate || post.predicted_engagement,
        rationale: stratRationale.why_this_day || post.rationale,
        sort_order: index + 1,
        // Enhanced fields
        week_number: post.week_number,
        week_theme: post.week_theme,
        content_category: contentDetails.content_category,
        primary_emotion: contentDetails.primary_emotion,
        content_pillar: contentDetails.content_pillar,
        hook_technique: hookData.technique,
        hook_principle: hookData.psychological_principle,
        opening_text: copyElements.opening,
        body_text: copyElements.body,
        cta_type: ctaData.type,
        cta_strength: ctaData.strength,
        hashtag_mix: post.hashtag_strategy?.mix_breakdown,
        visual_guidance: post.visual_guidance,
        predicted_impressions: perfPrediction.predicted_impressions,
        predicted_likes: perfPrediction.predicted_likes,
        predicted_comments: perfPrediction.predicted_comments,
        predicted_shares: perfPrediction.predicted_shares,
        predicted_saves: perfPrediction.predicted_saves,
        performance_confidence: perfPrediction.confidence_level,
        prediction_basis: perfPrediction.prediction_basis,
        strategic_rationale: stratRationale,
        optimization_tips: optTips,
      };
    });

    const { error: postsError } = await supabase
      .from('strategy_posts')
      .insert(postsToInsert);

    if (postsError) {
      console.error('Error saving posts:', postsError);
      await supabase.from('content_strategies').delete().eq('id', savedStrategy.id);
      return new Response(
        JSON.stringify({ error: 'Failed to save strategy posts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Enhanced strategy ${savedStrategy.id} saved with ${postsToInsert.length} posts`);

    return new Response(
      JSON.stringify({
        success: true,
        strategyId: savedStrategy.id,
        strategy: {
          ...overview,
          id: savedStrategy.id,
        },
        weeklyBreakdown: strategyData.weekly_breakdown,
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
