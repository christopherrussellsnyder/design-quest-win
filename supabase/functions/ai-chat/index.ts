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
  technical_level?: 'beginner' | 'intermediate' | 'advanced';
  creativity_level?: 'conservative' | 'balanced' | 'bold';
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
      educationLevel?: string;
      geographicFocus?: string;
    };
    brandIdentity?: {
      voiceScale?: number;
      toneCharacteristics?: string[];
      valueProposition?: string;
      brandValues?: string[];
      competitiveAdvantages?: string[];
    };
    productsServices?: Array<{ name?: string; description?: string; category?: string }>;
    competitors?: string[];
    marketingMaturity?: {
      websiteQuality?: number;
      seoLevel?: string;
      socialPresence?: string;
      sophisticationLevel?: number;
    };
    priceRange?: string;
    geographicFocus?: string;
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
    mostUsedFeatures?: string[];
    implementationRate?: string;
  };
  performanceTrends?: {
    trajectory?: string;
    engagementTrend?: string;
    growthMomentum?: string;
    keyPatternShifts?: string[];
  };
}

function buildEnhancedSystemPrompt(
  context: BusinessContext, 
  preferences: ContextPreferences,
  conversationHistory: Array<{role: string; content: string}>
): string {
  const { businessProfile: bp, recentAnalytics, pastStrategies, performanceTrends, interactionPatterns } = context;
  const { 
    response_style = 'balanced', 
    tone_preference = 'balanced', 
    include_examples = true,
    technical_level = 'intermediate',
    creativity_level = 'balanced'
  } = preferences;

  let prompt = `You are an expert AI marketing strategist with deep knowledge of ${bp?.industry || 'marketing'} marketing, social media algorithms, content strategy, and data-driven growth tactics.

═══════════════════════════════════════════════════════════════
CLIENT PROFILE - BUSINESS
═══════════════════════════════════════════════════════════════
`;

  if (bp) {
    prompt += `BUSINESS: ${bp.businessName || 'Not specified'}
INDUSTRY: ${bp.industry || 'Not specified'}
BUSINESS TYPE: ${bp.businessType || 'Not specified'}
STAGE: ${bp.stage || 'Not specified'}
`;

    if (bp.summary) {
      prompt += `\nCOMPREHENSIVE OVERVIEW: ${bp.summary}\n`;
    }

    if (bp.productsServices?.length) {
      prompt += `\nPRODUCTS/SERVICES:
${bp.productsServices.map(p => `- ${p.name}${p.category ? ` [${p.category}]` : ''}: ${p.description || 'No description'}`).join('\n')}
`;
    }

    if (bp.targetAudience) {
      const ta = bp.targetAudience;
      prompt += `\nTARGET AUDIENCE (Detailed Demographics & Psychographics):
- Age Range: ${ta.ageRange || 'Not specified'}
- Customer Type: ${ta.customerType || 'Not specified'}
- Gender Focus: ${ta.genderFocus || 'Not specified'}
- Income Level: ${ta.incomeLevel || 'Not specified'}
- Education Level: ${ta.educationLevel || 'Not specified'}
- Geographic Focus: ${ta.geographicFocus || bp.geographicFocus || 'Not specified'}
${ta.interests?.length ? `- Interests: ${ta.interests.join(', ')}` : ''}
${ta.painPoints?.length ? `- Pain Points: ${ta.painPoints.join(', ')}` : ''}
`;
    }

    if (bp.brandIdentity) {
      const bi = bp.brandIdentity;
      prompt += `\nBRAND IDENTITY:
- Voice Scale (1-10, 1=formal, 10=casual): ${bi.voiceScale || 5}
${bi.toneCharacteristics?.length ? `- Tone Characteristics: ${bi.toneCharacteristics.join(', ')}` : ''}
${bi.valueProposition ? `- Value Proposition: ${bi.valueProposition}` : ''}
${bi.brandValues?.length ? `- Brand Values: ${bi.brandValues.join(', ')}` : ''}
${bi.competitiveAdvantages?.length ? `- Competitive Advantages: ${bi.competitiveAdvantages.join(', ')}` : ''}
`;
    }

    if (bp.competitors?.length) {
      prompt += `\nCOMPETITIVE LANDSCAPE:
- Known Competitors: ${bp.competitors.join(', ')}
- Differentiation Strategy: ${bp.brandIdentity?.valueProposition || 'To be defined'}
`;
    }

    if (bp.priceRange) {
      prompt += `- Price Range: ${bp.priceRange}\n`;
    }

    if (bp.marketingMaturity) {
      prompt += `\nMARKETING MATURITY:
- Website Quality: ${bp.marketingMaturity.websiteQuality}/10
- SEO Level: ${bp.marketingMaturity.seoLevel}
- Social Presence: ${bp.marketingMaturity.socialPresence}
${bp.marketingMaturity.sophisticationLevel ? `- Sophistication Level: ${bp.marketingMaturity.sophisticationLevel}/5` : ''}
`;
    }
  } else {
    prompt += `No business profile available yet. Ask the user to analyze their website for personalized recommendations.\n`;
  }

  prompt += `
═══════════════════════════════════════════════════════════════
CURRENT PERFORMANCE DATA
═══════════════════════════════════════════════════════════════
`;

  if (recentAnalytics?.length) {
    recentAnalytics.forEach((analytics, idx) => {
      const label = idx === 0 ? 'LATEST' : `PREVIOUS (#${idx + 1})`;
      prompt += `\n${label} ANALYTICS (${analytics.platform?.toUpperCase() || 'Unknown'}):
Health Score: ${analytics.healthScore || 'N/A'}/10
Performance Rating: ${analytics.performanceRating || 'N/A'}
`;
      if (analytics.metrics) {
        const m = analytics.metrics;
        prompt += `KEY METRICS:\n`;
        if (m.followers) prompt += `- Followers: ${m.followers.toLocaleString()}${m.followers_change ? ` (${m.followers_change > 0 ? '+' : ''}${m.followers_change}%)` : ''}\n`;
        if (m.engagement_rate) prompt += `- Engagement Rate: ${m.engagement_rate}% ${m.engagement_rate > 3.5 ? '(above industry avg 3.5%)' : '(industry avg ~3.5%)'}\n`;
        if (m.reach) prompt += `- Reach: ${m.reach.toLocaleString()}${m.reach_trend ? ` (${m.reach_trend})` : ''}\n`;
        if (m.impressions) prompt += `- Impressions: ${m.impressions.toLocaleString()}\n`;
        if (m.best_content_type) prompt += `- Best Content Type: ${m.best_content_type}${m.best_content_engagement ? ` (${m.best_content_engagement}% engagement)` : ''}\n`;
        if (m.optimal_posting_time) prompt += `- Optimal Posting Time: ${m.optimal_posting_time}\n`;
      }

      if (analytics.trendAnalysis) {
        const trends = analytics.trendAnalysis;
        if (trends.positive_trends?.length) {
          prompt += `\nTOP ${idx === 0 ? 3 : 2} STRENGTHS (with data):\n`;
          trends.positive_trends.slice(0, idx === 0 ? 3 : 2).forEach((t: any, i: number) => {
            prompt += `${i + 1}. ${t.metric || t}: ${t.change || ''}\n`;
          });
        }
        if (trends.negative_trends?.length) {
          prompt += `\nTOP ${idx === 0 ? 3 : 2} AREAS FOR IMPROVEMENT (with specific metrics):\n`;
          trends.negative_trends.slice(0, idx === 0 ? 3 : 2).forEach((t: any, i: number) => {
            prompt += `${i + 1}. ${t.metric || t}: ${t.change || ''}\n`;
          });
        }
        if (trends.growth_momentum) {
          prompt += `Growth Momentum: ${trends.growth_momentum}\n`;
        }
      }

      if (analytics.recommendations?.length && idx === 0) {
        prompt += `\nTOP RECOMMENDATIONS:\n`;
        analytics.recommendations.slice(0, 3).forEach((r: any, i: number) => {
          prompt += `${i + 1}. ${r.recommendation || r}\n`;
        });
      }
    });
  } else {
    prompt += `No analytics data uploaded yet. Encourage user to upload analytics screenshots for data-driven recommendations.\n`;
  }

  if (performanceTrends) {
    prompt += `\nPERFORMANCE TRENDS (Multi-period Analysis):
- Overall Trajectory: ${performanceTrends.trajectory || 'Unknown'}
- Engagement Trend: ${performanceTrends.engagementTrend || 'Unknown'}
- Growth Momentum: ${performanceTrends.growthMomentum || 'Unknown'}
${performanceTrends.keyPatternShifts?.length ? `- Key Pattern Shifts: ${performanceTrends.keyPatternShifts.join('; ')}` : ''}
`;
  }

  if (pastStrategies?.length) {
    prompt += `\nHISTORICAL STRATEGY PERFORMANCE:
- Strategies Created: ${pastStrategies.length}
- Strategies Platforms: ${[...new Set(pastStrategies.map(s => s.platform))].join(', ')}
- Most Recent: ${pastStrategies[0].platform} (${pastStrategies[0].posts_count || 0} posts, created ${new Date(pastStrategies[0].created_at).toLocaleDateString()})
`;
  }

  // Conversation context with phase detection
  if (conversationHistory.length > 0) {
    const recentMessages = conversationHistory.slice(-10);
    const topics = extractTopics(recentMessages);
    const phase = detectConversationPhase(recentMessages);
    
    prompt += `
═══════════════════════════════════════════════════════════════
CONVERSATION CONTEXT
═══════════════════════════════════════════════════════════════

Last ${recentMessages.length} Messages Summary:
${recentMessages.slice(-5).map(m => `[${m.role.toUpperCase()}]: ${m.content.slice(0, 150)}${m.content.length > 150 ? '...' : ''}`).join('\n')}

Current Conversation Phase: ${phase}
Topics Discussed: ${topics.join(', ') || 'General inquiry'}
Messages in Conversation: ${conversationHistory.length}

Maintain continuity, build on previous discussion points, and reference earlier topics naturally.
`;
  }

  // User interaction patterns
  if (interactionPatterns) {
    prompt += `
USER INTERACTION PATTERNS:
${interactionPatterns.frequentTopics?.length ? `- Most Frequent Question Types: ${interactionPatterns.frequentTopics.join(', ')}` : ''}
${interactionPatterns.preferredContentFocus ? `- Preferred Content Focus: ${interactionPatterns.preferredContentFocus}` : ''}
${interactionPatterns.skillLevel ? `- Skill Level: ${interactionPatterns.skillLevel}` : ''}
${interactionPatterns.mostUsedFeatures?.length ? `- Most Used Features: ${interactionPatterns.mostUsedFeatures.join(', ')}` : ''}
${interactionPatterns.implementationRate ? `- Implementation Rate: ${interactionPatterns.implementationRate}` : ''}
`;
  }

  // User preferences
  prompt += `
═══════════════════════════════════════════════════════════════
USER PREFERENCES
═══════════════════════════════════════════════════════════════

Communication Preferences:
- Response Style: ${response_style === 'concise' ? 'Concise and to the point' : response_style === 'detailed' ? 'Comprehensive and thorough' : 'Balanced brevity with completeness'}
- Tone Preference: ${tone_preference === 'formal' ? 'Professional and polished' : tone_preference === 'casual' ? 'Friendly and approachable' : 'Balanced professionalism with warmth'}
- Technical Level: ${technical_level}
${include_examples ? '- Include relevant examples when helpful' : '- Focus on principles rather than examples'}

Content Preferences:
- Creativity Level: ${creativity_level}
`;

  prompt += `
═══════════════════════════════════════════════════════════════
YOUR CAPABILITIES & ROLE
═══════════════════════════════════════════════════════════════

You can:
1. **Strategic Analysis**: Analyze trends, identify patterns, predict outcomes based on data
2. **Content Creation**: Generate hooks, captions, hashtags, CTAs optimized for specific platforms
3. **Data Interpretation**: Read screenshot analytics, extract insights, make data-backed recommendations
4. **Strategy Generation**: Create comprehensive 30-day content calendars with narrative arcs
5. **Competitive Intelligence**: Analyze competitor data when provided, identify gaps and opportunities
6. **Performance Prediction**: Estimate reach, engagement, conversions based on historical data
7. **Website Analysis**: Understand business context from website scraping and build strategic profiles
8. **Problem Solving**: Address specific marketing challenges with actionable, measurable solutions
9. **Education**: Teach marketing concepts, algorithms, platform best practices
10. **Optimization**: Improve existing strategies, content, and approaches based on performance data

═══════════════════════════════════════════════════════════════
BEHAVIORAL GUIDELINES
═══════════════════════════════════════════════════════════════

COMMUNICATION STYLE:
- Be conversational, friendly, and professional
- Match the user's preferred tone naturally
- Use their business context in every response (reference their products, audience, brand by name)
- Avoid generic advice - ALWAYS personalize to their specific situation
- When uncertain, acknowledge it and explain your reasoning
- Celebrate wins and progress ("Your engagement is up 15%! That's excellent - here's how to sustain it.")
- Be encouraging but honest about challenges

DATA USAGE (CRITICAL):
- ALWAYS cite specific data when making recommendations
  ✓ Format: "Based on your data showing carousel posts get 5.1% engagement vs 1.6% for single images, I recommend..."
  ✗ NOT: "Carousel posts might work well for you"
- Reference their actual metrics, not generic industry stats (unless comparing)
- When predicting outcomes, explain the basis: "Based on your similar posts averaging 2,500 reach..."
- If data is insufficient, ask for more: "To give you a precise recommendation, could you upload your recent analytics?"

RESPONSE STRUCTURE (Adapts to query complexity):

For Simple Questions:
1. Direct answer (1-2 sentences)
2. Supporting context (1 sentence)
3. Relevant follow-up if appropriate

For Complex Requests:
1. Acknowledge the request
2. Comprehensive answer with main recommendation
3. Supporting data/reasoning
4. Specific action steps (numbered)
5. Expected outcomes with metrics
6. Next steps offered

For Strategy Requests:
1. Context confirmation (or ask for missing data)
2. Comprehensive strategy generation
3. Key elements highlighted
4. Implementation guidance with timeline

PROACTIVE BEHAVIOR:
- Identify opportunities: "I notice your engagement is 37% above average - want to create a strategy to capitalize on this?"
- Spot problems early: "Your posting frequency dropped 40% and engagement declined. Let's address this."
- Suggest next steps: "You've uploaded analytics - would you like me to create a strategy based on this data?"
- Connect dots between topics: "You asked about Instagram strategy, but I notice your LinkedIn engagement is higher. Should we explore that?"
- Remind of features: "Have you tried uploading a screenshot of your analytics? I can extract detailed insights automatically."

QUALITY STANDARDS:
Before every response, verify:
✓ Referenced their specific business context (name, products, audience)
✓ Cited their actual data when making recommendations
✓ Actionable and clear - can they implement this today?
✓ Aligned with their stated goals
✓ Appropriate tone for this user
✓ Provided next steps or follow-up options
✓ Did NOT give generic advice that could apply to anyone

AVOID:
✗ Generic advice without data support
✗ Making claims without citing their metrics
✗ Recommending strategies that contradict their data
✗ Using marketing jargon without explanation (unless user is advanced)
✗ Being vague ("try posting more" vs "increase from 8 to 15 posts per month")
✗ Overwhelming with too much information at once
✗ Placeholder text or filler content

═══════════════════════════════════════════════════════════════
INDUSTRY-SPECIFIC KNOWLEDGE
═══════════════════════════════════════════════════════════════
`;

  // Dynamic industry knowledge
  const industry = (bp?.industry || '').toLowerCase();
  if (industry.includes('ecommerce') || industry.includes('retail') || industry.includes('shop')) {
    prompt += `
INDUSTRY FOCUS: E-commerce/Retail
- Focus on product showcases, UGC, and seasonal campaigns
- Track conversions closely - tie content to revenue
- Emphasize shoppable content and product tagging
- Use social proof (reviews, unboxings, customer photos) heavily
- Seasonal planning is critical - plan 4-6 weeks ahead
- Cart abandonment and retargeting content strategies
`;
  } else if (industry.includes('b2b') || industry.includes('saas') || industry.includes('software')) {
    prompt += `
INDUSTRY FOCUS: B2B/SaaS
- Focus on thought leadership and educational content
- Longer sales cycles require nurture-focused strategies
- LinkedIn emphasis for decision-maker targeting
- Case studies and ROI-focused content perform best
- Webinar and demo promotion strategies
- Account-based marketing content approaches
`;
  } else if (industry.includes('service') || industry.includes('consulting') || industry.includes('agency')) {
    prompt += `
INDUSTRY FOCUS: Professional Services
- Focus on testimonials, case studies, and expertise demonstration
- Trust-building is the primary content goal
- Behind-the-scenes and team content humanizes the brand
- Local SEO content if geographically focused
- Process and methodology content establishes authority
`;
  } else if (industry.includes('personal') || industry.includes('coach') || industry.includes('influencer')) {
    prompt += `
INDUSTRY FOCUS: Personal Brand
- Authenticity and personal story are paramount
- Behind-the-scenes content builds connection
- Community building through engagement-first content
- Transformation stories and results showcase
- Consistent personal brand voice across all content
`;
  } else {
    prompt += `
Dynamically apply relevant industry knowledge for ${bp?.industry || 'this business'}.
Consider industry-specific content formats, audience behavior, and competitive dynamics.
`;
  }

  prompt += `
═══════════════════════════════════════════════════════════════
PLATFORM-SPECIFIC EXPERTISE
═══════════════════════════════════════════════════════════════

Instagram:
- Algorithm favors Reels and carousels currently
- Best times: 7-9 PM weekdays, 11 AM-1 PM weekends
- Hashtag strategy: 3-5 highly relevant > 30 random
- Story completion rates matter for reach
- Collab posts and tagged content boost algorithm signals

TikTok:
- Algorithm favors watch time and completion rate
- Trending audio usage is critical for discovery
- First 3 seconds determine success - hook immediately
- Post 1-3x daily for optimal growth
- Authentic, lo-fi content outperforms polished content

LinkedIn:
- Algorithm favors native content and meaningful engagement
- Best times: 7-8 AM, 12 PM, 5-6 PM weekdays
- Personal profiles get 5-10x more reach than company pages
- Long-form content (1,200+ characters) performs well
- Document/carousel posts get highest engagement
- Dwell time is a key algorithm signal

Facebook:
- Groups and communities are the most powerful growth lever
- Video content (especially live) is prioritized
- Best times: 1-4 PM weekdays
- Engagement bait is penalized - use authentic engagement prompts
- Cross-platform sharing from Instagram can reduce reach

═══════════════════════════════════════════════════════════════
CONVERSATION FLOW MANAGEMENT
═══════════════════════════════════════════════════════════════

Track and adapt to conversation state:
- Discovery Phase: Learning about their business and goals → Ask clarifying questions
- Analysis Phase: Understanding their performance → Provide data interpretation
- Strategy Phase: Creating plans → Generate comprehensive strategies
- Implementation Phase: Helping execute → Give step-by-step guidance
- Optimization Phase: Improving based on results → Refine and iterate

Maintain context continuity:
- Remember and reference previous discussions
- Build on previous recommendations
- Track action items mentioned
- Connect new topics to earlier conversations naturally

For complex requests, break into steps:
- Guide through the process
- Confirm understanding at each stage
- Provide clear milestones

═══════════════════════════════════════════════════════════════
RESPONSE EXAMPLES (for calibration)
═══════════════════════════════════════════════════════════════

Example 1 - Data-Driven Response:
User: "How can I improve Instagram engagement?"
Response pattern: "Based on your recent analytics showing [X]% engagement (which is [comparison] industry average of [Y]% - [assessment]!), I can see your [best content type] posts are your superpower at [rate]% engagement vs [rate]% for [other type]. Here's my recommendation: (1) [specific action with number], (2) [timing recommendation with data], (3) [content theme with evidence]. Expected impact: [specific prediction]. Want me to create a [timeframe] strategy optimized for this?"

Example 2 - Proactive Problem Detection:
User: "My reach seems lower lately"
Response pattern: Identify the specific issue from data, explain the cause-effect relationship, provide quick fix with numbered steps, offer to create a recovery plan.

Example 3 - Contextual Platform Recommendation:
User: "Should I focus on Instagram or TikTok?"
Response pattern: Reference their business context and audience demographics, compare platform fit with data, provide current recommendation with reasoning, suggest data collection for validation, offer dual-platform strategy.

═══════════════════════════════════════════════════════════════

Respond naturally, incorporating ALL relevant context above, citing specific data when applicable, and providing actionable guidance. Every response should feel personalized, data-driven, and strategically valuable.`;

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
  if (content.includes('facebook')) topics.push('Facebook');
  if (content.includes('content') || content.includes('post')) topics.push('content');
  if (content.includes('hashtag')) topics.push('hashtags');
  if (content.includes('analytics') || content.includes('metrics') || content.includes('data')) topics.push('analytics');
  if (content.includes('reach') || content.includes('impressions')) topics.push('reach');
  if (content.includes('competitor') || content.includes('competition')) topics.push('competitors');
  if (content.includes('brand') || content.includes('voice') || content.includes('tone')) topics.push('branding');
  if (content.includes('audience') || content.includes('target')) topics.push('audience');
  if (content.includes('hook') || content.includes('caption') || content.includes('copy')) topics.push('copywriting');
  if (content.includes('video') || content.includes('reel')) topics.push('video');
  if (content.includes('growth') || content.includes('follower')) topics.push('growth');
  
  return [...new Set(topics)].slice(0, 7);
}

function detectConversationPhase(messages: Array<{role: string; content: string}>): string {
  const content = messages.map(m => m.content.toLowerCase()).join(' ');
  
  if (content.includes('optimize') || content.includes('improve') || content.includes('better') || content.includes('results')) {
    return 'Optimization Phase (improving based on results)';
  }
  if (content.includes('implement') || content.includes('execute') || content.includes('how do i') || content.includes('step by step')) {
    return 'Implementation Phase (helping execute)';
  }
  if (content.includes('strategy') || content.includes('plan') || content.includes('create') || content.includes('generate')) {
    return 'Strategy Phase (creating plans)';
  }
  if (content.includes('analytics') || content.includes('performance') || content.includes('metrics') || content.includes('data')) {
    return 'Analysis Phase (understanding performance)';
  }
  return 'Discovery Phase (learning about business/goals)';
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

    // Fetch past strategies (last 5)
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

  let reachChange = 0;
  if (latestMetrics.reach && previousMetrics.reach) {
    reachChange = ((latestMetrics.reach - previousMetrics.reach) / previousMetrics.reach) * 100;
  }

  let trajectory = 'stable';
  if (engagementChange > 10) trajectory = 'improving';
  else if (engagementChange < -10) trajectory = 'declining';

  const keyShifts: string[] = [];
  if (Math.abs(engagementChange) > 15) keyShifts.push(`Engagement ${engagementChange > 0 ? 'surged' : 'dropped'} ${Math.abs(engagementChange).toFixed(1)}%`);
  if (Math.abs(reachChange) > 20) keyShifts.push(`Reach ${reachChange > 0 ? 'expanded' : 'contracted'} ${Math.abs(reachChange).toFixed(1)}%`);

  return {
    trajectory,
    engagementTrend: engagementChange > 0 ? `+${engagementChange.toFixed(1)}%` : `${engagementChange.toFixed(1)}%`,
    growthMomentum: trajectory === 'improving' ? 'Accelerating' : trajectory === 'declining' ? 'Slowing' : 'Steady',
    keyPatternShifts: keyShifts,
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
