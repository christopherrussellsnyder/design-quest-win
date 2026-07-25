import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { serviceClient } from "../_shared/supabase.ts";

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
  workspace_id?: string | null;
  contentMode?: 'organic' | 'paid' | 'hybrid';
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
  // Rich audience demographics (anti-oversaturation)
  ageRange: string;
  genderSplit: string;
  incomeLevel: string;
  educationLevels: string;
  painPoints: string;
  buyingBehavior: string;
  clv: string;
  // Product differentiation (anti-oversaturation)
  competitiveAdvantage: string;
  brandValues: string;
  contentRestrictions: string;
}
function normalizePlatformForIntel(p: string): string {
  const s = (p || '').toLowerCase();
  if (s.includes('facebook') || s.includes('meta') || s.includes('instagram')) return 'meta';
  if (s.includes('tiktok')) return 'tiktok';
  if (s.includes('linkedin')) return 'linkedin';
  if (s.includes('google') || s.includes('youtube')) return 'google';
  if (s.includes('twitter') || s === 'x') return 'twitter';
  return 'meta';
}


function getBusinessContext(businessContext: any, userSettings: any, businessInfo: any): BusinessCtx {
  const us = userSettings || {};
  const bi = businessInfo || {};
  const bp = businessContext?.business_profile || {};
  const ta = (us.target_audience as any) || {};

  const ageRange = bi.target_age_min && bi.target_age_max
    ? `${bi.target_age_min}-${bi.target_age_max === 65 ? '65+' : bi.target_age_max}`
    : (ta.age_range || '');

  const gd = bi.gender_distribution || {};
  const genderSplit = (gd.male || gd.female || gd.other)
    ? `Male ${gd.male || 0}% / Female ${gd.female || 0}% / Other ${gd.other || 0}%`
    : '';

  const edu = Array.isArray(bi.education_levels) ? bi.education_levels.join(', ') : '';
  const geo = Array.isArray(bi.geographic_focus)
    ? bi.geographic_focus.join(', ')
    : (us.geographic_focus || '');
  const brandValues = Array.isArray(bi.brand_values) ? bi.brand_values.join(', ') : '';

  const audienceParts = [
    ageRange && `Age ${ageRange}`,
    genderSplit,
    bi.income_level && `Income: ${bi.income_level}`,
    edu && `Education: ${edu}`,
    bi.buying_behavior && `Buying behavior: ${bi.buying_behavior}`,
    ta.demographics,
  ].filter(Boolean);

  return {
    businessName: us.business_name || bi.business_name || bp.businessName || 'your business',
    industry: us.industry || bi.industry || bp.industry || 'general',
    businessType: us.business_type || bi.business_type || bp.businessType || 'B2C',
    targetAudience: audienceParts.join(' | ') || '25-44 consumers',
    brandVoice: us.brand_voice ||
      (bi.brand_voice_traits ? (Array.isArray(bi.brand_voice_traits) ? bi.brand_voice_traits.join(', ') : String(bi.brand_voice_traits)) : '') ||
      bp.brandIdentity?.toneCharacteristics?.join(', ') || 'professional, engaging',
    products: (Array.isArray(us.products_services) ? us.products_services.join(', ') : '') ||
      bi.primary_products_services ||
      bp.productsServices?.map((p: any) => p.name || p).join(', ') || '',
    competitors: (Array.isArray(us.competitors) ? us.competitors.join(', ') : '') ||
      (bi.top_competitors ? (Array.isArray(bi.top_competitors) ? bi.top_competitors.map((c: any) => c.name || c).join(', ') : '') : '') ||
      bp.competitors?.join(', ') || '',
    uvp: us.unique_value_proposition || bi.unique_value_proposition || '',
    geoFocus: geo,
    ageRange,
    genderSplit,
    incomeLevel: bi.income_level || '',
    educationLevels: edu,
    painPoints: ta.pain_points || bi.customer_pain_points || '',
    buyingBehavior: bi.buying_behavior || '',
    clv: bi.customer_lifetime_value ? `$${bi.customer_lifetime_value}` : '',
    competitiveAdvantage: bi.competitive_advantage || '',
    brandValues,
    contentRestrictions: bi.content_restrictions || '',
  };
}

function buildOverviewPrompt(ctx: BusinessCtx, platform: string, durationDays: number, goals: string[], analyticsSection: string, intelligenceSection: string, performanceFeedbackSection: string, promotionsSection: string, customInstructions?: string, contentMode: 'organic' | 'paid' | 'hybrid' = 'hybrid'): string {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);

  return `Create a ${durationDays}-day ${platform} content strategy for ${ctx.businessName} (${ctx.industry}, ${ctx.businessType}).

=== TARGET AUDIENCE (USE THESE EXACT DEMOGRAPHICS — DO NOT GENERALIZE) ===
${ctx.ageRange ? `- Age range: ${ctx.ageRange}` : ''}
${ctx.genderSplit ? `- Gender split: ${ctx.genderSplit}` : ''}
${ctx.incomeLevel ? `- Income level: ${ctx.incomeLevel}` : ''}
${ctx.educationLevels ? `- Education: ${ctx.educationLevels}` : ''}
${ctx.buyingBehavior ? `- Buying behavior: ${ctx.buyingBehavior} (tailor CTAs and proof formats to this)` : ''}
${ctx.geoFocus ? `- Geographic focus: ${ctx.geoFocus} (reference local context, time zones, cultural cues)` : ''}
${ctx.painPoints ? `- Customer pain points (address explicitly in hooks/body): ${ctx.painPoints}` : ''}
${ctx.clv ? `- Avg customer lifetime value: ${ctx.clv} (calibrate offer aggressiveness accordingly)` : ''}

=== BUSINESS DIFFERENTIATION (USE TO AVOID GENERIC NICHE PLAYBOOKS) ===
- Products/services SOLD BY THIS BUSINESS (not the whole niche): ${ctx.products || 'unspecified'}
${ctx.uvp ? `- Unique value proposition: ${ctx.uvp}` : ''}
${ctx.competitiveAdvantage ? `- Competitive advantage vs competitors: ${ctx.competitiveAdvantage}` : ''}
${ctx.brandValues ? `- Brand values: ${ctx.brandValues}` : ''}
${ctx.competitors ? `- Competitors to differentiate AGAINST (do NOT mimic — explicitly position differently): ${ctx.competitors}` : ''}
${ctx.contentRestrictions ? `- Content restrictions (never violate): ${ctx.contentRestrictions}` : ''}

Voice: ${ctx.brandVoice}.
${analyticsSection}
${intelligenceSection}
${performanceFeedbackSection}
${promotionsSection}
Goals: ${goals.join(', ')}
${customInstructions ? `Special requirements: ${customInstructions}` : ''}

=== ANTI-OVERSATURATION DIRECTIVE (CRITICAL) ===
Two businesses in the same niche can sell completely different products to completely different audiences. You MUST build this strategy around the SPECIFIC products, audience demographics, pain points, and differentiators above — NOT around generic "${ctx.industry}" best practices. Every post hook, angle, CTA, and creative direction must be traceable to one or more of: this business's specific products, its UVP/competitive advantage, the exact age/gender/income/behavior profile of its audience, or its stated pain points. Reject any idea that would also fit a competitor with the same niche label. If a recommendation could appear unchanged in another ${ctx.industry} brand's strategy, replace it with something specific to ${ctx.businessName}.

=== DIFFERENTIATE THE CONTENT, NOT THE FUNDAMENTALS (QUALITY FLOOR) ===
The anti-oversaturation directive applies ONLY to angle, hook narrative, and creative anchor. It does NOT apply to proven engagement mechanics — those must remain best-in-class regardless of differentiation:
- Posting cadence, optimal time windows, and platform-native format ratios (Reels vs carousels vs static) stay grounded in what currently works on ${platform}.
- Hook structures (3-second pattern interrupt, curiosity gap, stakes-first, contrarian opener), retention curves (loop, payoff, open loop), and CTA placement remain battle-tested.
- Continue to apply proven frameworks: AIDA, PAS (Problem-Agitate-Solve), Hook-Retention-CTA, Hero/Hub/Help content model, and platform-specific best practices. Differentiation happens INSIDE these frameworks, never instead of them.
- Two brands can both use a "3-second pattern interrupt" — what differs is the specific product, pain point, or UVP that anchors it.

=== QUALITY GUARDRAIL (NON-NEGOTIABLE) ===
Differentiation must never come at the cost of proven engagement mechanics. If a "unique" angle is measurably weaker than a conventional one (weaker hook, unclear CTA, format that under-performs on ${platform}, vague claim), choose the conventional execution and differentiate via product specificity, audience pain-point precision, or UVP — NOT via novelty for its own sake. Originality is a tiebreaker, not a substitute for fundamentals.

Use 4-week arc: Week1=Awareness, Week2=Engagement, Week3=Consideration, Week4=Conversion.
Content mix: 30% educational, 25% promotional, 20% engagement, 15% social proof, 10% behind-scenes.

=== STRATEGY TYPE: ${contentMode.toUpperCase()} ===
${contentMode === 'organic' ? `This is an ORGANIC-ONLY strategy. NO paid ad spend is assumed. Every post is a native feed/profile post. Focus on: platform-native formats (Reels, carousels, Stories, native video), organic reach mechanics (SEO captions, saveable content, share-triggering hooks, comment-driving questions), community building, and hashtag strategy. DO NOT include a "recommended_campaign_structure" for paid ads — instead include organic-growth guidance (posting cadence, community engagement protocol, hashtag mix, collaboration/duet/repost opportunities). Set "recommended_campaign_structure" to { "mode": "organic", "growth_levers": [...], "posting_cadence": "...", "engagement_protocol": "...", "hashtag_strategy": "..." }.` : ''}
${contentMode === 'paid' ? `This is a PAID-ADS-ONLY strategy. Every post is a paid ad creative. Focus on: direct-response hooks, scroll-stoppers optimized for cold audiences, clear offer/CTA, creative variants for testing, and campaign structure. You MUST produce a "recommended_campaign_structure" advising which paid ad campaign optimization type to run on ${platform} (CBO, ABO, Advantage+, manual, Performance Max, etc.), grounded in (1) their business profile + goals AND (2) the live platform intelligence above about what's currently driving the best ROAS / profit margins in their niche. The audience_approach field MUST reflect the exact demographics above (age ${ctx.ageRange || 'n/a'}, ${ctx.genderSplit || 'n/a'}, ${ctx.incomeLevel || 'n/a'}, ${ctx.geoFocus || 'n/a'}), not a generic niche audience.` : ''}
${contentMode === 'hybrid' ? `This is a HYBRID strategy blending ORGANIC and PAID. Roughly 60% organic feed posts (community, education, social proof) and 40% paid-ad creatives designed to amplify winning organic angles. Each post should have a "distribution" field set to "organic" or "paid" — organic posts optimize for shares/saves/comments, paid posts optimize for CTR/CPA. You MUST produce a "recommended_campaign_structure" for the paid portion (CBO/ABO/Advantage+/manual, etc.), grounded in the live platform intelligence above. The audience_approach field MUST reflect the exact demographics above (age ${ctx.ageRange || 'n/a'}, ${ctx.genderSplit || 'n/a'}, ${ctx.incomeLevel || 'n/a'}, ${ctx.geoFocus || 'n/a'}), not a generic niche audience.` : ''}

Return ONLY valid JSON (no markdown):
{
  "strategy_overview": {
    "title": "string",
    "platform": "${platform}",
    "duration_days": ${durationDays},
    "start_date": "${startDate.toISOString().split('T')[0]}",
    "end_date": "${endDate.toISOString().split('T')[0]}",
    "total_posts": ${durationDays},
    "strategic_approach": {"core_strategy":"string","key_differentiator":"string explicitly referencing this business's UVP/competitive advantage, not the niche","competitive_edge":"string explicitly contrasting with named competitors"},
    "goals": ${JSON.stringify(goals)},
    "content_mix": {"educational":30,"promotional":25,"engagement":20,"social_proof":15,"behind_scenes":10},
    "post_type_distribution": {"carousel":0,"reel":0,"single_image":0,"video":0,"story":0},
    "predicted_metrics": {"total_reach":0,"total_impressions":0,"avg_engagement_rate":0,"expected_follower_growth":0,"expected_follower_growth_percentage":0,"expected_profile_visits":0,"expected_website_clicks":0,"expected_conversions":0},
    "audience_alignment": {"primary_age_band":"${ctx.ageRange || 'unspecified'}","gender_focus":"${ctx.genderSplit || 'unspecified'}","income_tier":"${ctx.incomeLevel || 'unspecified'}","geo":"${ctx.geoFocus || 'unspecified'}","top_pain_points_addressed":["string"],"behavior_tactics":"string describing how content matches the ${ctx.buyingBehavior || 'stated'} buying behavior"},
    "differentiation_plan": {"vs_competitors":"string naming how this strategy avoids what ${ctx.competitors || 'competitors'} are doing","product_specific_angles":["string anchored to actual products: ${ctx.products || 'unspecified'}"],"avoid_generic_niche_tropes":["string listing common ${ctx.industry} cliches this strategy will NOT use"]},
    "key_tactics": ["string"],
    "success_milestones": {"week_1":"string","week_2":"string","week_3":"string","week_4":"string"},
    "risk_assessment": {"potential_challenges":["string"],"mitigation_strategies":["string"],"pivot_triggers":["string"]},
    "implementation_guide": {"posting_schedule":"string","content_creation_timeline":"string","engagement_protocol":"string","monitoring_schedule":"string","adjustment_criteria":"string"},
    "recommended_campaign_structure": {
      "structure_type": "CBO | ABO | Advantage+ | Manual | Hybrid",
      "rationale": "2-3 sentence explanation tying business profile + niche performance signals to this choice",
      "budget_split": {"prospecting": 70, "retargeting": 30},
      "audience_approach": "string — MUST reference exact demographics (age ${ctx.ageRange}, ${ctx.genderSplit}, ${ctx.incomeLevel}, ${ctx.geoFocus}), interest stacks, and exclusions to avoid bidding against direct competitors",
      "creative_volume": "string (e.g. '3-5 creatives per ad set, refresh every 7 days')",
      "why_this_works_in_your_niche": "string citing the current niche performance trend",
      "roas_trend_signal": "string (e.g. 'CBO outperforming ABO by 18% in ${ctx.industry} this quarter')",
      "alternative_to_test": "string describing a secondary structure to A/B test against",
      "first_30_day_action_plan": "string (e.g. 'Launch 1 CBO with 3 ad sets...')"
    }
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

function buildBatchPostsPrompt(ctx: BusinessCtx, platform: string, startDay: number, endDay: number, weeklyThemes: any[], startDate: string, performanceFeedbackSection: string, promotionsSection: string): string {
  const postDates: string[] = [];
  const base = new Date(startDate);
  for (let d = startDay; d <= endDay; d++) {
    const date = new Date(base);
    date.setDate(date.getDate() + d - 1);
    postDates.push(date.toISOString().split('T')[0]);
  }

  return `Generate posts ${startDay}-${endDay} for ${ctx.businessName}'s ${platform} strategy.
Business: ${ctx.industry} ${ctx.businessType}. Voice: ${ctx.brandVoice}.

=== AUDIENCE (write FOR these specific people, not the generic niche) ===
${ctx.ageRange ? `Age: ${ctx.ageRange}. ` : ''}${ctx.genderSplit ? `${ctx.genderSplit}. ` : ''}${ctx.incomeLevel ? `Income: ${ctx.incomeLevel}. ` : ''}${ctx.geoFocus ? `Geo: ${ctx.geoFocus}. ` : ''}${ctx.buyingBehavior ? `Buying behavior: ${ctx.buyingBehavior}. ` : ''}
${ctx.painPoints ? `Pain points to address: ${ctx.painPoints}` : ''}

=== THIS BUSINESS'S PRODUCTS & DIFFERENTIATION (anchor every post to these) ===
${ctx.products ? `Products: ${ctx.products}` : ''}
${ctx.uvp ? `UVP: ${ctx.uvp}` : ''}
${ctx.competitiveAdvantage ? `Competitive advantage: ${ctx.competitiveAdvantage}` : ''}
${ctx.competitors ? `Differentiate AGAINST: ${ctx.competitors}` : ''}
${ctx.contentRestrictions ? `Restrictions: ${ctx.contentRestrictions}` : ''}

Weekly themes: ${JSON.stringify(weeklyThemes.map(w => ({ week: w.week, theme: w.theme, objective: w.objective })))}

${performanceFeedbackSection}

${promotionsSection}

CRITICAL: Every hook, body, and CTA must be traceable to either (a) one of this business's specific products, (b) its UVP/competitive advantage, (c) a stated audience pain point or demographic detail, or (d) an active promotion listed above when the post date falls within a promo window. Reject generic ${ctx.industry} content that could be reused by a competitor unchanged.

QUALITY FLOOR (apply to every post — these are non-negotiable, differentiation does NOT override them):
- Use proven hook structures (3-second pattern interrupt, curiosity gap, stakes-first, contrarian, bold statement) and proven frameworks (AIDA, PAS, Hook-Retention-CTA). Differentiate the substance INSIDE the framework, never the framework itself.
- Hook must scroll-stop in <3 seconds. Single clear CTA. Platform-native format (${platform} best practices). Specific claims, no vague filler.
- If a "unique" angle would weaken the hook, retention, or CTA versus a conventional one, use the conventional execution and differentiate via product specificity, pain-point precision, or UVP instead. Originality is a tiebreaker, not a substitute for engagement mechanics.
- The differentiation_anchor must reference a REAL input (actual product, stated UVP, stated competitive advantage, stated pain point, or specific demographic detail) — never an invented angle.

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
  "strategic_rationale": {"why_this_day":"string","arc_positioning":"string","builds_toward":"string","success_metrics":"string","differentiation_anchor":"string naming WHICH product/UVP/pain-point this post is anchored to"},
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
    throw new Error(`AI service error ${response.status}: ${errorText.slice(0, 300)}`);
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

// ============ DETERMINISTIC FALLBACK GENERATOR ============
// Runs when AI generation fails so users NEVER get an empty strategy.
// Ported from generate-comprehensive-campaign-strategy for reliability.
function buildFallbackOverview(ctx: BusinessCtx, platform: string, durationDays: number, goals: string[]): any {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  const week4Count = Math.max(durationDays - 21, 7);
  return {
    strategy_overview: {
      title: `${ctx.businessName} ${durationDays}-Day ${platform} Strategy`,
      platform,
      duration_days: durationDays,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      total_posts: durationDays,
      strategic_approach: {
        core_strategy: `Structured 4-phase content arc tailored to ${ctx.businessName} in ${ctx.industry}`,
        key_differentiator: ctx.uvp || ctx.competitiveAdvantage || 'Personalized business context and audience alignment',
        competitive_edge: ctx.competitors ? `Positioned differently from ${ctx.competitors}` : 'Anchored to your specific products and audience',
      },
      goals,
      content_mix: { educational: 30, promotional: 25, engagement: 20, social_proof: 15, behind_scenes: 10 },
      post_type_distribution: { carousel: 30, reel: 30, single_image: 20, video: 15, story: 5 },
      predicted_metrics: {
        total_reach: durationDays * 800,
        total_impressions: durationDays * 1500,
        avg_engagement_rate: 3.5,
        expected_follower_growth: Math.floor(durationDays * 15),
        expected_follower_growth_percentage: 5,
        expected_profile_visits: durationDays * 40,
        expected_website_clicks: durationDays * 12,
        expected_conversions: Math.floor(durationDays * 1.2),
      },
      audience_alignment: {
        primary_age_band: ctx.ageRange || 'unspecified',
        gender_focus: ctx.genderSplit || 'unspecified',
        income_tier: ctx.incomeLevel || 'unspecified',
        geo: ctx.geoFocus || 'unspecified',
        top_pain_points_addressed: ctx.painPoints ? [ctx.painPoints] : ['General audience pain points'],
        behavior_tactics: `Content tuned for ${ctx.buyingBehavior || 'general audience'} buying behavior`,
      },
      differentiation_plan: {
        vs_competitors: ctx.competitors ? `Avoid the tactics used by ${ctx.competitors}` : 'Anchor content to your specific products',
        product_specific_angles: [ctx.products || 'Your core offering'],
        avoid_generic_niche_tropes: [`Generic ${ctx.industry} advice`, 'Vague motivational content'],
      },
      key_tactics: [
        'Post consistently at optimal time windows',
        'Use proven hook structures (pattern interrupt, curiosity gap)',
        'Respond to comments within the first hour',
        'Weekly A/B testing of hooks and CTAs',
      ],
      success_milestones: {
        week_1: 'Establish brand awareness baseline',
        week_2: 'Drive first meaningful engagement lifts',
        week_3: 'Build trust via social proof and case studies',
        week_4: 'Convert warm audience with clear offers',
      },
      risk_assessment: {
        potential_challenges: ['Algorithm variance', 'Content fatigue', 'Competing niche noise'],
        mitigation_strategies: ['Vary post formats', 'Rotate hook styles', 'Monitor weekly performance'],
        pivot_triggers: ['Engagement drop >20% for 3+ days', 'Zero conversions after week 2'],
      },
      implementation_guide: {
        posting_schedule: `${durationDays} posts across ${Math.ceil(durationDays / 7)} weeks`,
        content_creation_timeline: 'Batch produce 3-5 days at a time',
        engagement_protocol: 'Reply to all comments within 1 hour',
        monitoring_schedule: 'Daily performance check, weekly deep review',
        adjustment_criteria: 'Adjust hooks/CTAs if engagement drops below baseline',
      },
      recommended_campaign_structure: {
        structure_type: 'Advantage+',
        rationale: `Advantage+ / auto-optimized campaigns are currently outperforming manual setups on ${platform} across most niches. Start here, layer in manual ABO for retargeting once you have data.`,
        budget_split: { prospecting: 70, retargeting: 30 },
        audience_approach: `Broad targeting aligned to ${ctx.ageRange || 'core age band'}, ${ctx.geoFocus || 'core geography'}. Exclude existing customers and warm audiences from prospecting.`,
        creative_volume: '3-5 creatives per ad set, refresh every 7 days',
        why_this_works_in_your_niche: `Advantage+/auto-optimization compounds fastest when creative volume is fresh and the audience signal is broad`,
        roas_trend_signal: 'Auto-optimized structures currently outperforming manual ABO in most niches this quarter',
        alternative_to_test: 'Manual ABO with tight interest stacks — test after 14 days of Advantage+ data',
        first_30_day_action_plan: 'Launch 1 Advantage+ campaign with 3 creative variants. Refresh creative weekly. Layer retargeting after day 14.',
      },
    },
    weekly_breakdown: [
      { week: 1, theme: 'Awareness & Introduction', objective: 'Build brand recognition', post_count: 7, key_messages: ['Who we are', 'What makes us different', 'Our story'], expected_metrics: { reach: 5000, engagement_rate: 3.0, follower_growth: 50 }, focus_areas: ['brand introduction', 'value proposition'] },
      { week: 2, theme: 'Engagement & Community', objective: 'Spark conversations', post_count: 7, key_messages: ['Join the conversation', 'Your voice matters'], expected_metrics: { reach: 6500, engagement_rate: 4.0, follower_growth: 80 }, focus_areas: ['polls', 'questions', 'UGC'] },
      { week: 3, theme: 'Consideration & Trust', objective: 'Build credibility', post_count: 7, key_messages: ['Real results', 'How it works'], expected_metrics: { reach: 7500, engagement_rate: 4.2, follower_growth: 100 }, focus_areas: ['testimonials', 'case studies'] },
      { week: 4, theme: 'Conversion & Action', objective: 'Drive conversions', post_count: week4Count, key_messages: ['Take action', 'Limited time'], expected_metrics: { reach: 8000, engagement_rate: 4.5, follower_growth: 120 }, focus_areas: ['offers', 'CTAs', 'urgency'] },
    ],
  };
}

function buildFallbackPosts(ctx: BusinessCtx, platform: string, durationDays: number, startDateStr: string): any[] {
  const postTypes = ['carousel', 'reel', 'single_image', 'video', 'story'];
  const categories: Array<'educational' | 'promotional' | 'engagement' | 'social_proof' | 'behind_scenes'> = ['educational', 'promotional', 'engagement', 'social_proof', 'behind_scenes'];
  const times = ['09:00', '12:00', '15:00', '18:00', '20:00'];
  const themes = [
    { week: 1, name: 'Awareness & Introduction' },
    { week: 2, name: 'Engagement & Community' },
    { week: 3, name: 'Consideration & Trust' },
    { week: 4, name: 'Conversion & Action' },
  ];

  const anchor = ctx.products || ctx.uvp || `${ctx.businessName}'s core offering`;
  const audience = ctx.ageRange || ctx.painPoints || 'your ideal customer';

  const hookTemplates = [
    (i: number) => `3 things about ${ctx.industry} nobody talks about`,
    (i: number) => `Stop doing this if you want ${ctx.industry} results`,
    (i: number) => `The truth about ${anchor.split(',')[0] || ctx.industry}`,
    (i: number) => `Why ${audience} keeps missing this`,
    (i: number) => `We tested this so you don't have to`,
    (i: number) => `Real talk: ${ctx.industry} edition`,
    (i: number) => `${i + 1} ways ${ctx.businessName} does it differently`,
  ];

  const posts: any[] = [];
  const base = new Date(startDateStr);

  for (let day = 1; day <= durationDays; day++) {
    const date = new Date(base);
    date.setDate(date.getDate() + day - 1);
    const week = Math.min(Math.ceil(day / 7), 4);
    const theme = themes[week - 1];
    const category = categories[day % categories.length];
    const postType = postTypes[day % postTypes.length];
    const hook = hookTemplates[day % hookTemplates.length](day);

    const body = `At ${ctx.businessName}, we know that ${audience} deals with ${ctx.painPoints || 'real challenges'} every day. Here is what actually works — grounded in ${ctx.uvp || 'what we have built'}, not generic advice. ${ctx.competitiveAdvantage ? `Our edge: ${ctx.competitiveAdvantage}.` : ''}`;
    const cta = category === 'promotional' ? 'Tap the link in bio to get started.' : category === 'engagement' ? 'Drop your answer in the comments 👇' : 'Save this post for later.';

    posts.push({
      day_number: day,
      post_date: date.toISOString().split('T')[0],
      post_time: times[day % times.length],
      week_number: week,
      week_theme: theme.name,
      content_details: { post_type: postType, content_category: category, specific_theme: theme.name, primary_emotion: 'curiosity', content_pillar: category },
      copy_elements: {
        hook: { text: hook, technique: 'curiosity_gap', psychological_principle: 'information gap' },
        opening: `Most ${ctx.industry} advice misses the point.`,
        body,
        cta: { text: cta, type: category === 'promotional' ? 'buy' : category === 'engagement' ? 'comment' : 'save', strength: 'medium' },
        full_caption: `${hook}\n\nMost ${ctx.industry} advice misses the point.\n\n${body}\n\n${cta}`,
      },
      hashtag_strategy: {
        hashtags: [`#${ctx.industry.replace(/\s+/g, '')}`, `#${platform}`, '#marketing', '#business', '#growth'],
        mix_breakdown: { high_volume: ['#marketing', '#business'], medium_volume: [`#${ctx.industry.replace(/\s+/g, '')}`], niche: [`#${platform}`], branded: [`#${ctx.businessName.replace(/\s+/g, '')}`] },
      },
      visual_guidance: { visual_type: postType, description: `High-quality ${postType} showcasing ${anchor}`, color_palette: 'brand colors', text_overlay: hook, attention_hook: 'bold text overlay in first frame' },
      performance_prediction: { predicted_reach: 800, predicted_impressions: 1500, predicted_engagement_rate: 3.5, predicted_likes: 45, predicted_comments: 8, predicted_shares: 4, predicted_saves: 6, confidence_level: 'Medium', prediction_basis: 'Fallback baseline — refine after real performance data uploaded' },
      strategic_rationale: { why_this_day: `Aligns with week ${week} theme: ${theme.name}`, arc_positioning: `${theme.name} phase`, builds_toward: week < 4 ? 'trust and consideration' : 'conversion', success_metrics: 'engagement rate above baseline', differentiation_anchor: anchor },
      optimization_tips: { engagement_boosters: ['Post at optimal window', 'Reply to comments in first hour'], a_b_test_ideas: ['Test alternate hook', 'Test soft vs hard CTA'], potential_issues: ['Algorithm reach variance'], risk_mitigation: ['Repost as story if underperforming'] },
    });
  }
  return posts;
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

    const supabase = serviceClient();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { platform, durationDays = 30, goals, customInstructions, conversationId, workspace_id: bodyWorkspaceId } = await req.json() as StrategyRequest;
    const effectiveGoals = goals?.length ? goals : ['Increase engagement', 'Grow followers', 'Drive conversions'];

    // Server-side enforcement of Starter plan lifetime cap (2 strategies).
    // Subscribed users (Pro/Agency) are unlimited; only check non-subscribed users.
    const { data: localSub } = await supabase
      .from('subscriptions')
      .select('status, plan_type')
      .eq('user_id', user.id)
      .maybeSingle();
    const isPaid = localSub?.status === 'active' && (localSub.plan_type === 'pro' || localSub.plan_type === 'agency');
    const FOUNDER_EMAILS = new Set(['chrissnyder3456@gmail.com']);
    const isFounder = !!user.email && FOUNDER_EMAILS.has(user.email.toLowerCase());
    if (!isPaid && !isFounder) {
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
          JSON.stringify({ error: "You've used both of your Starter strategies. Upgrade to Pro or Agency to keep generating unlimited strategies.", code: 'UPGRADE_REQUIRED' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Generating ${durationDays}-day strategy for ${platform} for user ${user.id}`);

    // Compute strategy date range
    const stratStart = new Date();
    const stratEnd = new Date();
    stratEnd.setDate(stratEnd.getDate() + durationDays);
    const stratStartISO = stratStart.toISOString().split('T')[0];
    const stratEndISO = stratEnd.toISOString().split('T')[0];

    // Parallel fetch all context (includes active promotions overlapping the strategy window)
    const [businessRes, analyticsRes, settingsRes, businessInfoRes, promosRes] = await Promise.all([
      supabase.from('business_context').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
      supabase.from('uploaded_analytics').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false }).limit(3),
      supabase.from('user_business_settings').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('business_information').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('business_promotions').select('*').eq('user_id', user.id).eq('is_active', true)
        .lte('start_date', stratEndISO).gte('end_date', stratStartISO)
        .order('priority', { ascending: false }).order('start_date', { ascending: true }),
    ]);

    const ctx = getBusinessContext(businessRes.data, settingsRes.data, businessInfoRes.data);
    const recentAnalytics = analyticsRes.data || [];
    const activePromos = promosRes.data || [];

    // Build promotions section — filter by platform if specified
    const normalizedReqPlatform = normalizePlatformForIntel(platform);
    const relevantPromos = activePromos.filter((p: any) => {
      const platforms = Array.isArray(p.platforms) ? p.platforms : [];
      if (platforms.length === 0) return true; // no platform restriction = applies to all
      return platforms.some((pl: string) => normalizePlatformForIntel(pl) === normalizedReqPlatform || pl.toLowerCase() === platform.toLowerCase());
    });

    let promotionsSection = '';
    if (relevantPromos.length > 0) {
      const lines = ['=== ACTIVE PROMOTIONS / SALES / DISCOUNTS (PLAN POSTS AROUND THESE — NON-NEGOTIABLE) ==='];
      for (const p of relevantPromos) {
        const codeStr = p.promo_code ? ` | Code: ${p.promo_code}` : '';
        const valStr = p.discount_value ? ` | Value: ${p.discount_value}` : '';
        const targetStr = p.target_products ? ` | Target: ${p.target_products}` : '';
        const urlStr = p.cta_url ? ` | URL: ${p.cta_url}` : '';
        const notesStr = p.notes ? ` | Notes: ${p.notes}` : '';
        lines.push(`- "${p.name}" [${p.promo_type}, priority=${p.priority}] ${p.start_date} → ${p.end_date}: ${p.offer_details}${valStr}${codeStr}${targetStr}${urlStr}${notesStr}`);
      }
      lines.push('');
      lines.push('PROMOTION INTEGRATION RULES:');
      lines.push('1. Allocate posts directly within each promo\'s active date range — teaser before, launch day, mid-promo urgency, last-chance/closing-day posts.');
      lines.push('2. High-priority promos get heavier post share; weave the offer into the promotional content bucket (the 25% promotional mix) rather than displacing educational/engagement content entirely.');
      lines.push('3. Include the promo code verbatim in CTAs when provided. Match the offer language and target audience exactly — do not generalize "20% off" to "great discount."');
      lines.push('4. For limited-time/flash promos, use urgency tactics (countdowns, scarcity, deadline reminders). For seasonal/launch promos, build anticipation arcs.');
      lines.push('5. Never schedule a promo post outside its date range. Never promote an expired offer.');
      promotionsSection = lines.join('\n');
    }


    // Build analytics section
    let analyticsSection = '';
    if (recentAnalytics.length > 0) {
      const latest = recentAnalytics[0]?.extracted_data || recentAnalytics[0]?.metrics || {};
      analyticsSection = `Analytics: Engagement ${latest.engagement_rate || 3.5}%, Followers ${latest.followers || 1000}, Best content: ${latest.best_content_type || 'carousel'}`;
    }

    const systemPrompt = 'You are a world-class content strategist. Generate detailed, actionable content strategies. Always respond with valid JSON only, no markdown formatting or code blocks.';

    // Fetch matching campaign intelligence signals for platform+niche
    const niche = (ctx.industry || 'general').toLowerCase().trim();
    const { data: intelSignals } = await supabase
      .from('campaign_intelligence_signals')
      .select('*')
      .eq('platform', normalizePlatformForIntel(platform))
      .in('niche', [niche, 'general'])
      .order('refreshed_at', { ascending: false })
      .limit(2);

    let intelligenceSection = '';
    if (intelSignals && intelSignals.length > 0) {
      const lines = intelSignals.map((s: any) => 
        `- ${s.platform.toUpperCase()} / ${s.niche}: ${s.recommended_structure} currently outperforming. Confidence ${s.confidence_score}/10. ROAS trend: ${s.roas_trend || 'n/a'}. Profit-margin trend: ${s.profit_margin_trend || 'n/a'}. Rationale: ${s.rationale || ''}. Audience: ${s.audience_approach || ''}. Creative: ${s.creative_volume || ''}. Alt to test: ${s.alternative_to_test || ''}.`
      );
      intelligenceSection = `Live Platform Intelligence (refreshed ${new Date(intelSignals[0].refreshed_at).toISOString().split('T')[0]}):\n${lines.join('\n')}\n\nUse this intelligence to ground the recommended_campaign_structure section in current platform reality, not generic best practices.`;
    } else {
      intelligenceSection = `Live Platform Intelligence: No fresh niche-specific signals available; recommend based on general best practices for ${platform} in ${ctx.industry}.`;
    }

    // ========== INSIGHTS FEEDBACK LOOP ==========
    // Pull the user's actual historical performance and feed proven learnings back into prompts.
    const normalizedPlatform = normalizePlatformForIntel(platform);
    const [topPostsRes, contentPatternsRes, optimalSlotsRes, baselineRes, topHashtagsRes] = await Promise.all([
      supabase.rpc('get_top_performing_posts', { p_user_id: user.id, p_platform: normalizedPlatform, p_limit: 5 }),
      supabase.from('content_performance_patterns').select('pattern_type,pattern_value,avg_engagement_rate,post_count').eq('user_id', user.id).order('performance_score', { ascending: false }).limit(20),
      supabase.rpc('get_optimal_time_slots', { p_user_id: user.id, p_platform: normalizedPlatform, p_limit: 5 }),
      supabase.rpc('get_user_baseline_metrics', { p_user_id: user.id, p_platform: normalizedPlatform }),
      supabase.rpc('get_top_performing_elements', { p_user_id: user.id, p_element_type: 'hashtags', p_limit: 8 }),
    ]);

    const topPosts = topPostsRes.data || [];
    const patterns = contentPatternsRes.data || [];
    const slots = optimalSlotsRes.data || [];
    const baseline = (baselineRes.data && baselineRes.data[0]) || null;
    const topHashtags = topHashtagsRes.data || [];

    let performanceFeedbackSection = '';
    if (topPosts.length > 0 || patterns.length > 0 || slots.length > 0 || baseline) {
      const lines: string[] = ['=== PROVEN PERFORMANCE LEARNINGS (FROM THIS USER\'S ACTUAL HISTORY — APPLY, DO NOT IGNORE) ==='];

      if (baseline) {
        lines.push(`- Baseline (last 90 days, ${normalizedPlatform}): avg engagement rate ${Number(baseline.avg_engagement_rate || 0).toFixed(2)}%, avg impressions ${baseline.avg_impressions || 0}, posts analyzed ${baseline.total_posts || 0}. New strategy must AT MINIMUM match this baseline; aim to exceed by 15-25%.`);
      }

      // Group patterns by type and show the best value per type
      const bestByType: Record<string, any> = {};
      for (const p of patterns) {
        const t = p.pattern_type;
        if (!bestByType[t] || (p.avg_engagement_rate || 0) > (bestByType[t].avg_engagement_rate || 0)) {
          bestByType[t] = p;
        }
      }
      const typeLabels: Record<string, string> = {
        content_type: 'Best-performing content type',
        content_length: 'Best-performing content length',
        posting_time: 'Best-performing posting window',
        has_question: 'Question-style posts',
      };
      for (const [t, p] of Object.entries(bestByType)) {
        const label = typeLabels[t] || t;
        lines.push(`- ${label}: "${p.pattern_value}" — ${Number(p.avg_engagement_rate || 0).toFixed(2)}% avg engagement across ${p.post_count} posts. Lean into this in the content mix and post-type distribution.`);
      }

      if (slots.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const slotLines = slots.slice(0, 5).map((s: any) => `${dayNames[s.day_of_week]} ${s.hour_of_day}:00 (${Number(s.avg_engagement_rate || 0).toFixed(2)}%, confidence ${s.confidence})`).join('; ');
        lines.push(`- Proven optimal posting times for this audience: ${slotLines}. Schedule posts on these days/hours wherever the weekly arc allows.`);
      }

      if (topHashtags.length > 0) {
        const tagLines = topHashtags.slice(0, 6).map((h: any) => `${h.element} (${Number(h.avg_engagement || 0).toFixed(2)}%, used ${h.usage_count}x)`).join(', ');
        lines.push(`- Top-performing hashtags from past posts: ${tagLines}. Prioritize these in the hashtag strategy where topically relevant; do not invent random tags when proven ones exist.`);
      }

      if (topPosts.length > 0) {
        const previews = topPosts.slice(0, 3).map((p: any, i: number) => {
          const preview = (p.content || '').replace(/\s+/g, ' ').substring(0, 140);
          return `  ${i + 1}. [${Number(p.engagement_rate || 0).toFixed(2)}% eng, ${p.total_engagement || 0} total] "${preview}${(p.content || '').length > 140 ? '…' : ''}"`;
        }).join('\n');
        lines.push(`- Top 3 highest-engagement past posts (study hook patterns, length, and tone — then apply, don't copy):\n${previews}`);
      }

      lines.push('');
      lines.push('FEEDBACK-LOOP RULES:');
      lines.push('1. Every recommendation above is empirically validated by THIS user\'s audience. Treat it as a higher-confidence signal than generic best practices.');
      lines.push('2. If you deviate from a proven learning (e.g. recommend a content type not in their top performers), you MUST justify why in the strategic_rationale — typically because it serves a goal the historical data doesn\'t yet cover (e.g. new product launch, new audience segment).');
      lines.push('3. Predicted metrics for new posts must be calibrated against the baseline above. Predicting 8% engagement when their baseline is 2% without strong justification is unrealistic.');
      lines.push('4. As performance data grows, future strategies will compound on these learnings — do not break the loop by ignoring proven signals.');

      performanceFeedbackSection = lines.join('\n');
    } else {
      performanceFeedbackSection = '=== PROVEN PERFORMANCE LEARNINGS ===\nNo historical performance data for this user yet. Use general best practices for now; future strategies will incorporate their actual results as posts are published and analytics uploaded.';
    }

    // ========== STEP 1: Generate strategy overview ==========
    console.log('Step 1: Generating strategy overview...');
    const overviewPrompt = buildOverviewPrompt(ctx, platform, durationDays, effectiveGoals, analyticsSection, intelligenceSection, performanceFeedbackSection, promotionsSection, customInstructions);
    const overviewText = await callAI(LOVABLE_API_KEY, overviewPrompt, systemPrompt, 8000);
    
    let overviewData: any;
    let overviewUsedFallback = false;
    try {
      overviewData = parseJSONSafe(overviewText);
    } catch (e) {
      console.error('Overview parse failed — using deterministic fallback:', e, 'Text:', overviewText.substring(0, 500));
      overviewData = buildFallbackOverview(ctx, platform, durationDays, effectiveGoals);
      overviewUsedFallback = true;
    }

    const overview = overviewData.strategy_overview;
    const weeklyBreakdown = overviewData.weekly_breakdown || [];
    console.log(overviewUsedFallback ? 'Overview: deterministic fallback' : 'Overview generated successfully');

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

      const batchPrompt = buildBatchPostsPrompt(ctx, platform, startDay, endDay, weeklyBreakdown, startDateStr, performanceFeedbackSection, promotionsSection);
      
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
              JSON.stringify({ error: 'Workspace AI credits are depleted. Add credits in Lovable → Settings → Plans & credits, then retry.', code: 'AI_CREDITS_DEPLETED' }),
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
      console.warn('AI produced zero posts across all batches — using deterministic fallback');
      const fallbackPosts = buildFallbackPosts(ctx, platform, durationDays, startDateStr);
      allPosts.push(...fallbackPosts);
    } else if (allPosts.length < durationDays) {
      console.warn(`AI produced only ${allPosts.length}/${durationDays} posts — filling remainder from deterministic fallback`);
      const covered = new Set(allPosts.map((p: any) => p.day_number).filter(Boolean));
      const filler = buildFallbackPosts(ctx, platform, durationDays, startDateStr).filter((p: any) => !covered.has(p.day_number));
      allPosts.push(...filler);
    }

    console.log(`Total posts generated: ${allPosts.length}`);

    // ========== STEP 3: Save to database ==========
    const validPlatforms = ['instagram', 'facebook', 'tiktok', 'linkedin', 'twitter', 'multi'];
    const dbPlatform = validPlatforms.includes(platform) ? platform : 'multi';
    const predictedMetrics = overview.predicted_metrics || {};

    // Resolve workspace_id: body override -> user_profiles.active_workspace_id
    let workspaceId = bodyWorkspaceId ?? null;
    if (!workspaceId) {
      const { data: prof } = await supabase
        .from('user_profiles')
        .select('active_workspace_id')
        .eq('user_id', user.id)
        .maybeSingle();
      workspaceId = (prof as any)?.active_workspace_id ?? null;
    }

    const { data: savedStrategy, error: strategyError } = await supabase
      .from('content_strategies')
      .insert({
        user_id: user.id,
        workspace_id: workspaceId,
        title: overview.title,
        platform: dbPlatform,
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
        recommended_campaign_structure: overview.recommended_campaign_structure || null,
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
