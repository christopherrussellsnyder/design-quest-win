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
    const { userId, action, campaignData, templateId } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log('Campaign intelligence action:', action, 'for user:', userId);
    
    if (action === 'get_templates') {
      const { data: templates } = await supabase
        .from('campaign_templates')
        .select('*')
        .order('category', { ascending: true });
      
      return new Response(
        JSON.stringify({ success: true, templates: templates || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'generate_strategy') {
      const strategy = await generateCampaignStrategy(userId, campaignData, supabase);
      
      return new Response(
        JSON.stringify({ success: true, strategy }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'create_campaign') {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          user_id: userId,
          name: campaignData.name,
          description: campaignData.description,
          start_date: campaignData.startDate,
          end_date: campaignData.endDate,
          status: 'active',
          goals: campaignData.goals,
          platform: campaignData.platforms?.[0] || 'all',
          total_budget: campaignData.budget || 0
        })
        .select()
        .single();
      
      if (error) {
        console.error('Campaign creation error:', error);
        throw error;
      }
      
      let contentPlan: any[] = [];
      if (campaignData.autoGenerateContent && campaignData.totalPosts > 0) {
        contentPlan = await generateContentPlan(
          userId,
          campaign.id,
          campaignData,
          supabase
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          campaign, 
          contentPlan,
          message: contentPlan.length > 0 
            ? `Campaign created with ${contentPlan.length} posts scheduled`
            : 'Campaign created successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'get_performance') {
      const { data: performance } = await supabase
        .rpc('calculate_campaign_performance', {
          p_campaign_id: campaignData.campaignId
        });
      
      const { data: dailyTracking } = await supabase
        .from('campaign_performance_tracking')
        .select('*')
        .eq('campaign_id', campaignData.campaignId)
        .order('tracked_date', { ascending: true });
      
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignData.campaignId)
        .single();
      
      const analysis = analyzeCampaignPerformance(
        performance?.[0],
        campaign,
        dailyTracking || []
      );
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          performance: performance?.[0],
          dailyTracking: dailyTracking || [],
          analysis
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    throw new Error('Invalid action');
    
  } catch (error) {
    console.error('Campaign intelligence error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

interface CampaignData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  platforms?: string[];
  goals?: Record<string, number>;
  budget?: number;
  objective?: string;
  postsPerDay?: number;
  contentTypes?: string[];
  hashtags?: string;
  targetImpressions?: number;
  targetReach?: number;
  targetEngagement?: number;
  targetClicks?: number;
  templateId?: string;
}

async function generateCampaignStrategy(userId: string, campaignData: CampaignData, supabase: any) {
  // Get user's performance patterns
  const { data: strategyData } = await supabase
    .rpc('get_campaign_strategy_data', {
      p_user_id: userId,
      p_platform: campaignData.platforms?.[0] || 'all'
    });
  
  // Get user's top performing content patterns
  const { data: contentPatterns } = await supabase
    .from('content_performance_patterns')
    .select('*')
    .eq('user_id', userId)
    .order('avg_engagement_rate', { ascending: false })
    .limit(10);
  
  // Get user's best performing hashtags
  const { data: topHashtags } = await supabase
    .rpc('get_top_performing_elements', {
      p_user_id: userId,
      p_element_type: 'hashtags',
      p_limit: 10
    });
  
  // Get optimal time slots
  const { data: optimalSlots } = await supabase
    .rpc('get_optimal_time_slots', {
      p_user_id: userId,
      p_platform: campaignData.platforms?.[0] || 'all',
      p_limit: 5
    });
  
  const userData = strategyData?.[0] || {
    best_content_type: 'image',
    best_content_length: 'medium',
    best_posting_time: 'afternoon',
    avg_engagement_rate: 2.5,
    total_posts_analyzed: 0
  };
  
  // Calculate campaign duration
  const startDate = new Date(campaignData.startDate);
  const endDate = new Date(campaignData.endDate);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Use user-specified posts per day or calculate based on campaign type
  const postsPerDay = campaignData.postsPerDay || getPostsPerDayByObjective(campaignData.objective || 'awareness');
  const totalPosts = Math.ceil(duration * postsPerDay);
  
  // Generate content themes based on objective AND content types selected
  const themes = getContentThemesEnhanced(
    campaignData.objective || 'awareness',
    campaignData.contentTypes || ['images', 'text'],
    campaignData.name
  );
  
  // Build optimal days from user's actual performance data
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bestDays: string[] = optimalSlots?.length > 0
    ? [...new Set(optimalSlots.slice(0, 5).map((s: any) => dayNames[s.day_of_week]))] as string[]
    : ['Tuesday', 'Wednesday', 'Thursday'];
  
  // Determine best posting times from user data
  const bestTimeSlots = optimalSlots?.slice(0, 3).map((s: any) => {
    const hour = s.hour_of_day;
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }) || ['afternoon'];
  const primaryTimeSlot = bestTimeSlots[0] || userData.best_posting_time;
  
  // Calculate budget-based recommendations
  const hasBudget = (campaignData.budget || 0) > 0;
  const budgetPerPost = hasBudget ? (campaignData.budget || 0) / totalPosts : 0;
  
  // Build personalized key tactics based on ALL user data
  const keyTactics = generatePersonalizedTactics(
    userData,
    contentPatterns || [],
    topHashtags || [],
    campaignData,
    primaryTimeSlot,
    bestDays
  );
  
  // Calculate expected results based on user's historical data and goals
  const expectedMultiplier = userData.avg_engagement_rate / 2.5;
  const targetImpressions = campaignData.targetImpressions || campaignData.goals?.impressions || 10000;
  const targetEngagement = campaignData.targetEngagement || campaignData.goals?.engagement_rate || 3.5;
  
  // Build strategy
  const strategy = {
    overview: {
      campaignType: campaignData.objective || 'awareness',
      campaignName: campaignData.name,
      duration: duration,
      totalPosts: totalPosts,
      postsPerWeek: Math.ceil(postsPerDay * 7),
      platforms: campaignData.platforms || ['all'],
      budget: campaignData.budget || 0,
      budgetPerPost: Math.round(budgetPerPost * 100) / 100
    },
    
    contentStrategy: {
      recommendedType: userData.best_content_type,
      recommendedLength: userData.best_content_length,
      selectedContentTypes: campaignData.contentTypes || ['images', 'text'],
      themes: themes,
      postingFrequency: `${postsPerDay.toFixed(1)} posts per day`,
      suggestedHashtags: topHashtags?.slice(0, 5).map((h: any) => h.element) || [],
      userHashtags: campaignData.hashtags?.split(/[,\s]+/).filter(Boolean) || []
    },
    
    timingStrategy: {
      bestTimeOfDay: primaryTimeSlot,
      optimalDays: bestDays.slice(0, 4),
      avoidWeekends: userData.avg_engagement_rate < 3,
      specificHours: optimalSlots?.slice(0, 3).map((s: any) => `${s.hour_of_day}:00`) || [],
      confidence: optimalSlots?.length >= 5 ? 'high' : optimalSlots?.length >= 2 ? 'medium' : 'low'
    },
    
    weeklyBreakdown: generateWeeklyBreakdownEnhanced(
      themes, 
      duration, 
      postsPerDay,
      campaignData.objective || 'awareness',
      campaignData.platforms || []
    ),
    
    expectedResults: {
      estimatedImpressions: Math.round(totalPosts * 1000 * expectedMultiplier),
      estimatedEngagement: Math.round(totalPosts * 50 * expectedMultiplier),
      projectedEngagementRate: userData.avg_engagement_rate,
      targetImpressions: targetImpressions,
      targetEngagementRate: targetEngagement,
      confidence: userData.total_posts_analyzed >= 20 ? 'high' : userData.total_posts_analyzed >= 10 ? 'medium' : 'low',
      basedOnPosts: userData.total_posts_analyzed
    },
    
    keyTactics: keyTactics,
    
    milestones: generateMilestones(duration, {
      impressions: targetImpressions,
      engagement_rate: targetEngagement,
      conversions: campaignData.targetClicks || campaignData.goals?.conversions || 50
    }),
    
    platformSpecific: generatePlatformRecommendations(campaignData.platforms || [], contentPatterns || [])
  };
  
  return strategy;
}

function getPostsPerDayByObjective(objective: string): number {
  const frequencyMap: Record<string, number> = {
    awareness: 1.5,
    engagement: 2.5,
    conversions: 2,
    traffic: 2,
    leads: 1.5,
    sales: 2.5,
    event: 2
  };
  return frequencyMap[objective] || 1.5;
}

function generatePersonalizedTactics(
  userData: any,
  contentPatterns: any[],
  topHashtags: any[],
  campaignData: CampaignData,
  primaryTimeSlot: string,
  bestDays: string[]
): string[] {
  const tactics: string[] = [];
  
  // Content type recommendation
  const bestContentPattern = contentPatterns.find(p => p.pattern_type === 'content_type');
  if (bestContentPattern) {
    tactics.push(`Focus on ${bestContentPattern.pattern_value} content - your engagement rate is ${bestContentPattern.avg_engagement_rate?.toFixed(1)}%`);
  } else {
    tactics.push(`Focus on ${userData.best_content_type} content (your best performer)`);
  }
  
  // Length recommendation
  const bestLengthPattern = contentPatterns.find(p => p.pattern_type === 'content_length');
  if (bestLengthPattern) {
    tactics.push(`Keep posts ${bestLengthPattern.pattern_value} length for optimal engagement`);
  } else {
    tactics.push(`Keep posts ${userData.best_content_length} length`);
  }
  
  // Timing recommendation with specific data
  if (bestDays.length > 0) {
    tactics.push(`Post on ${bestDays.slice(0, 3).join(', ')} during ${primaryTimeSlot} for maximum reach`);
  } else {
    tactics.push(`Post during ${primaryTimeSlot} for maximum engagement`);
  }
  
  // Question pattern recommendation
  const questionPattern = contentPatterns.find(p => p.pattern_type === 'has_question' && p.pattern_value === 'yes');
  if (questionPattern && questionPattern.avg_engagement_rate > userData.avg_engagement_rate) {
    tactics.push(`Include questions - they get ${((questionPattern.avg_engagement_rate / userData.avg_engagement_rate - 1) * 100).toFixed(0)}% more engagement`);
  } else {
    tactics.push('Include questions in 50% of posts to drive interaction');
  }
  
  // Hashtag recommendation
  if (topHashtags.length > 0) {
    tactics.push(`Use proven hashtags: ${topHashtags.slice(0, 3).map((h: any) => h.element).join(', ')}`);
  } else if (campaignData.hashtags) {
    tactics.push(`Use campaign hashtags: ${campaignData.hashtags}`);
  }
  
  // Objective-specific tactics
  const objectiveTactics = getObjectiveTactics(campaignData.objective || 'awareness');
  tactics.push(...objectiveTactics.slice(0, 2));
  
  // Budget recommendation
  if ((campaignData.budget || 0) > 0) {
    tactics.push(`Allocate budget to boost top-performing posts for amplified reach`);
  }
  
  return tactics.slice(0, 7);
}

function getObjectiveTactics(objective: string): string[] {
  const tacticMap: Record<string, string[]> = {
    awareness: ['Share behind-the-scenes content to humanize your brand', 'Collaborate with complementary accounts for cross-promotion'],
    engagement: ['Run interactive polls and quizzes', 'Respond to comments within 1 hour to boost algorithm visibility'],
    conversions: ['Include clear CTAs in every post', 'Use social proof and testimonials in carousel posts'],
    traffic: ['Create curiosity gaps in captions that drive clicks', 'Use link stickers and bio links strategically'],
    leads: ['Offer exclusive free resources', 'Showcase case studies and success stories'],
    sales: ['Create urgency with limited-time offers', 'Feature customer reviews and unboxing content'],
    event: ['Build countdown content leading to event', 'Feature speaker highlights and agenda teasers']
  };
  return tacticMap[objective] || tacticMap.awareness;
}

function generatePlatformRecommendations(platforms: string[], contentPatterns: any[]): Record<string, any> {
  const recommendations: Record<string, any> = {};
  
  platforms.forEach(platform => {
    const platformPatterns = contentPatterns.filter(p => p.platform === platform);
    const bestPattern = platformPatterns.sort((a, b) => (b.avg_engagement_rate || 0) - (a.avg_engagement_rate || 0))[0];
    
    recommendations[platform] = {
      bestContentType: bestPattern?.pattern_value || 'image',
      recommendedFrequency: getPlatformFrequency(platform),
      tips: getPlatformTips(platform)
    };
  });
  
  return recommendations;
}

function getPlatformFrequency(platform: string): string {
  const freqMap: Record<string, string> = {
    instagram: '1-2 posts/day, 5-7 stories',
    facebook: '1-2 posts/day',
    twitter: '3-5 tweets/day',
    linkedin: '1 post/day',
    tiktok: '1-3 videos/day'
  };
  return freqMap[platform] || '1-2 posts/day';
}

function getPlatformTips(platform: string): string[] {
  const tipsMap: Record<string, string[]> = {
    instagram: ['Use Reels for maximum reach', 'Carousels get highest saves', 'Engage with Stories polls'],
    facebook: ['Video content gets priority', 'Share to relevant groups', 'Live videos boost engagement'],
    twitter: ['Thread format for long content', 'Engage in trending conversations', 'Quote tweet with insights'],
    linkedin: ['Native video preferred', 'Personal stories perform well', 'Tag relevant connections'],
    tiktok: ['Hook viewers in first 2 seconds', 'Use trending sounds', 'Duet with related content']
  };
  return tipsMap[platform] || ['Optimize for platform algorithm', 'Engage with your community'];
}

function getContentThemes(objective: string): string[] {
  const themeMap: Record<string, string[]> = {
    awareness: ['brand_story', 'behind_the_scenes', 'team_introductions', 'values', 'customer_stories'],
    engagement: ['questions', 'polls', 'user_generated', 'challenges', 'discussions'],
    conversions: ['product_highlights', 'testimonials', 'offers', 'urgency', 'social_proof'],
    traffic: ['tips_and_tricks', 'tutorials', 'resources', 'blog_promotion', 'link_content'],
    leads: ['value_proposition', 'case_studies', 'free_resources', 'webinars', 'demos'],
    sales: ['product_launch', 'promotions', 'bundles', 'limited_offers', 'customer_success'],
    event: ['event_announcement', 'speaker_intros', 'agenda_highlights', 'registration_reminders', 'recap']
  };
  
  return themeMap[objective] || themeMap.awareness;
}

function getContentThemesEnhanced(objective: string, contentTypes: string[], campaignName: string): string[] {
  const baseThemes = getContentThemes(objective);
  const enhancedThemes: string[] = [];
  
  // Add content type specific themes
  if (contentTypes.includes('videos')) {
    enhancedThemes.push('video_tutorials', 'behind_the_scenes_videos');
  }
  if (contentTypes.includes('carousels')) {
    enhancedThemes.push('step_by_step_guides', 'before_after');
  }
  if (contentTypes.includes('images')) {
    enhancedThemes.push('visual_quotes', 'product_showcase');
  }
  
  // Mix base themes with enhanced ones
  const allThemes = [...baseThemes, ...enhancedThemes];
  return [...new Set(allThemes)].slice(0, 8);
}

function generateWeeklyBreakdown(themes: string[], durationDays: number, postsPerDay: number) {
  const weeks = Math.ceil(durationDays / 7);
  const breakdown = [];
  
  for (let week = 1; week <= Math.min(weeks, 6); week++) {
    const themeIndex = (week - 1) % themes.length;
    const theme = themes[themeIndex] || 'general_content';
    
    breakdown.push({
      week: week,
      focus: theme.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      postsPlanned: Math.ceil(postsPerDay * 7),
      objectives: getThemeObjectives(theme)
    });
  }
  
  return breakdown;
}

function generateWeeklyBreakdownEnhanced(
  themes: string[], 
  durationDays: number, 
  postsPerDay: number,
  objective: string,
  platforms: string[]
) {
  const weeks = Math.ceil(durationDays / 7);
  const breakdown = [];
  
  const phaseNames = getPhaseNamesByObjective(objective);
  
  for (let week = 1; week <= Math.min(weeks, 6); week++) {
    const themeIndex = (week - 1) % themes.length;
    const theme = themes[themeIndex] || 'general_content';
    const phaseName = phaseNames[Math.min(week - 1, phaseNames.length - 1)];
    
    const weekObjectives = getEnhancedObjectives(theme, objective, week, weeks);
    
    breakdown.push({
      week: week,
      phase: phaseName,
      focus: theme.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      postsPlanned: Math.ceil(postsPerDay * 7),
      objectives: weekObjectives,
      platforms: platforms,
      milestoneCheck: week === Math.ceil(weeks / 2) || week === weeks
    });
  }
  
  return breakdown;
}

function getPhaseNamesByObjective(objective: string): string[] {
  const phases: Record<string, string[]> = {
    awareness: ['Launch & Introduce', 'Build Recognition', 'Expand Reach', 'Establish Presence', 'Maintain Visibility', 'Optimize & Grow'],
    engagement: ['Warm Up', 'Activate Community', 'Deepen Interaction', 'Foster Loyalty', 'Celebrate Success', 'Sustain Momentum'],
    conversions: ['Attract Attention', 'Build Interest', 'Create Desire', 'Drive Action', 'Convert & Close', 'Maximize ROI'],
    traffic: ['Hook & Intrigue', 'Drive Curiosity', 'Amplify Clicks', 'Optimize Flow', 'Scale Traffic', 'Sustain Growth'],
    leads: ['Attract Prospects', 'Nurture Interest', 'Qualify Leads', 'Convert Opportunities', 'Close & Follow Up', 'Optimize Pipeline'],
    sales: ['Tease & Preview', 'Showcase Value', 'Build Urgency', 'Push to Purchase', 'Close Sales', 'Upsell & Retain'],
    event: ['Announce & Excite', 'Build Anticipation', 'Drive Registrations', 'Final Push', 'Event Day', 'Post-Event Recap']
  };
  return phases[objective] || phases.awareness;
}

function getEnhancedObjectives(theme: string, objective: string, week: number, totalWeeks: number): string[] {
  const baseObjectives = getThemeObjectives(theme);
  
  // Add week-specific objectives
  if (week === 1) {
    return [...baseObjectives, 'Set the tone for the campaign'];
  } else if (week === Math.ceil(totalWeeks / 2)) {
    return [...baseObjectives, 'Mid-campaign review and optimization'];
  } else if (week === totalWeeks) {
    return [...baseObjectives, 'Strong finish with clear CTA'];
  }
  
  return baseObjectives;
}

function getThemeObjectives(theme: string): string[] {
  const objectives: Record<string, string[]> = {
    teaser_announcement: ['Build anticipation', 'Generate curiosity', 'Create buzz'],
    feature_highlights: ['Showcase key benefits', 'Demonstrate value', 'Address pain points'],
    customer_testimonials: ['Build trust', 'Show social proof', 'Share success stories'],
    launch_day: ['Drive immediate action', 'Maximize visibility', 'Celebrate launch'],
    follow_up: ['Thank audience', 'Share results', 'Maintain momentum'],
    brand_story: ['Share origin', 'Communicate values', 'Build connection'],
    behind_the_scenes: ['Show authenticity', 'Humanize brand', 'Create relatability'],
    team_introductions: ['Build trust', 'Show expertise', 'Create personal connection'],
    values: ['Communicate mission', 'Show purpose', 'Align with audience'],
    customer_stories: ['Showcase success', 'Build credibility', 'Inspire action'],
    questions: ['Spark discussion', 'Gather feedback', 'Increase replies'],
    polls: ['Drive participation', 'Understand audience', 'Boost engagement'],
    user_generated: ['Leverage community', 'Build loyalty', 'Amplify reach'],
    product_highlights: ['Showcase features', 'Drive interest', 'Educate audience'],
    offers: ['Create urgency', 'Drive sales', 'Reward followers']
  };
  
  return objectives[theme] || ['Engage audience', 'Build awareness', 'Drive interaction'];
}

interface Milestone {
  day: number;
  label: string;
  targets: {
    impressions: number;
    engagement: number;
    conversions: number;
  };
}

function generateMilestones(duration: number, goals: Record<string, number>): Milestone[] {
  const milestones: Milestone[] = [];
  const checkpoints = [0.25, 0.5, 0.75, 1.0];
  
  checkpoints.forEach(checkpoint => {
    const day = Math.ceil(duration * checkpoint);
    const label = checkpoint === 1 ? 'End' : `${checkpoint * 100}%`;
    
    milestones.push({
      day: day,
      label: label,
      targets: {
        impressions: Math.round((goals.impressions || 10000) * checkpoint),
        engagement: Math.round((goals.engagement_rate || 3.5) * checkpoint),
        conversions: Math.round((goals.conversions || 50) * checkpoint)
      }
    });
  });
  
  return milestones;
}

async function generateContentPlan(userId: string, campaignId: string, campaignData: any, supabase: any) {
  const startDate = new Date(campaignData.startDate);
  const endDate = new Date(campaignData.endDate);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const postsToCreate = Math.min(campaignData.totalPosts || 20, 30);
  const contentPlan: any[] = [];
  
  let lastScheduledTime = startDate.toISOString();
  
  for (let i = 0; i < postsToCreate; i++) {
    // Find next optimal slot
    const { data: slot } = await supabase
      .rpc('find_next_optimal_slot', {
        p_user_id: userId,
        p_platform: campaignData.platforms?.[0] || 'all',
        p_after_time: lastScheduledTime,
        p_days_ahead: duration
      });
    
    const scheduledTime = slot?.[0]?.suggested_time || 
      new Date(new Date(lastScheduledTime).getTime() + 24 * 60 * 60 * 1000).toISOString();
    
    // Create the post
    const { data: post, error } = await supabase
      .from('scheduled_posts')
      .insert({
        user_id: userId,
        campaign_id: campaignId,
        title: `Campaign Post ${i + 1}`,
        content: `[Draft] Campaign content for ${campaignData.name} - Post ${i + 1}`,
        platforms: campaignData.platforms || ['all'],
        post_type: 'text',
        scheduled_time: scheduledTime,
        status: 'draft'
      })
      .select()
      .single();
    
    if (!error && post) {
      contentPlan.push(post);
      lastScheduledTime = scheduledTime;
    }
  }
  
  return contentPlan;
}

function analyzeCampaignPerformance(performance: any, campaign: any, dailyTracking: any[]) {
  if (!performance || !campaign) {
    return { status: 'insufficient_data', insights: [] };
  }
  
  const goals = campaign.goals || {};
  const progress = {
    impressions: goals.impressions ? (performance.total_impressions / goals.impressions * 100) : 0,
    engagementRate: goals.engagement_rate ? (performance.avg_engagement_rate / goals.engagement_rate * 100) : 0,
    posts: campaign.total_posts ? (performance.total_posts / campaign.total_posts * 100) : 0
  };
  
  const trend = calculateTrend(dailyTracking);
  
  const insights: Array<{ type: string; message: string; action: string }> = [];
  
  if (progress.impressions > 100) {
    insights.push({
      type: 'success',
      message: `Exceeding impression goal by ${Math.round(progress.impressions - 100)}%`,
      action: 'Consider increasing your goals for better planning'
    });
  } else if (progress.impressions < 50 && progress.impressions > 0) {
    insights.push({
      type: 'warning',
      message: `Behind on impressions target (${Math.round(progress.impressions)}%)`,
      action: 'Increase posting frequency or boost high-performing posts'
    });
  }
  
  if (trend === 'improving') {
    insights.push({
      type: 'success',
      message: 'Campaign performance is improving over time',
      action: 'Continue current strategy'
    });
  } else if (trend === 'declining') {
    insights.push({
      type: 'warning',
      message: 'Campaign performance is declining',
      action: 'Review recent posts and adjust content strategy'
    });
  }
  
  return {
    status: 'active',
    progress: progress,
    trend: trend,
    insights: insights,
    onTrack: progress.impressions >= 80 || progress.engagementRate >= 80
  };
}

function calculateTrend(dailyTracking: any[]): string {
  if (dailyTracking.length < 3) return 'stable';
  
  const recent = dailyTracking.slice(-3);
  const earlier = dailyTracking.slice(-6, -3);
  
  if (earlier.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((sum, d) => sum + parseFloat(d.engagement_rate || '0'), 0) / recent.length;
  const earlierAvg = earlier.reduce((sum, d) => sum + parseFloat(d.engagement_rate || '0'), 0) / earlier.length;
  
  if (recentAvg > earlierAvg * 1.1) return 'improving';
  if (recentAvg < earlierAvg * 0.9) return 'declining';
  return 'stable';
}
