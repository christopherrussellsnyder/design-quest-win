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

interface BusinessCtx {
  businessName: string;
  industry: string;
  businessType: string;
  targetAudience: string;
  brandVoice: string;
  products: string;
  competitors: string;
  uvp: string;
  geoFocus: string;
}

function getBusinessContext(businessContext: any, userSettings: any, businessInfo: any): BusinessCtx {
  // Priority: userSettings > businessInfo > businessContext
  const us = userSettings || {};
  const bi = businessInfo || {};
  const bp = businessContext?.business_profile || {};
  const ta = (us.target_audience as any) || {};

  return {
    businessName: us.business_name || bi.business_name || bp.businessName || 'your business',
    industry: us.industry || bi.industry || bp.industry || 'general',
    businessType: us.business_type || bi.business_type || bp.businessType || 'B2C',
    targetAudience: [
      ta.age_range || (bi.target_age_min && bi.target_age_max ? `${bi.target_age_min}-${bi.target_age_max}` : ''),
      ta.demographics || '',
      ta.pain_points || bi.customer_pain_points || '',
    ].filter(Boolean).join(' | ') || '25-44 consumers',
    brandVoice: us.brand_voice || 
      (bi.brand_voice_traits ? (Array.isArray(bi.brand_voice_traits) ? bi.brand_voice_traits.join(', ') : String(bi.brand_voice_traits)) : '') ||
      bp.brandIdentity?.toneCharacteristics?.join(', ') || 'professional, engaging',
    products: (Array.isArray(us.products_services) ? us.products_services.join(', ') : '') ||
      bi.primary_products_services || 
      bp.productsServices?.map((p: any) => p.name || p).join(', ') || '',
    competitors: (Array.isArray(us.competitors) ? us.competitors.join(', ') : '') ||
      (bi.top_competitors ? (Array.isArray(bi.top_competitors) ? bi.top_competitors.map((c: any) => c.name || c).join(', ') : '') : '') ||
      bp.competitors?.join(', ') || '',
    uvp: us.unique_value_proposition || bi.unique_value_proposition || bi.competitive_advantage || '',
    geoFocus: us.geographic_focus || 
      (bi.geographic_focus ? (Array.isArray(bi.geographic_focus) ? bi.geographic_focus.join(', ') : String(bi.geographic_focus)) : '') || '',
  };
}

function buildOverviewPrompt(ctx: BusinessCtx, platform: string, durationDays: number, goals: string[], analyticsSection: string, customInstructions?: string): string {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);

  return `Create a ${durationDays}-day ${platform} content strategy for ${ctx.businessName} (${ctx.industry}, ${ctx.businessType}).
Target: ${ctx.targetAudience}. Voice: ${ctx.brandVoice}.
${ctx.products ? `Products: ${ctx.products}` : ''}
${ctx.competitors ? `Competitors: ${ctx.competitors}` : ''}
${ctx.uvp ? `UVP: ${ctx.uvp}` : ''}
${analyticsSection}
Goals: ${goals.join(', ')}
${customInstructions ? `Special requirements: ${customInstructions}` : ''}

Use 4-week arc: Week1=Awareness, Week2=Engagement, Week3=Consideration, Week4=Conversion.
Content mix: 30% educational, 25% promotional, 20% engagement, 15% social proof, 10% behind-scenes.

Return ONLY valid JSON (no markdown):
{
  "strategy_overview": {
    "title": "string",
    "platform": "${platform}",
    "duration_days": ${durationDays},
    "start_date": "${startDate.toISOString().split('T')[0]}",
    "end_date": "${endDate.toISOString().split('T')[0]}",
    "total_posts": ${durationDays},
    "strategic_approach": {"core_strategy":"string","key_differentiator":"string","competitive_edge":"string"},
    "goals": ${JSON.stringify(goals)},
    "content_mix": {"educational":30,"promotional":25,"engagement":20,"social_proof":15,"behind_scenes":10},
    "post_type_distribution": {"carousel":0,"reel":0,"single_image":0,"video":0,"story":0},
    "predicted_metrics": {"total_reach":0,"total_impressions":0,"avg_engagement_rate":0,"expected_follower_growth":0,"expected_follower_growth_percentage":0,"expected_profile_visits":0,"expected_website_clicks":0,"expected_conversions":0},
    "key_tactics": ["string"],
    "success_milestones": {"week_1":"string","week_2":"string","week_3":"string","week_4":"string"},
    "risk_assessment": {"potential_challenges":["string"],"mitigation_strategies":["string"],"pivot_triggers":["string"]},
    "implementation_guide": {"posting_schedule":"string","content_creation_timeline":"string","engagement_protocol":"string","monitoring_schedule":"string","adjustment_criteria":"string"}
  },
  "weekly_breakdown": [
    {"week":1,"theme":"string","objective":"string","post_count":7,"key_messages":["string"],"expected_metrics":{"reach":0,"engagement_rate":0,"follower_growth":0},"focus_areas":["string"]},
    {"week":2,"theme":"string","objective":"string","post_count":7,"key_messages":["string"],"expected_metrics":{"reach":0,"engagement_rate":0,"follower_growth":0},"focus_areas":["string"]},
    {"week":3,"theme":"string","objective":"string","post_count":7,"key_messages":["string"],"expected_metrics":{"reach":0,"engagement_rate":0,"follower_growth":0},"focus_areas":["string"]},
    {"week":4,"theme":"string","objective":"string","post_count":${Math.max(durationDays - 21, 7)},"key_messages":["string"],"expected_metrics":{"reach":0,"engagement_rate":0,"follower_growth":0},"focus_areas":["string"]}
  ]
}

Fill all values with specific, actionable content personalized for ${ctx.businessName} in ${ctx.industry}. Use realistic metric predictions.`;
}

function buildBatchPostsPrompt(ctx: BusinessCtx, platform: string, startDay: number, endDay: number, weeklyThemes: any[], startDate: string): string {
  const postDates: string[] = [];
  const base = new Date(startDate);
  for (let d = startDay; d <= endDay; d++) {
    const date = new Date(base);
    date.setDate(date.getDate() + d - 1);
    postDates.push(date.toISOString().split('T')[0]);
  }

  return `Generate posts ${startDay}-${endDay} for ${ctx.businessName}'s ${platform} strategy.
Business: ${ctx.industry} ${ctx.businessType}. Voice: ${ctx.brandVoice}. Target: ${ctx.targetAudience}.
${ctx.products ? `Products: ${ctx.products}` : ''}

Weekly themes: ${JSON.stringify(weeklyThemes.map(w => ({ week: w.week, theme: w.theme, objective: w.objective })))}

Return ONLY a valid JSON array (no markdown, no wrapping object). Each element:
{
  "day_number": ${startDay},
  "post_date": "${postDates[0]}",
  "post_time": "HH:MM",
  "week_number": 1,
  "week_theme": "string",
  "content_details": {"post_type":"carousel|reel|single_image|video|story","content_category":"educational|promotional|engagement|social_proof|behind_scenes","specific_theme":"string","primary_emotion":"string","content_pillar":"string"},
  "copy_elements": {"hook":{"text":"5-10 word scroll-stopper","technique":"curiosity_gap|pattern_interrupt|bold_statement|question","psychological_principle":"string"},"opening":"2-3 sentences","body":"100-150 words main content","cta":{"text":"string","type":"engage|visit|buy|share|save|comment","strength":"soft|medium|hard"},"full_caption":"complete 150-250 word caption"},
  "hashtag_strategy": {"hashtags":["#tag1","#tag2"],"mix_breakdown":{"high_volume":["3 tags 100K+"],"medium_volume":["5 tags 10K-100K"],"niche":["4 tags 1K-10K"],"branded":["2 brand tags"]}},
  "visual_guidance": {"visual_type":"string","description":"string","color_palette":"string","text_overlay":"string","attention_hook":"string"},
  "performance_prediction": {"predicted_reach":0,"predicted_impressions":0,"predicted_engagement_rate":0.0,"predicted_likes":0,"predicted_comments":0,"predicted_shares":0,"predicted_saves":0,"confidence_level":"High|Medium|Low","prediction_basis":"string"},
  "strategic_rationale": {"why_this_day":"string","arc_positioning":"string","builds_toward":"string","success_metrics":"string"},
  "optimization_tips": {"engagement_boosters":["string"],"a_b_test_ideas":["string"],"potential_issues":["string"],"risk_mitigation":["string"]}
}

Generate exactly ${endDay - startDay + 1} posts (days ${startDay}-${endDay}). Dates: ${postDates.join(', ')}.
Assign week_number based on: days 1-7=week 1, 8-14=week 2, 15-21=week 3, 22+=week 4.
Make each post unique, strategic, and personalized for ${ctx.businessName}. Vary post types and content categories according to the content mix.`;
}

async function callAI(apiKey: string, prompt: string, systemPrompt: string, maxTokens: number = 16000): Promise<string> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.75,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI Gateway error:', response.status, errorText);
    if (response.status === 429) throw new Error('RATE_LIMIT');
    if (response.status === 402) throw new Error('PAYMENT_REQUIRED');
    throw new Error(`AI service error: ${response.status}`);
  }

  const aiResponse = await response.json();
  let text = aiResponse.choices?.[0]?.message?.content || '';
  return text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
}

function parseJSONSafe(text: string): any {
  // First try direct parse
  try { return JSON.parse(text); } catch {}
  
  // Find JSON boundaries
  const jsonStart = text.search(/[\{\[]/);
  if (jsonStart > 0) text = text.substring(jsonStart);
  
  // Clean
  let cleaned = text
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']')
    .replace(/[\x00-\x1F\x7F]/g, (c) => c === '\n' || c === '\t' ? c : '');
  
  try { return JSON.parse(cleaned); } catch {}
  
  // Try closing truncated structures
  if (cleaned.startsWith('{') && !cleaned.endsWith('}')) {
    // Find last complete nested structure
    let depth = 0;
    let lastValidEnd = -1;
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === '{' || cleaned[i] === '[') depth++;
      if (cleaned[i] === '}' || cleaned[i] === ']') { depth--; if (depth <= 1) lastValidEnd = i; }
    }
    if (lastValidEnd > 0) {
      const truncated = cleaned.substring(0, lastValidEnd + 1);
      // Close any open arrays/objects
      const attempts = [truncated + ']}', truncated + '}', truncated + ']]', truncated];
      for (const attempt of attempts) {
        try { return JSON.parse(attempt); } catch {}
      }
    }
  }
  
  if (cleaned.startsWith('[') && !cleaned.endsWith(']')) {
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace > 0) {
      try { return JSON.parse(cleaned.substring(0, lastBrace + 1) + ']'); } catch {}
    }
  }
  
  throw new Error('Failed to parse JSON after all repair attempts');
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
    const effectiveGoals = goals?.length ? goals : ['Increase engagement', 'Grow followers', 'Drive conversions'];

    // Server-side enforcement of Starter plan lifetime cap (2 strategies).
    // Subscribed users (Pro/Agency) are unlimited; only check non-subscribed users.
    const { data: localSub } = await supabase
      .from('subscriptions')
      .select('status, plan_type')
      .eq('user_id', user.id)
      .maybeSingle();
    const isPaid = localSub?.status === 'active' && (localSub.plan_type === 'pro' || localSub.plan_type === 'agency');
    if (!isPaid) {
      const { data: usageRow } = await supabase
        .from('usage_tracking')
        .select('lifetime_strategies_generated')
        .eq('user_id', user.id)
        .order('lifetime_strategies_generated', { ascending: false })
        .limit(1)
        .maybeSingle();
      const used = usageRow?.lifetime_strategies_generated ?? 0;
      if (used >= 2) {
        return new Response(
          JSON.stringify({ error: 'Starter plan limit reached. Upgrade to Pro for unlimited strategies.', code: 'UPGRADE_REQUIRED' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Generating ${durationDays}-day strategy for ${platform} for user ${user.id}`);

    // Parallel fetch all context
    const [businessRes, analyticsRes, settingsRes, businessInfoRes] = await Promise.all([
      supabase.from('business_context').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
      supabase.from('uploaded_analytics').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false }).limit(3),
      supabase.from('user_business_settings').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('business_information').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    const ctx = getBusinessContext(businessRes.data, settingsRes.data, businessInfoRes.data);
    const recentAnalytics = analyticsRes.data || [];

    // Build analytics section
    let analyticsSection = '';
    if (recentAnalytics.length > 0) {
      const latest = recentAnalytics[0]?.extracted_data || recentAnalytics[0]?.metrics || {};
      analyticsSection = `Analytics: Engagement ${latest.engagement_rate || 3.5}%, Followers ${latest.followers || 1000}, Best content: ${latest.best_content_type || 'carousel'}`;
    }

    const systemPrompt = 'You are a world-class content strategist. Generate detailed, actionable content strategies. Always respond with valid JSON only, no markdown formatting or code blocks.';

    // ========== STEP 1: Generate strategy overview ==========
    console.log('Step 1: Generating strategy overview...');
    const overviewPrompt = buildOverviewPrompt(ctx, platform, durationDays, effectiveGoals, analyticsSection, customInstructions);
    const overviewText = await callAI(LOVABLE_API_KEY, overviewPrompt, systemPrompt, 8000);
    
    let overviewData: any;
    try {
      overviewData = parseJSONSafe(overviewText);
    } catch (e) {
      console.error('Overview parse failed:', e, 'Text:', overviewText.substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Failed to generate strategy overview. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const overview = overviewData.strategy_overview;
    const weeklyBreakdown = overviewData.weekly_breakdown || [];
    console.log('Overview generated successfully');

    // ========== STEP 2: Generate posts in batches ==========
    const batchSize = 10;
    const totalPosts = durationDays;
    const batches: number[][] = [];
    for (let i = 1; i <= totalPosts; i += batchSize) {
      batches.push([i, Math.min(i + batchSize - 1, totalPosts)]);
    }

    console.log(`Generating ${totalPosts} posts in ${batches.length} batches...`);
    const allPosts: any[] = [];
    const startDateStr = overview.start_date || new Date().toISOString().split('T')[0];

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const [startDay, endDay] = batches[batchIdx];
      console.log(`Batch ${batchIdx + 1}/${batches.length}: posts ${startDay}-${endDay}`);

      const batchPrompt = buildBatchPostsPrompt(ctx, platform, startDay, endDay, weeklyBreakdown, startDateStr);
      
      let batchPosts: any[] = [];
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          const batchText = await callAI(LOVABLE_API_KEY, batchPrompt, systemPrompt, 16000);
          const parsed = parseJSONSafe(batchText);
          batchPosts = Array.isArray(parsed) ? parsed : (parsed.posts || [parsed]);
          
          if (batchPosts.length > 0) {
            console.log(`Batch ${batchIdx + 1} generated ${batchPosts.length} posts`);
            break;
          }
          throw new Error('Empty batch result');
        } catch (e: any) {
          if (e.message === 'RATE_LIMIT') {
            return new Response(
              JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          if (e.message === 'PAYMENT_REQUIRED') {
            return new Response(
              JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
              { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          retries++;
          console.warn(`Batch ${batchIdx + 1} attempt ${retries} failed:`, e.message);
          if (retries > maxRetries) {
            console.error(`Batch ${batchIdx + 1} failed after ${maxRetries + 1} attempts`);
            // Continue with partial results rather than failing completely
            break;
          }
          // Small delay before retry
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      allPosts.push(...batchPosts);
    }

    if (allPosts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate posts. Please try again or reduce duration.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Total posts generated: ${allPosts.length}`);

    // ========== STEP 3: Save to database ==========
    const validPlatforms = ['instagram', 'facebook', 'tiktok', 'linkedin', 'twitter', 'multi'];
    const normalizedPlatform = validPlatforms.includes(platform) ? platform : 'multi';
    const predictedMetrics = overview.predicted_metrics || {};

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
        weekly_breakdown: weeklyBreakdown,
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

    // Map posts for DB insert
    const postsToInsert = allPosts.map((post: any, index: number) => {
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
        caption: copyElements.full_caption || post.caption || '',
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

    console.log(`Strategy ${savedStrategy.id} saved with ${postsToInsert.length} posts`);

    // Atomically bump lifetime strategy usage (powers Starter plan 2-strategy lockout)
    try {
      await supabase.rpc('increment_strategy_usage', { p_user_id: user.id });
    } catch (e) {
      console.warn('Failed to increment strategy usage:', e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        strategyId: savedStrategy.id,
        strategy: { ...overview, id: savedStrategy.id },
        weeklyBreakdown: weeklyBreakdown,
        postsCount: allPosts.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate strategy error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
