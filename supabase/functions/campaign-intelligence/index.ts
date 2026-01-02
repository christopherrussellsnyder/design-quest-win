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
}

async function generateCampaignStrategy(userId: string, campaignData: CampaignData, supabase: any) {
  // Get user's performance patterns
  const { data: strategyData } = await supabase
    .rpc('get_campaign_strategy_data', {
      p_user_id: userId,
      p_platform: 'all'
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
  
  // Calculate posts based on duration
  const postsPerDay = 1.5;
  const totalPosts = Math.ceil(duration * postsPerDay);
  
  // Generate content themes based on objective
  const themes = getContentThemes(campaignData.objective || 'awareness');
  
  // Build strategy
  const strategy = {
    overview: {
      campaignType: campaignData.objective || 'awareness',
      duration: duration,
      totalPosts: totalPosts,
      postsPerWeek: Math.ceil(postsPerDay * 7),
      platforms: campaignData.platforms || ['all']
    },
    
    contentStrategy: {
      recommendedType: userData.best_content_type,
      recommendedLength: userData.best_content_length,
      themes: themes,
      postingFrequency: `${postsPerDay.toFixed(1)} posts per day`
    },
    
    timingStrategy: {
      bestTimeOfDay: userData.best_posting_time,
      optimalDays: ['Tuesday', 'Wednesday', 'Thursday'],
      avoidWeekends: userData.avg_engagement_rate < 3
    },
    
    weeklyBreakdown: generateWeeklyBreakdown(themes, duration, postsPerDay),
    
    expectedResults: {
      estimatedImpressions: Math.round(totalPosts * 1000 * (userData.avg_engagement_rate / 2.5)),
      estimatedEngagement: Math.round(totalPosts * 50 * (userData.avg_engagement_rate / 2.5)),
      projectedEngagementRate: userData.avg_engagement_rate,
      confidence: userData.total_posts_analyzed >= 20 ? 'high' : userData.total_posts_analyzed >= 10 ? 'medium' : 'low'
    },
    
    keyTactics: [
      `Focus on ${userData.best_content_type} content (your best performer)`,
      `Keep posts ${userData.best_content_length} length`,
      `Post during ${userData.best_posting_time} for maximum engagement`,
      'Include questions in 50% of posts to drive interaction',
      'Use your top-performing hashtags consistently'
    ],
    
    milestones: generateMilestones(duration, campaignData.goals || {})
  };
  
  return strategy;
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
