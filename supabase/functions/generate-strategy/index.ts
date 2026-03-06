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
  const competitors = bp.competitors || [];
  
  // Extract best performing patterns from analytics
  let bestContentType = 'carousel';
  let bestContentEngagement = 5.0;
  let avgEngagementRate = 3.5;
  let optimalPostingTimes = ['09:00', '12:00', '19:00'];
  let currentFollowers = 1000;
  let audienceDemographics = '';
  let reachTrend = '';
  
  if (recentAnalytics?.length > 0) {
    const latestMetrics = recentAnalytics[0]?.metrics || recentAnalytics[0]?.extracted_data || {};
    avgEngagementRate = latestMetrics.engagement_rate || avgEngagementRate;
    currentFollowers = latestMetrics.followers || currentFollowers;
    if (latestMetrics.best_content_type) bestContentType = latestMetrics.best_content_type;
    if (latestMetrics.best_content_engagement_rate) bestContentEngagement = latestMetrics.best_content_engagement_rate;
  }

  const targetEngagementRate = Math.max(avgEngagementRate * 1.15, 4.5);
  const goalsText = goals?.length ? goals.join(', ') : 'Increase engagement, Grow followers, Drive conversions';

  // Build analytics intelligence section
  let analyticsSection = '';
  if (recentAnalytics?.length > 0) {
    analyticsSection = `
HISTORICAL PERFORMANCE DATA (from uploaded analytics):
- Current Engagement Rate: ${avgEngagementRate}% ${avgEngagementRate > 3.5 ? '(above industry avg 3.5%)' : '(industry avg ~3.5%)'}
- Current Followers: ${currentFollowers.toLocaleString()}
- Best Performing Content: ${bestContentType} (${bestContentEngagement}% engagement)
- Optimal Posting Times: ${optimalPostingTimes.join(', ')}
${recentAnalytics[0]?.healthScore ? `- Health Score: ${recentAnalytics[0].healthScore}/10` : ''}
${recentAnalytics[0]?.performanceRating ? `- Performance Rating: ${recentAnalytics[0].performanceRating}` : ''}
`;
    
    const trendAnalysis = recentAnalytics[0]?.trend_analysis || recentAnalytics[0]?.trendAnalysis;
    if (trendAnalysis) {
      if (trendAnalysis.positive_trends?.length) {
        analyticsSection += `\nTop Strengths:\n${trendAnalysis.positive_trends.slice(0, 3).map((t: any, i: number) => `${i+1}. ${t.metric || t}: ${t.change || ''}`).join('\n')}\n`;
      }
      if (trendAnalysis.negative_trends?.length) {
        analyticsSection += `Areas to Address:\n${trendAnalysis.negative_trends.slice(0, 3).map((t: any, i: number) => `${i+1}. ${t.metric || t}: ${t.change || ''}`).join('\n')}\n`;
      }
    }
  } else {
    analyticsSection = `
HISTORICAL PERFORMANCE DATA:
- No analytics uploaded yet - using industry benchmarks
- Industry Average Engagement Rate: 3.5%
- Recommended Posting Times: 9 AM, 12 PM, 7 PM
- Best Content Types (industry): Carousels, Reels, Educational content
`;
  }

  return `You are a world-class content strategist creating a comprehensive social media strategy.

═══════════════════════════════════════════════════════════════
STRATEGIC BRIEF
═══════════════════════════════════════════════════════════════

CLIENT: ${businessName}
INDUSTRY: ${industry}
PLATFORM: ${platform}
DURATION: ${durationDays} days
START DATE: ${startDate.toISOString().split('T')[0]}
END DATE: ${endDate.toISOString().split('T')[0]}

═══════════════════════════════════════════════════════════════
BUSINESS INTELLIGENCE
═══════════════════════════════════════════════════════════════

- Business Name: ${businessName}
- Industry: ${industry}
- Business Type: ${bp.businessType || 'B2C'}
- Stage: ${bp.stage || 'Growth'}
- Products/Services: ${productsServices.length ? productsServices.map((p: any) => p.name || p).join(', ') : 'Various products/services'}
- Target Audience: ${targetAudience.ageRange || '25-44'} years old, ${targetAudience.customerType || 'consumers'}
${targetAudience.genderFocus ? `- Gender Focus: ${targetAudience.genderFocus}` : ''}
${targetAudience.incomeLevel ? `- Income Level: ${targetAudience.incomeLevel}` : ''}
${targetAudience.interests?.length ? `- Interests: ${targetAudience.interests.join(', ')}` : ''}
${targetAudience.painPoints?.length ? `- Pain Points: ${targetAudience.painPoints.join(', ')}` : ''}
- Brand Voice: ${brandIdentity.toneCharacteristics?.join(', ') || 'professional, engaging, authentic'}
- Value Proposition: ${brandIdentity.valueProposition || 'High-quality solutions for target audience'}
${brandIdentity.brandValues?.length ? `- Brand Values: ${brandIdentity.brandValues.join(', ')}` : ''}
${brandIdentity.competitiveAdvantages?.length ? `- Competitive Advantages: ${brandIdentity.competitiveAdvantages.join(', ')}` : ''}
${competitors.length ? `- Key Competitors: ${competitors.join(', ')}` : ''}
${bp.geographicFocus ? `- Geographic Focus: ${bp.geographicFocus}` : ''}
${analyticsSection}

STRATEGIC OBJECTIVES:
Primary Goals: ${goalsText}
Target Engagement Rate: ${targetEngagementRate.toFixed(1)}%
${customInstructions ? `Custom Requirements: ${customInstructions}` : ''}

═══════════════════════════════════════════════════════════════
5-PHASE STRATEGY DEVELOPMENT FRAMEWORK
═══════════════════════════════════════════════════════════════

PHASE 1: STRATEGIC FOUNDATION
Analyze the business context and determine:
- Current position: strengths to leverage, weaknesses to address
- Market opportunities to seize based on industry and audience
- Competitive differentiation approach
- Seasonal considerations for the strategy period

PHASE 2: CONTENT ARCHITECTURE (4-Week Narrative Arc)

WEEK 1 - AWARENESS & EDUCATION:
- Objective: Introduce value, establish authority
- Theme: "Know Us"
- Content Focus: Educational content, problem identification, industry insights
- Tone: Informative, helpful, approachable
- Primary Metric: Reach

WEEK 2 - ENGAGEMENT & TRUST:
- Objective: Build relationship, encourage interaction
- Theme: "Connect With Us"
- Content Focus: Interactive content, storytelling, community building
- Tone: Conversational, authentic, relatable
- Primary Metric: Engagement Rate

WEEK 3 - CONSIDERATION & DESIRE:
- Objective: Showcase benefits, create desire
- Theme: "Why Choose Us"
- Content Focus: Benefits, social proof, comparisons, value demonstrations
- Tone: Confident, aspirational, proof-driven
- Primary Metric: Profile Visits

WEEK 4 - CONVERSION & ACTION:
- Objective: Drive specific actions, convert interest
- Theme: "Join Us"
- Content Focus: Promotional, offers, clear CTAs, urgency
- Tone: Direct, action-oriented, exciting
- Primary Metric: Conversions

PHASE 3: CONTENT MIX OPTIMIZATION
Based on performance data, optimize distribution:

Content Theme Mix:
- 30% Educational (teach, inform, provide value)
- 25% Promotional (products, services, offers)
- 20% Engagement (questions, polls, user interaction)
- 15% Social Proof (testimonials, reviews, results)
- 10% Behind-the-Scenes (team, process, culture)

Post Type Mix for ${platform}:
- 35% Carousels (highest engagement based on data)
- 30% Reels/Videos (best reach potential)
- 20% Single Images (quick consumption)
- 15% Stories/Text (engagement drivers)

PHASE 4: DAILY POST GENERATION
For EACH of ${durationDays} days, create a detailed post with:

- Timing optimized to posting data
- Content details: post type, category, specific theme, primary emotion, content pillar
- Copy elements:
  * Hook (5-10 words, scroll-stopping) with technique (pattern_interrupt/curiosity_gap/bold_statement/question) and psychological principle
  * Opening (first 2-3 sentences expanding hook)
  * Body (main content, 100-150 words, platform-optimized)
  * CTA with type (engage/visit/buy/share/save/comment) and strength (soft/medium/hard)
  * Full caption (complete formatted, 150-250 words total)
- Hashtag strategy: 10-15 hashtags organized by volume tier (3 high-volume 100K+, 5 medium-volume 10K-100K, 4 niche 1K-10K, 2 branded)
- Visual guidance: type, description, color palette, text overlay, attention hook
- Performance prediction: reach, impressions, engagement rate, likes, comments, shares, saves, confidence level, prediction basis
- Strategic rationale: why this day, arc positioning, what it builds toward, success metrics
- Optimization tips: engagement boosters, A/B test ideas, potential issues, risk mitigation

QUALITY STANDARDS FOR EACH POST:
✓ Hook stops scroll in 0.5 seconds
✓ Caption provides genuine value
✓ CTA is clear and compelling
✓ Hashtags are researched and relevant
✓ Timing is data-optimized
✓ Fits narrative arc perfectly
✓ Matches brand voice consistently
✓ Actionable and engaging

PHASE 5: STRATEGY METADATA
Create comprehensive overview with:
- Strategic approach summary
- Content distribution breakdown
- Predicted outcomes with specific numbers
- Key tactics (5-7 specific, actionable)
- Weekly milestones with targets
- Risk assessment with mitigation strategies
- Implementation guide with scheduling, creation timeline, engagement protocol

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════

Return ONLY valid JSON with this exact structure:
{
  "strategy_overview": {
    "title": "${durationDays}-Day ${platform.charAt(0).toUpperCase() + platform.slice(1)} Strategy for ${businessName}",
    "platform": "${platform}",
    "duration_days": ${durationDays},
    "start_date": "${startDate.toISOString().split('T')[0]}",
    "end_date": "${endDate.toISOString().split('T')[0]}",
    "total_posts": ${durationDays},
    "strategic_approach": {
      "core_strategy": "[1-2 sentence strategic summary grounded in business context]",
      "key_differentiator": "[what makes this strategy unique to this business]",
      "competitive_edge": "[how this beats competitors based on data]"
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
      "carousel": ${Math.round(durationDays * 0.35)},
      "reel": ${Math.round(durationDays * 0.30)},
      "single_image": ${Math.round(durationDays * 0.20)},
      "video": ${Math.round(durationDays * 0.08)},
      "story": ${Math.round(durationDays * 0.07)}
    },
    "predicted_metrics": {
      "total_reach": ${Math.round(currentFollowers * durationDays * 2.5)},
      "total_impressions": ${Math.round(currentFollowers * durationDays * 4)},
      "avg_engagement_rate": ${targetEngagementRate.toFixed(1)},
      "expected_follower_growth": ${Math.round(currentFollowers * 0.05 * (durationDays / 30))},
      "expected_follower_growth_percentage": ${(5 * durationDays / 30).toFixed(1)},
      "expected_profile_visits": ${Math.round(currentFollowers * 0.25 * (durationDays / 30))},
      "expected_website_clicks": ${Math.round(currentFollowers * 0.05 * (durationDays / 30))},
      "expected_conversions": ${Math.round(currentFollowers * 0.003 * (durationDays / 30))}
    },
    "key_tactics": [
      "Lead with value-first educational content leveraging ${bestContentType} format",
      "Use pattern-interrupt hooks based on ${industry} audience psychology",
      "Leverage social proof in week 3 for trust acceleration",
      "Include clear CTAs with urgency in week 4 for conversion",
      "Optimize all posting times to ${optimalPostingTimes[0]} and ${optimalPostingTimes[2]} based on audience data"
    ],
    "success_milestones": {
      "week_1": "Reach ${Math.round(currentFollowers * 15)}+ accounts, establish content rhythm",
      "week_2": "Achieve ${targetEngagementRate.toFixed(1)}%+ engagement rate, grow community interaction",
      "week_3": "Drive ${Math.round(currentFollowers * 0.5)}+ profile visits, build purchase intent",
      "week_4": "Generate ${Math.round(currentFollowers * 0.003)}+ conversions, capture momentum"
    },
    "risk_assessment": {
      "potential_challenges": ["Algorithm changes reducing organic reach", "Content fatigue if themes repeat", "Low initial engagement on new content types", "Competitor activity during campaign period", "Seasonal fluctuations in audience activity"],
      "mitigation_strategies": ["Diversify content types across carousel/reel/image", "A/B test hooks and CTAs weekly", "Engage with comments within 1 hour of posting", "Monitor competitor activity and differentiate", "Adjust posting times based on weekly performance"],
      "pivot_triggers": ["Engagement drops below ${(avgEngagementRate * 0.7).toFixed(1)}% for 3 consecutive posts", "Reach declines 3 days in a row", "Follower growth stalls for a full week"]
    },
    "implementation_guide": {
      "posting_schedule": "Post daily at optimal times (${optimalPostingTimes.join(', ')})",
      "content_creation_timeline": "Create next week's content 2-3 days ahead, batch-create visuals",
      "engagement_protocol": "Reply to all comments within 1 hour, engage with 10 accounts in niche daily",
      "monitoring_schedule": "Check metrics daily at end of day, deep analysis weekly on Sunday",
      "adjustment_criteria": "Pivot content mix if engagement drops below ${(avgEngagementRate * 0.7).toFixed(1)}% for 3+ days"
    }
  },
  "weekly_breakdown": [
    {
      "week": 1,
      "theme": "Awareness & Education",
      "objective": "Introduce value and establish authority in ${industry}",
      "post_count": ${Math.min(7, durationDays)},
      "key_messages": ["Position as ${industry} expert", "Address audience pain points", "Provide actionable tips"],
      "expected_metrics": { "reach": ${Math.round(currentFollowers * 15)}, "engagement_rate": ${targetEngagementRate.toFixed(1)}, "follower_growth": ${Math.round(currentFollowers * 0.01)} },
      "focus_areas": ["Educational ${bestContentType}s", "How-to content", "Industry insights"]
    },
    {
      "week": 2,
      "theme": "Engagement & Trust",
      "objective": "Build relationship and encourage interaction",
      "post_count": 7,
      "key_messages": ["Share authentic brand stories", "Encourage community participation", "Show behind-the-scenes"],
      "expected_metrics": { "reach": ${Math.round(currentFollowers * 18)}, "engagement_rate": ${(targetEngagementRate * 1.1).toFixed(1)}, "follower_growth": ${Math.round(currentFollowers * 0.015)} },
      "focus_areas": ["Interactive polls and questions", "User-generated content", "Team/process stories"]
    },
    {
      "week": 3,
      "theme": "Consideration & Desire",
      "objective": "Showcase benefits and create desire for ${businessName}",
      "post_count": 7,
      "key_messages": ["Highlight unique value proposition", "Share customer success stories", "Compare benefits"],
      "expected_metrics": { "reach": ${Math.round(currentFollowers * 20)}, "engagement_rate": ${targetEngagementRate.toFixed(1)}, "follower_growth": ${Math.round(currentFollowers * 0.012)} },
      "focus_areas": ["Testimonials and case studies", "Product/service showcases", "Before/after transformations"]
    },
    {
      "week": 4,
      "theme": "Conversion & Action",
      "objective": "Drive specific actions and convert interest into customers",
      "post_count": ${Math.max(durationDays - 21, 7)},
      "key_messages": ["Clear calls-to-action", "Limited-time opportunities", "Make it easy to take next step"],
      "expected_metrics": { "reach": ${Math.round(currentFollowers * 22)}, "engagement_rate": ${(targetEngagementRate * 0.95).toFixed(1)}, "follower_growth": ${Math.round(currentFollowers * 0.012)} },
      "focus_areas": ["Promotional content with CTAs", "Urgency-driven posts", "Direct response content"]
    }
  ],
  "posts": [
    // Generate exactly ${durationDays} posts with this structure per post:
    {
      "day_number": 1,
      "post_date": "${startDate.toISOString().split('T')[0]}",
      "post_time": "19:00",
      "week_number": 1,
      "week_theme": "Awareness & Education",
      "content_details": {
        "post_type": "carousel",
        "content_category": "educational",
        "specific_theme": "[specific topic relevant to ${industry}]",
        "primary_emotion": "curiosity",
        "content_pillar": "expertise"
      },
      "copy_elements": {
        "hook": {
          "text": "[5-10 words, scroll-stopping, specific to ${industry}]",
          "technique": "curiosity_gap",
          "psychological_principle": "Creates open loop demanding closure"
        },
        "opening": "[First 2-3 sentences expanding hook with ${industry}-specific context]",
        "body": "[Main content, 100-150 words, actionable for ${targetAudience.customerType || 'target audience'}]",
        "cta": {
          "text": "[Specific call-to-action aligned with week 1 goals]",
          "type": "engage",
          "strength": "medium"
        },
        "full_caption": "[Complete formatted caption, 150-250 words, matching ${brandIdentity.toneCharacteristics?.join('/') || 'professional'} voice]"
      },
      "hashtag_strategy": {
        "hashtags": ["#tag1", "#tag2"],
        "mix_breakdown": {
          "high_volume": ["3 hashtags with 100K+ posts"],
          "medium_volume": ["5 hashtags with 10K-100K posts"],
          "niche": ["4 hashtags with 1K-10K posts"],
          "branded": ["2 brand-specific hashtags"]
        },
        "selection_rationale": "[Why these specific tags for this ${industry} business]"
      },
      "visual_guidance": {
        "visual_type": "carousel",
        "description": "[What the visual should show - specific to ${businessName}]",
        "color_palette": "[Colors aligned with brand identity]",
        "text_overlay": "[If applicable - key message on visual]",
        "attention_hook": "[What grabs attention in the first slide]"
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
        "prediction_basis": "Based on ${bestContentType} benchmarks and ${industry} engagement patterns"
      },
      "strategic_rationale": {
        "why_this_day": "[Strategic reason for this timing]",
        "arc_positioning": "[How it fits the week 1 awareness narrative]",
        "builds_toward": "[What this sets up for upcoming posts]",
        "success_metrics": "[Key metrics to watch for this specific post]"
      },
      "optimization_tips": {
        "engagement_boosters": ["Ask a question in caption", "Use contrarian hook to spark debate"],
        "a_b_test_ideas": ["Test with/without emoji in hook", "Compare morning vs evening posting"],
        "potential_issues": ["May need stronger visual hook if reach is low"],
        "risk_mitigation": ["Have backup hook ready", "Prepare alternative CTA"]
      }
    }
  ]
}

═══════════════════════════════════════════════════════════════
VALIDATION CHECKLIST
═══════════════════════════════════════════════════════════════

Before returning, verify:
✓ ALL ${durationDays} posts are created with complete details
✓ Clear narrative arc across 4 weeks (Awareness → Engagement → Consideration → Conversion)
✓ Content mix percentages achieved (30/25/20/15/10)
✓ Performance predictions are based on actual data or realistic benchmarks
✓ Timing optimized per historical patterns
✓ Brand voice (${brandIdentity.toneCharacteristics?.join(', ') || 'professional'}) consistent throughout
✓ Each post serves a clear strategic purpose within the arc
✓ Hashtags researched and categorized by volume tier
✓ CTAs clear, varied appropriately, and escalate through weeks
✓ Visual guidance is specific and actionable
✓ Strategic rationale provided for each post
✓ Risk mitigation strategies included
✓ Success milestones defined for each week
✓ All content is specific to ${businessName} in ${industry}
✓ No generic placeholder text remains

Generate exactly ${durationDays} detailed posts. Make each unique, valuable, and strategically positioned within the narrative arc. Reference the specific business context throughout.`;
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

    console.log(`Generating cognitive ${durationDays}-day strategy for ${platform} for user ${user.id}`);

    // Parallel fetch all context including behavior intelligence and business settings
    const [businessRes, analyticsRes, prevStrategiesRes, behaviorRes, trendsRes, learningRes, settingsRes] = await Promise.all([
      supabase.from('business_context').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
      supabase.from('uploaded_analytics').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false }).limit(3),
      supabase.from('content_strategies').select('predicted_metrics, platform').eq('user_id', user.id).eq('platform', platform).order('created_at', { ascending: false }).limit(3),
      supabase.from('user_behavior_patterns').select('*').eq('user_id', user.id).eq('platform', platform).maybeSingle(),
      supabase.from('content_trends').select('*').eq('platform', platform).eq('is_active', true).order('last_updated', { ascending: false }).limit(10),
      supabase.from('ai_learning_metrics').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('user_business_settings').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    const businessContext = businessRes.data;
    const userSettings = settingsRes.data;
    const recentAnalytics = analyticsRes.data || [];
    const behaviorData = behaviorRes.data;
    const activeTrends = trendsRes.data || [];
    const learningData = learningRes.data || [];

    // Build behavior-enhanced prompt section
    let behaviorSection = '';
    if (behaviorData?.behavior_data) {
      const bd = behaviorData.behavior_data;
      behaviorSection = `\n═══ BEHAVIOR INTELLIGENCE (Confidence: ${(behaviorData.learning_confidence * 100).toFixed(0)}%) ═══\n`;
      if (bd.content_type_preferences) {
        const sorted = Object.entries(bd.content_type_preferences).sort(([,a]: any, [,b]: any) => b - a);
        behaviorSection += `Content Preferences: ${sorted.map(([k,v]: any) => `${k}:${(v*100).toFixed(0)}%`).join(', ')}\n`;
        behaviorSection += `DIRECTIVE: Allocate content types proportionally to these preferences.\n`;
      }
      if (bd.topic_preferences) {
        const sorted = Object.entries(bd.topic_preferences).sort(([,a]: any, [,b]: any) => b - a);
        behaviorSection += `Topic Preferences: ${sorted.map(([k,v]: any) => `${k}:${(v*100).toFixed(0)}%`).join(', ')}\n`;
        behaviorSection += `DIRECTIVE: Weight topic distribution according to these preferences.\n`;
      }
      if (bd.hook_effectiveness) {
        const sorted = Object.entries(bd.hook_effectiveness).sort(([,a]: any, [,b]: any) => b - a);
        behaviorSection += `Hook Effectiveness: ${sorted.map(([k,v]: any) => `${k}:${(v*100).toFixed(0)}%`).join(', ')}\n`;
        behaviorSection += `DIRECTIVE: Prioritize ${sorted[0]?.[0] || 'curiosity_gap'} hooks.\n`;
      }
      if (bd.cta_response_rates) {
        behaviorSection += `CTA Rates: ${JSON.stringify(bd.cta_response_rates)}\n`;
        behaviorSection += `DIRECTIVE: Sequence CTAs from highest to lowest response rate across weeks.\n`;
      }
      if (bd.time_preferences) behaviorSection += `Peak Times: ${JSON.stringify(bd.time_preferences)}\n`;
      if (bd.engagement_patterns) behaviorSection += `Engagement Patterns: ${JSON.stringify(bd.engagement_patterns)}\n`;
      if (bd.completion_rates) behaviorSection += `Completion Rates: ${JSON.stringify(bd.completion_rates)}\n`;
    }

    let trendsSection = '';
    if (activeTrends.length > 0) {
      trendsSection = `\n═══ ACTIVE TRENDS ═══\n`;
      activeTrends.forEach((t: any) => {
        trendsSection += `[${t.trend_type}] ${t.content_category || 'General'} (${(t.confidence_score * 100).toFixed(0)}% confidence)\n`;
        if (t.trend_data?.format_trends) trendsSection += `  Formats: ${t.trend_data.format_trends.join(', ')}\n`;
      });
      trendsSection += `DIRECTIVE: Align 20-30% of posts with rising trends to boost algorithm favorability.\n`;
    }

    let calibrationSection = '';
    if (learningData.length > 0) {
      const avgAcc = learningData.reduce((s: number, m: any) => s + (m.accuracy_score || 0), 0) / learningData.length;
      const avgVar = learningData.reduce((s: number, m: any) => s + (m.variance || 0), 0) / learningData.length;
      calibrationSection = `\n═══ PREDICTION CALIBRATION ═══\n`;
      calibrationSection += `Historical accuracy: ${(avgAcc * 100).toFixed(1)}% | Avg variance: ${(avgVar * 100).toFixed(1)}%\n`;
      if (avgVar < -0.05) calibrationSection += `CALIBRATION: Reduce predictions by ${(Math.abs(avgVar) * 100).toFixed(0)}% (systematic overestimate detected)\n`;
      if (avgVar > 0.05) calibrationSection += `CALIBRATION: Increase predictions by ${(avgVar * 100).toFixed(0)}% (systematic underestimate detected)\n`;
    }

    // Build business settings primary context
    let settingsSection = '';
    if (userSettings) {
      const us = userSettings;
      const ta = (us.target_audience as any) || {};
      const cp = (us.content_preferences as any) || {};
      const enabledPrefs = Object.entries(cp).filter(([,v]) => v).map(([k]) => k.replace('_', ' '));
      settingsSection = `\n═══ PRIMARY BUSINESS CONTEXT (User-Configured Settings) ═══
Business Name: ${us.business_name || 'Not set'}
Industry: ${us.industry || 'Not set'}
Business Type: ${us.business_type || 'B2C'}
Target Audience: ${ta.age_range || 'N/A'} | ${ta.demographics || 'N/A'} | Pain Points: ${ta.pain_points || 'N/A'}
Brand Voice: ${us.brand_voice || 'Not set'}
Products/Services: ${Array.isArray(us.products_services) && us.products_services.length ? us.products_services.join(', ') : 'N/A'}
Geographic Focus: ${us.geographic_focus || 'N/A'}
Price Range: ${us.price_range || 'N/A'}
Marketing Goals: ${Array.isArray(us.marketing_goals) && us.marketing_goals.length ? us.marketing_goals.join(', ') : 'N/A'}
Preferred Platforms: ${Array.isArray(us.preferred_platforms) && us.preferred_platforms.length ? us.preferred_platforms.join(', ') : 'N/A'}
Posting Frequency: ${us.posting_frequency || 'N/A'}
Content Preferences: ${enabledPrefs.length ? enabledPrefs.join(', ') : 'N/A'}
Competitors: ${Array.isArray(us.competitors) && us.competitors.length ? us.competitors.join(', ') : 'N/A'}
UVP: ${us.unique_value_proposition || 'N/A'}
Additional Context: ${us.additional_context || 'None'}
DIRECTIVE: Use these user-verified settings as PRIMARY context. Website analysis data is SECONDARY (use only if settings fields are incomplete).\n`;
    }

    const prompt = buildEnhancedStrategyPrompt(
      platform,
      durationDays,
      businessContext,
      recentAnalytics,
      goals,
      customInstructions
    ) + settingsSection + behaviorSection + trendsSection + calibrationSection + `

═══ PREDICTIVE PERFORMANCE MODELING ═══
For EACH post, calculate predictions using: base_rate × content_type_mult × topic_mult × time_mult × hook_mult × trend_mult
Provide confidence intervals: ±15% for medium confidence, ±25% for low.
Include conservative/realistic/optimistic scenarios in strategy overview.
Add BEHAVIORAL NARRATIVE section explaining WHY this strategy works for THIS specific user based on their behavior data.`;

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
            content: 'You are a world-class content strategist specializing in social media marketing. Generate detailed, actionable content strategies with comprehensive data. Always respond with valid JSON only, no markdown formatting or code blocks. Every post must be unique and strategically positioned.' 
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.75,
        max_tokens: 25000,
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
      console.warn('Initial JSON parse failed, attempting repair:', parseError);
      console.error('Raw text (first 1000 chars):', strategyText.substring(0, 1000));
      
      try {
        // Find JSON boundaries
        const jsonStart = strategyText.search(/[\{\[]/);
        if (jsonStart > 0) strategyText = strategyText.substring(jsonStart);

        // Remove trailing commas
        let cleaned = strategyText
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/[\x00-\x1F\x7F]/g, '');

        // If truncated, try to close open structures
        if (cleaned.startsWith('{') && !cleaned.endsWith('}')) {
          // Try to find last complete post in the posts array
          const postsMatch = cleaned.match(/"posts"\s*:\s*\[/);
          if (postsMatch) {
            const postsStart = cleaned.indexOf(postsMatch[0]);
            const arrayStart = cleaned.indexOf('[', postsStart);
            // Find last complete object in posts array
            let lastCloseBrace = cleaned.lastIndexOf('}');
            if (lastCloseBrace > arrayStart) {
              // Close the posts array and root object
              cleaned = cleaned.substring(0, lastCloseBrace + 1) + ']}';
              console.warn('Repaired truncated JSON by closing posts array');
            }
          } else {
            // Just close the root object
            const lastBrace = cleaned.lastIndexOf('}');
            if (lastBrace > 0) {
              cleaned = cleaned.substring(0, lastBrace + 1);
            }
          }
        }

        strategyData = JSON.parse(cleaned);
        console.log(`JSON repair successful. Posts recovered: ${strategyData.posts?.length || 0}`);
      } catch (repairError) {
        console.error('JSON repair also failed:', repairError);
        return new Response(
          JSON.stringify({ error: 'Strategy was too large to generate in one pass. Please try with a shorter duration (e.g. 14 days) or fewer platforms.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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

    // Normalize platform for DB check constraint (only allows: instagram, facebook, tiktok, linkedin, twitter, multi)
    const validPlatforms = ['instagram', 'facebook', 'tiktok', 'linkedin', 'twitter', 'multi'];
    const normalizedPlatform = validPlatforms.includes(platform) ? platform : 'multi';

    // Save strategy to database with enhanced fields
    const { data: savedStrategy, error: strategyError } = await supabase
      .from('content_strategies')
      .insert({
        user_id: user.id,
        title: overview.title,
        platform: normalizedPlatform,
        duration_days: durationDays,
        start_date: overview.start_date,
        end_date: overview.end_date,
        goals: overview.goals,
        content_mix: overview.content_mix,
        predicted_metrics: predictedMetrics,
        conversation_id: conversationId || null,
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
