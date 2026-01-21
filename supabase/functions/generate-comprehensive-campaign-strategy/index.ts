import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, platform, niche, objective, businessProfileId, duration = 30 } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log('Generating comprehensive 30-day strategy for:', { userId, platform, niche, objective });

    // Fetch business profile if provided
    let businessProfile: any = null;
    if (businessProfileId) {
      const { data } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', businessProfileId)
        .single();
      businessProfile = data;
    } else if (userId) {
      const { data } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      businessProfile = data;
    }

    // Fetch ML posting times
    const { data: mlTimes } = await supabase
      .from('ml_posting_time_predictions')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .order('predicted_engagement_rate', { ascending: false })
      .limit(5);

    // Fetch user's historical performance
    const { data: historicalPerformance } = await supabase
      .from('scheduled_posts')
      .select('content, impressions, engagements, published_at')
      .eq('user_id', userId)
      .eq('status', 'published')
      .not('impressions', 'is', null)
      .order('published_at', { ascending: false })
      .limit(50);

    // Fetch niche strategy
    const { data: nicheStrategy } = await supabase
      .from('niche_strategies')
      .select('*')
      .eq('platform', platform)
      .eq('niche', niche || businessProfile?.industry || 'ecommerce')
      .single();

    // Generate strategy using AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.log('No API key, generating fallback strategy');
      const fallbackStrategy = generateFallbackStrategy(platform, niche, businessProfile, duration);
      return new Response(
        JSON.stringify({ success: true, strategy: fallbackStrategy }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const strategyContext = buildStrategyContext(
      platform,
      niche || businessProfile?.industry || 'ecommerce',
      objective || 'engagement',
      businessProfile,
      historicalPerformance || [],
      nicheStrategy,
      mlTimes || []
    );

    console.log('Calling AI with context length:', strategyContext.length);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert social media strategist. Generate a comprehensive 30-day content strategy with exactly 30 unique posts. Each post should have compelling hooks, body copy, and CTAs tailored to the platform and niche. Follow the narrative arc: Days 1-7 (Awareness), Days 8-15 (Engagement), Days 16-23 (Consideration), Days 24-30 (Conversion).`
          },
          {
            role: 'user',
            content: strategyContext
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_30_day_strategy',
              description: 'Generate a comprehensive 30-day content strategy',
              parameters: {
                type: 'object',
                properties: {
                  overview: {
                    type: 'object',
                    properties: {
                      duration: { type: 'string' },
                      estimated_reach: { type: 'number' },
                      total_posts: { type: 'number' },
                      confidence_level: { type: 'string' },
                      investment_recommendation: { type: 'string' }
                    }
                  },
                  weekly_themes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        week: { type: 'number' },
                        name: { type: 'string' },
                        objective: { type: 'string' },
                        content_types: { type: 'array', items: { type: 'string' } },
                        expected_outcome: { type: 'string' }
                      }
                    }
                  },
                  content_calendar: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        day_number: { type: 'number' },
                        content_hook: { type: 'string' },
                        content_body: { type: 'string' },
                        content_cta: { type: 'string' },
                        content_type: { type: 'string' },
                        content_theme: { type: 'string' },
                        post_time_recommended: { type: 'string' },
                        expected_engagement_score: { type: 'number' },
                        hashtags: { type: 'array', items: { type: 'string' } },
                        reasoning: { type: 'string' }
                      }
                    }
                  },
                  predicted_metrics: {
                    type: 'object',
                    properties: {
                      impressions: { type: 'number' },
                      engagement_rate: { type: 'number' },
                      conversions: { type: 'number' },
                      roi_percentage: { type: 'number' },
                      confidence: { type: 'number' }
                    }
                  },
                  key_actions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        action: { type: 'string' },
                        priority: { type: 'string' },
                        expected_impact: { type: 'string' },
                        timing: { type: 'string' }
                      }
                    }
                  }
                },
                required: ['overview', 'weekly_themes', 'content_calendar', 'predicted_metrics', 'key_actions']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_30_day_strategy' } }
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI response not ok:', await aiResponse.text());
      const fallbackStrategy = generateFallbackStrategy(platform, niche, businessProfile, duration);
      return new Response(
        JSON.stringify({ success: true, strategy: fallbackStrategy }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const strategy = JSON.parse(toolCall.function.arguments);
      
      // Add platform and niche to strategy
      strategy.platform = platform;
      strategy.niche = niche || businessProfile?.industry || 'ecommerce';
      
      // Ensure we have 30 posts
      if (strategy.content_calendar?.length < 30) {
        const existingDays = new Set(strategy.content_calendar.map((p: any) => p.day_number));
        for (let day = 1; day <= 30; day++) {
          if (!existingDays.has(day)) {
            strategy.content_calendar.push(generateDayContent(day, platform, niche));
          }
        }
        strategy.content_calendar.sort((a: any, b: any) => a.day_number - b.day_number);
      }
      
      // Save strategy to database
      if (userId) {
        await supabase.from('campaign_ai_strategies').insert({
          user_id: userId,
          platform,
          niche: strategy.niche,
          strategy_data: strategy,
          predicted_metrics: strategy.predicted_metrics
        });
      }
      
      return new Response(
        JSON.stringify({ success: true, strategy }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fallbackStrategy = generateFallbackStrategy(platform, niche, businessProfile, duration);
    return new Response(
      JSON.stringify({ success: true, strategy: fallbackStrategy }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Strategy generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildStrategyContext(
  platform: string,
  niche: string,
  objective: string,
  businessProfile: any,
  historicalPerformance: any[],
  nicheStrategy: any,
  mlTimes: any[]
): string {
  let context = `Generate a 30-day content strategy for:\n\n`;
  context += `PLATFORM: ${platform}\n`;
  context += `INDUSTRY: ${niche}\n`;
  context += `OBJECTIVE: ${objective}\n\n`;
  
  if (businessProfile) {
    context += `BUSINESS PROFILE:\n`;
    context += `- Business Name: ${businessProfile.business_name || 'Not specified'}\n`;
    context += `- Target Audience: ${businessProfile.target_audience || 'General audience'}\n`;
    context += `- Unique Value Proposition: ${businessProfile.unique_value_proposition || 'Quality products/services'}\n`;
    context += `- Brand Voice: ${businessProfile.brand_voice || 'Professional'}\n`;
    context += `- Goals: ${JSON.stringify(businessProfile.goals || [])}\n\n`;
  }
  
  if (historicalPerformance.length > 0) {
    const avgEngagement = historicalPerformance.reduce((sum, p) => {
      const rate = p.impressions > 0 ? (p.engagements / p.impressions) * 100 : 0;
      return sum + rate;
    }, 0) / historicalPerformance.length;
    
    context += `HISTORICAL PERFORMANCE:\n`;
    context += `- Average Engagement Rate: ${avgEngagement.toFixed(2)}%\n`;
    context += `- Posts Analyzed: ${historicalPerformance.length}\n\n`;
  }
  
  if (nicheStrategy) {
    context += `INDUSTRY BEST PRACTICES:\n`;
    context += `- Content Types: ${JSON.stringify(nicheStrategy.recommended_content_types || [])}\n`;
    context += `- Best Practices: ${JSON.stringify(nicheStrategy.best_practices || [])}\n\n`;
  }
  
  if (mlTimes.length > 0) {
    context += `OPTIMAL POSTING TIMES (based on ML analysis):\n`;
    mlTimes.slice(0, 3).forEach(t => {
      context += `- ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][t.day_of_week]} at ${t.hour}:00 (${t.predicted_engagement_rate?.toFixed(1)}% engagement)\n`;
    });
    context += '\n';
  }
  
  context += `NARRATIVE ARC REQUIREMENTS:\n`;
  context += `- Days 1-7 (Week 1): AWARENESS - Introduce brand, build recognition\n`;
  context += `- Days 8-15 (Week 2): ENGAGEMENT - Spark interaction, build community\n`;
  context += `- Days 16-23 (Week 3): CONSIDERATION - Showcase value, social proof\n`;
  context += `- Days 24-30 (Week 4+): CONVERSION - Clear CTAs, drive action\n\n`;
  
  context += `Generate exactly 30 unique posts with compelling hooks, body copy, and CTAs for each day.`;
  
  return context;
}

function generateFallbackStrategy(
  platform: string,
  niche: string,
  businessProfile: any,
  duration: number
) {
  const businessName = businessProfile?.business_name || 'your brand';
  const industry = niche || businessProfile?.industry || 'ecommerce';
  
  const weeklyThemes = [
    { week: 1, name: 'Awareness & Introduction', objective: 'Build brand recognition', content_types: ['introduction', 'behind-the-scenes', 'value proposition'], expected_outcome: 'Increased brand awareness' },
    { week: 2, name: 'Engagement & Community', objective: 'Spark conversations', content_types: ['questions', 'polls', 'user-generated'], expected_outcome: 'Higher engagement rates' },
    { week: 3, name: 'Consideration & Trust', objective: 'Build credibility', content_types: ['testimonials', 'case-studies', 'tutorials'], expected_outcome: 'Increased trust and consideration' },
    { week: 4, name: 'Conversion & Action', objective: 'Drive conversions', content_types: ['offers', 'cta-focused', 'urgency'], expected_outcome: 'Higher conversion rates' }
  ];
  
  const contentCalendar = [];
  for (let day = 1; day <= 30; day++) {
    contentCalendar.push(generateDayContent(day, platform, industry, businessName));
  }
  
  return {
    platform,
    niche: industry,
    overview: {
      duration: '30 days',
      estimated_reach: 50000,
      total_posts: 30,
      confidence_level: 'Medium',
      investment_recommendation: 'Moderate - Focus on organic growth with selective boosting of top performers'
    },
    weekly_themes: weeklyThemes,
    content_calendar: contentCalendar,
    predicted_metrics: {
      impressions: 150000,
      engagement_rate: 3.5,
      conversions: 250,
      roi_percentage: 120,
      confidence: 70
    },
    key_actions: [
      { action: 'Post consistently at optimal times', priority: 'high', expected_impact: '+25% reach', timing: 'Daily' },
      { action: 'Respond to all comments within 1 hour', priority: 'high', expected_impact: '+30% engagement', timing: 'Ongoing' },
      { action: 'Use trending audio/hashtags', priority: 'medium', expected_impact: '+40% discovery', timing: 'Weekly' },
      { action: 'Boost top 3 performing posts', priority: 'medium', expected_impact: '+50% reach', timing: 'End of Week 2' },
      { action: 'A/B test CTAs on conversion posts', priority: 'medium', expected_impact: '+15% conversions', timing: 'Week 4' }
    ]
  };
}

function generateDayContent(day: number, platform: string, industry: string, businessName: string = 'your brand'): any {
  const week = Math.ceil(day / 7);
  
  const themes = ['awareness', 'engagement', 'consideration', 'conversion'];
  const theme = themes[Math.min(week - 1, 3)];
  
  const contentTypes = getContentTypesForPlatform(platform);
  const contentType = contentTypes[day % contentTypes.length];
  
  const dayOfWeek = (day - 1) % 7;
  const times = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '8:00 PM'];
  const postTime = times[dayOfWeek % times.length];
  
  const content = generateContentForTheme(theme, industry, day, platform, businessName);
  
  return {
    day_number: day,
    content_hook: content.hook,
    content_body: content.body,
    content_cta: content.cta,
    content_type: contentType,
    content_theme: theme,
    post_time_recommended: postTime,
    expected_engagement_score: Math.floor(Math.random() * 20) + 60 + (week * 5),
    hashtags: generateHashtags(industry, platform),
    reasoning: content.reasoning,
    platform_specific_tips: getPlatformTips(platform)
  };
}

function getContentTypesForPlatform(platform: string): string[] {
  const platformTypes: Record<string, string[]> = {
    instagram: ['reel', 'carousel', 'image', 'story'],
    facebook: ['video', 'image', 'link', 'carousel'],
    twitter: ['text', 'image', 'thread', 'video'],
    linkedin: ['article', 'image', 'video', 'document'],
    tiktok: ['video', 'duet', 'stitch', 'trend']
  };
  return platformTypes[platform] || ['image', 'video', 'text'];
}

function generateContentForTheme(theme: string, industry: string, day: number, platform: string, businessName: string): { hook: string; body: string; cta: string; reasoning: string } {
  const templates: Record<string, any[]> = {
    awareness: [
      { hook: `Welcome to ${businessName}! Here's what makes us different...`, body: `We're passionate about helping ${industry} businesses succeed. Our approach focuses on quality, authenticity, and results that matter. Today we're sharing our story and why we do what we do.`, cta: 'Follow for more insights!', reasoning: 'Early awareness-building establishes brand identity' },
      { hook: `3 things you didn't know about ${industry}...`, body: `Industry insight #1: Quality matters more than quantity. #2: Consistency builds trust. #3: Your unique story is your competitive advantage. These principles guide everything we do.`, cta: 'Save this for later!', reasoning: 'Educational content positions brand as thought leader' },
      { hook: `Behind the scenes at ${businessName} ✨`, body: `Ever wonder what goes into creating exceptional ${industry} experiences? Here's a peek behind the curtain at our process, our team, and our commitment to excellence.`, cta: 'Want to see more? Comment below!', reasoning: 'Humanizes the brand and builds connection' }
    ],
    engagement: [
      { hook: `Quick question for our community...`, body: `We want to know: What's your biggest challenge when it comes to ${industry}? Drop your answer in the comments - we read every single one and might feature your question in an upcoming post!`, cta: 'Comment your answer below! 👇', reasoning: 'Questions drive comments and boost algorithm' },
      { hook: `This or that? Let's settle this...`, body: `A fun debate in the ${industry} world! We're curious where you stand on this. Your vote helps us understand what matters most to our community.`, cta: 'Vote in the poll and share with friends!', reasoning: 'Interactive content increases engagement metrics' },
      { hook: `Share your experience! We want to hear from YOU`, body: `The best part of what we do is the community we've built. Today we're celebrating YOU by featuring some of your amazing stories and experiences with ${businessName}.`, cta: 'Tag us in your posts for a chance to be featured!', reasoning: 'UGC builds community and provides social proof' }
    ],
    consideration: [
      { hook: `Real results from real customers...`, body: `Nothing speaks louder than results. Here's what ${industry} professionals are saying about their experience with ${businessName}. These transformations and testimonials show what's possible.`, cta: 'Ready to write your success story? Link in bio!', reasoning: 'Social proof builds trust during consideration phase' },
      { hook: `How we helped [Customer] achieve [Result]...`, body: `Case study breakdown: The challenge they faced, the solution we provided, and the results they achieved. This is why we love what we do - making a real difference in the ${industry}.`, cta: 'DM us to discuss your goals!', reasoning: 'Case studies demonstrate value and capability' },
      { hook: `Step-by-step: How to get the most from ${industry}`, body: `Tutorial time! We're breaking down exactly how to maximize your results. These are the same strategies our most successful customers use.`, cta: 'Save this guide and try it today!', reasoning: 'Educational content showcases expertise' }
    ],
    conversion: [
      { hook: `Limited time opportunity 🔥`, body: `We don't do this often, but this week we're offering something special for our community. If you've been thinking about taking the next step with ${businessName}, now is the time.`, cta: 'Tap the link in bio before it expires!', reasoning: 'Urgency drives action in conversion phase' },
      { hook: `Your journey starts here...`, body: `Ready to transform your ${industry} experience? Here's exactly what happens when you join ${businessName}: Step 1, Step 2, Step 3... It's simpler than you think.`, cta: 'Get started today - link in bio!', reasoning: 'Clear next steps reduce friction' },
      { hook: `Last call: Don't miss out!`, body: `Final reminder about our special offer. We've helped hundreds achieve their ${industry} goals, and we'd love for you to be next. The doors close soon.`, cta: 'Claim your spot now - link in bio!', reasoning: 'Final push with urgency and FOMO' }
    ]
  };
  
  const themeTemplates = templates[theme] || templates.awareness;
  const template = themeTemplates[day % themeTemplates.length];
  
  return template;
}

function generateHashtags(industry: string, platform: string): string[] {
  const industryTags: Record<string, string[]> = {
    ecommerce: ['ecommerce', 'onlineshopping', 'shopsmall', 'smallbusiness', 'entrepreneur'],
    saas: ['saas', 'tech', 'startup', 'software', 'productivity'],
    consulting: ['consulting', 'business', 'strategy', 'growth', 'leadership'],
    fitness: ['fitness', 'health', 'workout', 'motivation', 'wellness'],
    local_business: ['localbusiness', 'shoplocal', 'community', 'supportlocal', 'smallbusiness']
  };
  
  const platformTags: Record<string, string[]> = {
    instagram: ['instagood', 'instadaily', 'trending', 'viral', 'reels'],
    tiktok: ['fyp', 'foryou', 'viral', 'trending', 'tiktokmademebuythis'],
    linkedin: ['linkedin', 'networking', 'professional', 'career', 'industry'],
    twitter: ['trending', 'viral', 'community', 'business', 'tips'],
    facebook: ['facebooklive', 'community', 'smallbusiness', 'entrepreneur', 'tips']
  };
  
  return [
    ...(industryTags[industry] || industryTags.ecommerce).slice(0, 3),
    ...(platformTags[platform] || platformTags.instagram).slice(0, 2)
  ];
}

function getPlatformTips(platform: string): string[] {
  const tips: Record<string, string[]> = {
    instagram: ['Use trending audio for Reels', 'Post during peak hours (9am, 12pm, 7pm)', 'Engage with comments in first hour'],
    tiktok: ['Hook viewers in first 2 seconds', 'Use trending sounds', 'Post 1-3 times daily'],
    linkedin: ['Use professional tone', 'Include relevant hashtags', 'Engage with industry peers'],
    twitter: ['Keep it concise', 'Use relevant hashtags', 'Engage in conversations'],
    facebook: ['Use video when possible', 'Encourage shares', 'Post in groups']
  };
  return tips[platform] || tips.instagram;
}
