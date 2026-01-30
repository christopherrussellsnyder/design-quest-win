import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ContextPreferences {
  response_style?: 'concise' | 'detailed' | 'balanced';
  tone_preference?: 'formal' | 'casual' | 'balanced';
  include_examples?: boolean;
}

interface BusinessContext {
  businessProfile?: {
    businessName?: string;
    industry?: string;
    businessType?: string;
    stage?: string;
    summary?: string;
    targetAudience?: {
      ageRange?: string;
      customerType?: string;
      genderFocus?: string;
      incomeLevel?: string;
      interests?: string[];
      painPoints?: string[];
    };
    brandIdentity?: {
      voiceScale?: number;
      toneCharacteristics?: string[];
      valueProposition?: string;
      brandValues?: string[];
    };
    productsServices?: Array<{ name?: string; description?: string }>;
    competitors?: string[];
    marketingMaturity?: {
      websiteQuality?: number;
      seoLevel?: string;
      socialPresence?: string;
    };
  };
  recentAnalytics?: Array<{
    platform?: string;
    metrics?: Record<string, any>;
    insights?: string;
    healthScore?: number;
    performanceRating?: string;
    trendAnalysis?: {
      positive_trends?: any[];
      negative_trends?: any[];
      growth_momentum?: string;
    };
    recommendations?: any[];
  }>;
  pastStrategies?: Array<{
    id: string;
    platform: string;
    created_at: string;
    predicted_metrics?: any;
    posts_count?: number;
  }>;
  interactionPatterns?: {
    frequentTopics?: string[];
    preferredContentFocus?: string;
    skillLevel?: string;
  };
  performanceTrends?: {
    trajectory?: string;
    engagementTrend?: string;
    growthMomentum?: string;
  };
}

function buildEnhancedSystemPrompt(
  context: BusinessContext, 
  preferences: ContextPreferences,
  conversationHistory: Array<{role: string; content: string}>
): string {
  const { businessProfile: bp, recentAnalytics, pastStrategies, performanceTrends } = context;
  const { response_style = 'balanced', tone_preference = 'balanced', include_examples = true } = preferences;

  let prompt = `You are an expert AI marketing strategist with deep knowledge of ${bp?.industry || 'marketing'} marketing, social media algorithms, content strategy, and data-driven growth tactics.

═══════════════════════════════════════════════════════════════
CLIENT PROFILE
═══════════════════════════════════════════════════════════════
`;

  if (bp) {
    prompt += `BUSINESS: ${bp.businessName || 'Not specified'}
INDUSTRY: ${bp.industry || 'Not specified'}
BUSINESS TYPE: ${bp.businessType || 'Not specified'}
STAGE: ${bp.stage || 'Not specified'}

`;

    if (bp.summary) {
      prompt += `OVERVIEW: ${bp.summary}

`;
    }

    if (bp.productsServices?.length) {
      prompt += `PRODUCTS/SERVICES:
${bp.productsServices.map(p => `- ${p.name}: ${p.description || 'No description'}`).join('\n')}

`;
    }

    if (bp.targetAudience) {
      const ta = bp.targetAudience;
      prompt += `TARGET AUDIENCE:
- Age Range: ${ta.ageRange || 'Not specified'}
- Customer Type: ${ta.customerType || 'Not specified'}
- Gender Focus: ${ta.genderFocus || 'Not specified'}
- Income Level: ${ta.incomeLevel || 'Not specified'}
${ta.interests?.length ? `- Interests: ${ta.interests.join(', ')}` : ''}
${ta.painPoints?.length ? `- Pain Points: ${ta.painPoints.join(', ')}` : ''}

`;
    }

    if (bp.brandIdentity) {
      const bi = bp.brandIdentity;
      prompt += `BRAND IDENTITY:
- Voice Scale (1-10, 1=formal, 10=casual): ${bi.voiceScale || 5}
${bi.toneCharacteristics?.length ? `- Tone: ${bi.toneCharacteristics.join(', ')}` : ''}
${bi.valueProposition ? `- Value Proposition: ${bi.valueProposition}` : ''}
${bi.brandValues?.length ? `- Brand Values: ${bi.brandValues.join(', ')}` : ''}

`;
    }

    if (bp.competitors?.length) {
      prompt += `COMPETITORS: ${bp.competitors.join(', ')}

`;
    }

    if (bp.marketingMaturity) {
      prompt += `MARKETING MATURITY:
- Website Quality: ${bp.marketingMaturity.websiteQuality}/10
- SEO Level: ${bp.marketingMaturity.seoLevel}
- Social Presence: ${bp.marketingMaturity.socialPresence}

`;
    }
  } else {
    prompt += `No business profile available yet. Ask the user to analyze their website for personalized recommendations.

`;
  }

  prompt += `═══════════════════════════════════════════════════════════════
CURRENT PERFORMANCE DATA
═══════════════════════════════════════════════════════════════
`;

  if (recentAnalytics?.length) {
    const latest = recentAnalytics[0];
    prompt += `RECENT ANALYTICS (${latest.platform?.toUpperCase() || 'Unknown'}):
Health Score: ${latest.healthScore || 'N/A'}/10
Performance Rating: ${latest.performanceRating || 'N/A'}

KEY METRICS:
`;
    if (latest.metrics) {
      const m = latest.metrics;
      if (m.followers) prompt += `- Followers: ${m.followers.toLocaleString()}${m.followers_change ? ` (${m.followers_change > 0 ? '+' : ''}${m.followers_change}%)` : ''}\n`;
      if (m.engagement_rate) prompt += `- Engagement Rate: ${m.engagement_rate}%\n`;
      if (m.reach) prompt += `- Reach: ${m.reach.toLocaleString()}\n`;
      if (m.impressions) prompt += `- Impressions: ${m.impressions.toLocaleString()}\n`;
    }

    if (latest.trendAnalysis) {
      const trends = latest.trendAnalysis;
      if (trends.positive_trends?.length) {
        prompt += `\nTOP STRENGTHS:\n`;
        trends.positive_trends.slice(0, 3).forEach((t: any, i: number) => {
          prompt += `${i + 1}. ${t.metric || t}: ${t.change || ''}\n`;
        });
      }
      if (trends.negative_trends?.length) {
        prompt += `\nAREAS FOR IMPROVEMENT:\n`;
        trends.negative_trends.slice(0, 3).forEach((t: any, i: number) => {
          prompt += `${i + 1}. ${t.metric || t}: ${t.change || ''}\n`;
        });
      }
      if (trends.growth_momentum) {
        prompt += `\nGrowth Momentum: ${trends.growth_momentum}\n`;
      }
    }

    if (latest.recommendations?.length) {
      prompt += `\nTOP RECOMMENDATIONS:\n`;
      latest.recommendations.slice(0, 3).forEach((r: any, i: number) => {
        prompt += `${i + 1}. ${r.recommendation || r}\n`;
      });
    }

    if (latest.insights) {
      prompt += `\nKEY INSIGHTS:\n${latest.insights.slice(0, 500)}...\n`;
    }
  } else {
    prompt += `No analytics data uploaded yet. Encourage user to upload analytics screenshots for data-driven recommendations.

`;
  }

  if (performanceTrends) {
    prompt += `\nPERFORMANCE TRENDS:
- Overall Trajectory: ${performanceTrends.trajectory || 'Unknown'}
- Engagement Trend: ${performanceTrends.engagementTrend || 'Unknown'}
- Growth Momentum: ${performanceTrends.growthMomentum || 'Unknown'}

`;
  }

  if (pastStrategies?.length) {
    prompt += `\nHISTORICAL STRATEGIES:
- Strategies Created: ${pastStrategies.length}
- Most Recent: ${pastStrategies[0].platform} (${pastStrategies[0].posts_count || 0} posts)
- Last Created: ${new Date(pastStrategies[0].created_at).toLocaleDateString()}

`;
  }

  prompt += `═══════════════════════════════════════════════════════════════
YOUR CAPABILITIES & ROLE
═══════════════════════════════════════════════════════════════

You can:
1. **Strategic Analysis**: Analyze trends, identify patterns, predict outcomes based on data
2. **Content Creation**: Generate hooks, captions, hashtags, CTAs optimized for platforms
3. **Data Interpretation**: Read screenshot analytics, extract insights, make recommendations
4. **Strategy Generation**: Create comprehensive 30-day content calendars
5. **Competitive Intelligence**: Analyze competitor data when provided, identify gaps
6. **Performance Prediction**: Estimate reach, engagement, conversions based on historical data
7. **Website Analysis**: Understand business context from website scraping
8. **Problem Solving**: Address specific marketing challenges with actionable solutions
9. **Education**: Teach marketing concepts, algorithms, best practices
10. **Optimization**: Improve existing strategies, content, approaches

═══════════════════════════════════════════════════════════════
BEHAVIORAL GUIDELINES
═══════════════════════════════════════════════════════════════

COMMUNICATION STYLE:
- Be conversational, friendly, and professional
- Tone: ${tone_preference === 'formal' ? 'Professional and polished' : tone_preference === 'casual' ? 'Friendly and approachable' : 'Balanced professionalism with warmth'}
- Response length: ${response_style === 'concise' ? 'Keep responses brief and to the point' : response_style === 'detailed' ? 'Provide comprehensive, thorough responses' : 'Balance brevity with completeness'}
${include_examples ? '- Include relevant examples when helpful' : '- Focus on principles rather than examples'}
- Use the user's business context naturally (reference their products, audience, brand)
- Avoid generic advice - always personalize to their specific situation
- When uncertain, acknowledge it and explain your reasoning
- Celebrate wins and progress ("Your engagement is up 15%! That's excellent.")

DATA USAGE:
- ALWAYS cite specific data when making recommendations
  ✓ Good: "Based on your data showing carousel posts get 5.1% engagement vs 1.6% for single images, I recommend..."
  ✗ Bad: "Carousel posts might work well for you"
- Reference their actual metrics, not generic industry stats (unless comparing)
- When predicting outcomes, explain the basis: "Based on similar posts in your history..."
- If data is insufficient, ask for more: "To give you a precise recommendation, could you upload your recent analytics?"

RESPONSE STRUCTURE:
For Simple Questions:
1. Direct answer (1-2 sentences)
2. Supporting context if needed
3. Relevant follow-up question (if appropriate)

For Complex Requests:
1. Acknowledge the request
2. Provide comprehensive answer with structure
3. Offer next steps

For Strategy Requests:
1. Confirm you have enough context (or ask for missing data)
2. Generate comprehensive strategy
3. Highlight key elements
4. Provide implementation guidance

PROACTIVE BEHAVIOR:
- Identify opportunities: "I notice your engagement is 37% above average - want to create a strategy to capitalize on this?"
- Spot problems early: "Your posting frequency dropped 40% and engagement declined. Let's address this."
- Suggest next steps: "You've uploaded analytics - would you like me to create a strategy based on this data?"
- Connect dots: "You asked about Instagram strategy, but I notice your LinkedIn engagement is higher. Should we focus there instead?"

QUALITY STANDARDS:
Before every response, ensure:
✓ Referenced their specific business context
✓ Cited their actual data when making recommendations
✓ Actionable and clear
✓ Aligned with their stated goals
✓ Appropriate tone for this user
✓ Provided next steps if needed

AVOID:
✗ Generic advice that could apply to anyone
✗ Making claims without data support
✗ Recommending strategies that contradict their data
✗ Using marketing jargon without explanation
✗ Being vague ("try posting more" vs "increase from 8 to 15 posts per month")
✗ Overwhelming with too much information at once

═══════════════════════════════════════════════════════════════
PLATFORM-SPECIFIC EXPERTISE
═══════════════════════════════════════════════════════════════

Instagram:
- Algorithm favors Reels and carousels currently
- Best times: 7-9 PM weekdays, 11 AM-1 PM weekends
- Hashtag strategy: 3-5 highly relevant > 30 random
- Story completion rates matter for reach

TikTok:
- Algorithm favors watch time and completion rate
- Trending audio usage critical
- First 3 seconds determine success
- Post 1-3x daily for optimal growth

LinkedIn:
- Algorithm favors native content and engagement
- Best times: 7-8 AM, 12 PM, 5-6 PM weekdays
- Personal profiles > company pages for reach
- Long-form content performs well

Facebook:
- Groups and communities are powerful
- Video content prioritized
- Best times: 1-4 PM weekdays

`;

  // Add conversation context summary
  if (conversationHistory.length > 0) {
    const recentMessages = conversationHistory.slice(-5);
    const topics = extractTopics(recentMessages);
    if (topics.length > 0) {
      prompt += `═══════════════════════════════════════════════════════════════
CONVERSATION CONTEXT
═══════════════════════════════════════════════════════════════

Recent topics discussed: ${topics.join(', ')}
Messages in this conversation: ${conversationHistory.length}

Maintain continuity and build on previous discussion points.
`;
    }
  }

  prompt += `
═══════════════════════════════════════════════════════════════

Respond naturally, incorporating all relevant context above, citing specific data when applicable, and providing actionable guidance.`;

  return prompt;
}

function extractTopics(messages: Array<{role: string; content: string}>): string[] {
  const topics: string[] = [];
  const content = messages.map(m => m.content.toLowerCase()).join(' ');
  
  if (content.includes('strategy') || content.includes('plan')) topics.push('strategy');
  if (content.includes('engagement') || content.includes('likes') || content.includes('comments')) topics.push('engagement');
  if (content.includes('instagram') || content.includes('ig')) topics.push('Instagram');
  if (content.includes('tiktok')) topics.push('TikTok');
  if (content.includes('linkedin')) topics.push('LinkedIn');
  if (content.includes('content') || content.includes('post')) topics.push('content');
  if (content.includes('hashtag')) topics.push('hashtags');
  if (content.includes('analytics') || content.includes('metrics')) topics.push('analytics');
  if (content.includes('reach') || content.includes('impressions')) topics.push('reach');
  if (content.includes('competitor')) topics.push('competitors');
  
  return [...new Set(topics)].slice(0, 5);
}

async function fetchUserContext(supabase: any, userId: string): Promise<BusinessContext> {
  const context: BusinessContext = {};

  try {
    // Fetch business context
    const { data: businessData } = await supabase
      .from('business_context')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (businessData?.business_profile) {
      context.businessProfile = businessData.business_profile;
    }

    // Fetch recent analytics (last 3)
    const { data: analyticsData } = await supabase
      .from('uploaded_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })
      .limit(3);

    if (analyticsData?.length) {
      context.recentAnalytics = analyticsData.map((a: any) => ({
        platform: a.platform,
        metrics: a.extracted_data,
        insights: a.ai_insights,
        healthScore: a.overall_health_score,
        performanceRating: a.performance_rating,
        trendAnalysis: a.trend_analysis,
        recommendations: a.recommendations,
      }));

      // Calculate performance trends from multiple analytics
      if (analyticsData.length > 1) {
        context.performanceTrends = calculateTrends(analyticsData);
      }
    }

    // Fetch past strategies
    const { data: strategiesData } = await supabase
      .from('content_strategies')
      .select('id, platform, created_at, predicted_metrics, total_posts')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (strategiesData?.length) {
      context.pastStrategies = strategiesData.map((s: any) => ({
        id: s.id,
        platform: s.platform,
        created_at: s.created_at,
        predicted_metrics: s.predicted_metrics,
        posts_count: s.total_posts,
      }));
    }

  } catch (error) {
    console.error('Error fetching user context:', error);
  }

  return context;
}

function calculateTrends(analyticsData: any[]): any {
  if (analyticsData.length < 2) return null;

  const latest = analyticsData[0];
  const previous = analyticsData[1];

  const latestMetrics = latest.extracted_data || {};
  const previousMetrics = previous.extracted_data || {};

  let engagementChange = 0;
  if (latestMetrics.engagement_rate && previousMetrics.engagement_rate) {
    engagementChange = ((latestMetrics.engagement_rate - previousMetrics.engagement_rate) / previousMetrics.engagement_rate) * 100;
  }

  let trajectory = 'stable';
  if (engagementChange > 10) trajectory = 'improving';
  else if (engagementChange < -10) trajectory = 'declining';

  return {
    trajectory,
    engagementTrend: engagementChange > 0 ? `+${engagementChange.toFixed(1)}%` : `${engagementChange.toFixed(1)}%`,
    growthMomentum: trajectory === 'improving' ? 'Accelerating' : trajectory === 'declining' ? 'Slowing' : 'Steady',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      messages, 
      userId, 
      conversationId, 
      businessContext: providedContext,
      context_preferences = {}
    } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Enhanced AI Chat request:', {
      messagesCount: messages.length,
      hasUserId: !!userId,
      hasConversationId: !!conversationId,
      preferences: context_preferences,
    });

    // Build comprehensive context
    let fullContext: BusinessContext = providedContext || {};

    // If userId provided, fetch additional context from database
    if (userId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const dbContext = await fetchUserContext(supabase, userId);
      
      // Merge contexts (db context as base, provided context as override)
      fullContext = {
        ...dbContext,
        businessProfile: providedContext?.businessProfile || dbContext.businessProfile,
        recentAnalytics: providedContext?.recentAnalytics?.length 
          ? providedContext.recentAnalytics 
          : dbContext.recentAnalytics,
      };
    }

    // Build enhanced system prompt
    const systemPrompt = buildEnhancedSystemPrompt(
      fullContext, 
      context_preferences as ContextPreferences,
      messages
    );

    console.log('System prompt length:', systemPrompt.length);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
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
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Enhanced AI Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
