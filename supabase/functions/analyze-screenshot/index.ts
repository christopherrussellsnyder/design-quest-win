import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const JSON_SCHEMA = `{
  "metadata": {
    "platform": "",
    "platform_confidence": "High/Medium/Low",
    "interface_type": "Native mobile app/Desktop web/Third-party analytics tool",
    "screen_type": "Profile analytics/Post insights/Ad performance/Audience demographics/Content performance",
    "time_period": { "start_date": "", "end_date": "", "duration": "", "granularity": "Hourly/Daily/Weekly/Monthly" },
    "comparison_period": null,
    "analysis_timestamp": "",
    "data_completeness": "Complete/Substantial/Partial/Limited",
    "data_completeness_explanation": ""
  },
  "extracted_metrics": {
    "account_metrics": { "followers": null, "followers_change": null, "followers_change_percent": null, "following": null, "posts_count": null, "posts_count_change": null },
    "engagement_metrics": { "total_likes": null, "total_likes_change": null, "total_comments": null, "total_comments_change": null, "total_shares": null, "total_shares_change": null, "total_saves": null, "total_saves_change": null, "engagement_rate": null, "engagement_rate_change": null, "avg_engagement_per_post": null },
    "reach_metrics": { "reach": null, "reach_change": null, "reach_change_percent": null, "impressions": null, "impressions_change": null, "impressions_change_percent": null, "frequency": null, "viral_reach": null, "organic_reach": null, "paid_reach": null },
    "traffic_metrics": { "profile_visits": null, "profile_visits_change": null, "link_clicks": null, "link_clicks_change": null, "website_clicks": null, "email_clicks": null, "direction_clicks": null, "conversions": null, "conversion_rate": null },
    "audience_metrics": { "top_locations": [], "age_distribution": [], "gender_distribution": null, "active_times": [], "new_vs_returning": null, "audience_growth_rate": null },
    "content_performance": { "top_posts": [], "best_content_type": null, "best_content_engagement_rate": null, "avg_post_reach": null, "avg_post_engagement": null, "worst_content_type": null },
    "video_metrics": { "total_views": null, "avg_watch_time": null, "completion_rate": null, "reel_plays": null, "reel_engagement_rate": null, "story_views": null, "story_interactions": null, "story_completion_rate": null },
    "ad_metrics": { "spend": null, "spend_change": null, "cpm": null, "cpc": null, "ctr": null, "roas": null, "cost_per_conversion": null, "ad_frequency": null },
    "additional_metrics": []
  },
  "trend_analysis": {
    "positive_trends": [{ "metric": "", "current_value": null, "previous_value": null, "absolute_change": null, "percentage_change": null, "trend_direction": "up", "trend_velocity": "", "trend_quality": "Positive", "significance": "" }],
    "negative_trends": [],
    "stable_metrics": [],
    "volatile_metrics": [],
    "overall_health_score": 7,
    "growth_momentum": "Accelerating/Steady/Slowing/Declining"
  },
  "benchmark_comparison": {
    "engagement_rate_analysis": { "user_rate": null, "industry_benchmark": null, "performance_vs_benchmark": "", "percentile_rank": "", "verdict": "" },
    "reach_rate_analysis": { "user_reach_rate": null, "typical_range": "" },
    "posting_frequency_analysis": { "detected_frequency": "", "recommended_frequency": "", "assessment": "" },
    "overall_performance_rating": "",
    "percentile_estimate": ""
  },
  "pattern_recognition": {
    "content_patterns": [],
    "audience_patterns": [],
    "timing_patterns": [],
    "anomalies_detected": [],
    "correlations_found": []
  },
  "insights": [],
  "recommendations": [],
  "opportunities": [],
  "risks": [],
  "follow_up_questions": [],
  "summary": { "one_sentence_summary": "", "top_3_strengths": [], "top_3_areas_for_improvement": [], "immediate_action_required": false, "immediate_action_reason": "" },
  "behavioral_intelligence": {
    "content_type_preferences": {},
    "topic_preferences": {},
    "engagement_type_distribution": {},
    "completion_rates": {},
    "rewatch_patterns": {},
    "time_preferences": {},
    "audience_segments": {},
    "hook_effectiveness": {},
    "cta_response_rates": {},
    "data_quality_score": 0.0,
    "posts_analyzed_count": 0
  }
}`;

const IMAGE_ANALYSIS_PROMPT = `You are an expert data analyst with behavioral pattern extraction capabilities.

TASK: Analyze this analytics screenshot/document with comprehensive depth AND extract user behavior patterns.

═══════════════════════════════════════════════════════════════
COMPREHENSIVE 10-STEP ANALYSIS + BEHAVIORAL EXTRACTION
═══════════════════════════════════════════════════════════════

STEPS 1-10: [Standard comprehensive analysis]
1. Platform Identification (platform, confidence, interface type, screen type)
2. Time Period Extraction
3. Comprehensive Metrics Extraction (all visible numbers)
4. Trend Analysis with velocity and significance
5. Performance Benchmarking vs industry standards
6. Pattern Recognition (content, audience, timing, anomalies, correlations)
7. Strategic Insights (5-7, data-backed, categorized)
8. Actionable Recommendations (5-7, prioritized with P0-P3)
9. Opportunity & Risk Identification
10. Intelligent Follow-Up Questions

STEP 11: BEHAVIORAL INTELLIGENCE EXTRACTION (NEW)
From the analytics data, extract these behavioral signals:

A) Content Type Performance: Calculate preference scores for each content type visible.
   If carousel 5.1% and image 1.6%, normalize: {carousel: 0.76, image: 0.24}
   
B) Topic/Theme Performance: If performance by topic visible, normalize engagement rates.
   
C) Engagement Type Distribution: Calculate ratios from breakdown (likes/comments/shares/saves).
   High saves_ratio = audience values reference content.
   High shares_ratio = viral/shareable content.
   
D) Completion Rates: If video/reel watch time visible, calculate avg_watch_time ÷ duration.
   
E) Rewatch Patterns: If repeat views visible, calculate rewatch_rate.
   
F) Time Patterns: Identify peak performance windows from time-based data.
   
G) Audience Segments: Identify most engaged demographics.
   
H) Hook Effectiveness: If first-frame/3-second retention visible, categorize by hook type.
   
I) CTA Response Rates: Calculate effectiveness of different CTAs.

For each signal: Use 0.0-1.0 scale. If data not visible, use null.
Estimate data_quality_score (0.0-1.0) based on how much behavioral data was extractable.
Count posts_analyzed_count from visible data.

OUTPUT FORMAT - Return ONLY valid JSON (no markdown, no code blocks):
${JSON_SCHEMA}

QUALITY VALIDATION:
✓ All visible metrics extracted
✓ Every trend analyzed with direction and velocity
✓ Behavioral signals extracted where data available
✓ Insights are specific and data-backed
✓ Recommendations are actionable with steps
✓ Use null for metrics not visible`;

const TEXT_DATA_ANALYSIS_PROMPT = `You are an expert data analyst with behavioral pattern extraction capabilities.

TASK: Analyze this marketing analytics data AND extract user behavior patterns.

DATA:
{DATA}

Apply the full 10-step analysis framework plus Step 11 (Behavioral Intelligence Extraction).
Extract content_type_preferences, topic_preferences, engagement_type_distribution, completion_rates, time_preferences, and other behavioral signals from the data.

Return ONLY valid JSON (no markdown) with this structure:
${JSON_SCHEMA}

Focus on actionable intelligence. Use null for fields not derivable.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { imageBase64, userId, screenshotUrl, imageUrl, textData, fileType, fileName, contentType } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('Analyzing file for user:', userId, 'fileType:', fileType || 'image');

    let aiResponse: Response;

    if (textData) {
      const prompt = TEXT_DATA_ANALYSIS_PROMPT.replace('{DATA}', textData.slice(0, 30000));
      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are an expert marketing analytics data analyst with behavioral intelligence capabilities. Return ONLY valid JSON.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 12000,
          temperature: 0.3,
        }),
      });
    } else {
      let base64Data = imageBase64;
      let mimeType = contentType || 'image/png';

      if (!base64Data && imageUrl) {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) throw new Error('Failed to fetch file from storage');
        const imageBuffer = await imageResponse.arrayBuffer();
        base64Data = btoa(new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        mimeType = imageResponse.headers.get('content-type') || 'image/png';
      }

      if (!base64Data) {
        return new Response(JSON.stringify({ error: 'File data is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: IMAGE_ANALYSIS_PROMPT },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } }
            ]
          }],
          max_tokens: 12000,
          temperature: 0.3,
        }),
      });
    }

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (aiResponse.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error('AI analysis failed');
    }

    const aiResult = await aiResponse.json();
    const analysisText = aiResult.choices?.[0]?.message?.content || '';

    let analysisData: any = {};
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) analysisData = JSON.parse(jsonMatch[0]);
      else throw new Error('No JSON found');
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      analysisData = {
        metadata: { platform: fileType === 'csv' || fileType === 'excel' ? 'Spreadsheet Data' : 'Unknown', platform_confidence: 'Low', data_completeness: 'Partial' },
        summary: { one_sentence_summary: analysisText.slice(0, 200) },
        insights: [], recommendations: []
      };
    }

    // Format insights for display
    const formatInsightsForDisplay = (data: any): string => {
      let formatted = `## 📊 Analytics Analysis\n\n`;
      if (data.metadata) {
        formatted += `### Platform: ${data.metadata.platform || 'Unknown'}`;
        if (data.metadata.platform_confidence) formatted += ` (${data.metadata.platform_confidence} confidence)`;
        formatted += '\n';
        if (data.metadata.time_period?.start_date || data.metadata.time_period?.end_date) {
          formatted += `**Period:** ${data.metadata.time_period.start_date || 'N/A'} to ${data.metadata.time_period.end_date || 'N/A'}`;
          if (data.metadata.time_period.duration) formatted += ` (${data.metadata.time_period.duration})`;
          formatted += '\n';
        }
        formatted += '\n';
      }
      if (data.trend_analysis) {
        formatted += `### 📈 Health Score: ${data.trend_analysis.overall_health_score || 'N/A'}/10\n`;
        formatted += `**Growth Momentum:** ${data.trend_analysis.growth_momentum || 'N/A'}\n\n`;
      }
      if (data.benchmark_comparison?.overall_performance_rating) {
        formatted += `### 🏆 Performance Rating: ${data.benchmark_comparison.overall_performance_rating}\n`;
        if (data.benchmark_comparison.percentile_estimate) formatted += `**Percentile:** ${data.benchmark_comparison.percentile_estimate}\n`;
        formatted += '\n';
      }
      if (data.summary) {
        formatted += `### 📝 Summary\n${data.summary.one_sentence_summary || 'No summary'}\n\n`;
        if (data.summary.top_3_strengths?.length) formatted += `**Strengths:**\n${data.summary.top_3_strengths.map((s: string) => `- ✅ ${s}`).join('\n')}\n\n`;
        if (data.summary.top_3_areas_for_improvement?.length) formatted += `**Improvements:**\n${data.summary.top_3_areas_for_improvement.map((s: string) => `- ⚠️ ${s}`).join('\n')}\n\n`;
        if (data.summary.immediate_action_required) formatted += `🚨 **Action Required:** ${data.summary.immediate_action_reason}\n\n`;
      }
      if (data.insights?.length) {
        formatted += `### 💡 Key Insights\n`;
        data.insights.forEach((insight: any, i: number) => {
          const icon = insight.category === 'Strength' ? '💪' : insight.category === 'Warning' ? '⚠️' : insight.category === 'Opportunity' ? '🚀' : '💡';
          formatted += `${i + 1}. ${icon} **[${insight.importance}]** ${insight.insight}\n`;
          if (insight.supporting_data) formatted += `   _Data: ${insight.supporting_data}_\n`;
        });
        formatted += '\n';
      }
      if (data.recommendations?.length) {
        formatted += `### ✅ Recommendations\n`;
        data.recommendations.forEach((rec: any, i: number) => {
          formatted += `${i + 1}. **[${rec.priority}]** ${rec.recommendation}\n`;
          if (rec.expected_impact) formatted += `   Impact: ${rec.expected_impact} | Effort: ${rec.effort_required || 'N/A'}\n`;
        });
        formatted += '\n';
      }
      if (data.opportunities?.length) {
        formatted += `### 🚀 Opportunities\n`;
        data.opportunities.forEach((opp: any, i: number) => { formatted += `${i + 1}. ${opp.opportunity} (Impact: ${opp.potential_impact})\n`; });
        formatted += '\n';
      }
      if (data.risks?.length) {
        formatted += `### ⚠️ Risks\n`;
        data.risks.forEach((risk: any, i: number) => { formatted += `${i + 1}. **[${risk.severity}]** ${risk.risk} → ${risk.mitigation}\n`; });
        formatted += '\n';
      }

      // NEW: Behavioral Intelligence Summary
      if (data.behavioral_intelligence) {
        const bi = data.behavioral_intelligence;
        if (bi.data_quality_score > 0) {
          formatted += `### 🧠 Behavioral Intelligence\n`;
          formatted += `_Learning Quality: ${(bi.data_quality_score * 100).toFixed(0)}% | Posts Analyzed: ${bi.posts_analyzed_count || 0}_\n\n`;
          if (bi.content_type_preferences && Object.keys(bi.content_type_preferences).length) {
            const sorted = Object.entries(bi.content_type_preferences).sort(([,a]: any, [,b]: any) => b - a);
            formatted += `**Content Preferences:** ${sorted.map(([k, v]: any) => `${k}: ${(v * 100).toFixed(0)}%`).join(' | ')}\n`;
          }
          if (bi.engagement_type_distribution && Object.keys(bi.engagement_type_distribution).length) {
            formatted += `**Engagement Style:** ${Object.entries(bi.engagement_type_distribution).map(([k, v]: any) => `${k}: ${(v * 100).toFixed(0)}%`).join(' | ')}\n`;
          }
          if (bi.time_preferences && Object.keys(bi.time_preferences).length) {
            formatted += `**Peak Times:** ${JSON.stringify(bi.time_preferences)}\n`;
          }
          formatted += '\n';
        }
      }

      if (data.follow_up_questions?.length) {
        formatted += `### ❓ Suggested Next Steps\n`;
        data.follow_up_questions.forEach((q: string, i: number) => { formatted += `${i + 1}. ${q}\n`; });
      }
      return formatted;
    };

    const formattedInsights = formatInsightsForDisplay(analysisData);

    // Save to database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: analyticsRecord, error: insertError } = await supabase
      .from('uploaded_analytics')
      .insert({
        user_id: userId,
        image_url: screenshotUrl || imageUrl || null,
        platform: analysisData.metadata?.platform || null,
        platform_confidence: analysisData.metadata?.platform_confidence || null,
        data_completeness: analysisData.metadata?.data_completeness || null,
        extracted_data: analysisData.extracted_metrics || {},
        time_period_start: analysisData.metadata?.time_period?.start_date || null,
        time_period_end: analysisData.metadata?.time_period?.end_date || null,
        ai_insights: formattedInsights,
        trend_analysis: analysisData.trend_analysis || null,
        benchmark_comparison: analysisData.benchmark_comparison || null,
        pattern_recognition: analysisData.pattern_recognition || null,
        insights: analysisData.insights || null,
        recommendations: analysisData.recommendations || null,
        opportunities: analysisData.opportunities || null,
        risks: analysisData.risks || null,
        follow_up_questions: analysisData.follow_up_questions || null,
        summary: analysisData.summary || null,
        overall_health_score: analysisData.trend_analysis?.overall_health_score || null,
        performance_rating: analysisData.benchmark_comparison?.overall_performance_rating || null,
      })
      .select()
      .single();

    if (insertError) console.error('Failed to save analytics:', insertError);

    // === NEW: Update user_behavior_patterns from extracted behavioral intelligence ===
    const behavioralData = analysisData.behavioral_intelligence;
    if (behavioralData && behavioralData.data_quality_score > 0) {
      const platform = (analysisData.metadata?.platform || 'unknown').toLowerCase();
      
      try {
        // Check if existing patterns exist
        const { data: existing } = await supabase
          .from('user_behavior_patterns')
          .select('*')
          .eq('user_id', userId)
          .eq('platform', platform)
          .maybeSingle();

        const newBehaviorData: any = {};
        if (behavioralData.content_type_preferences && Object.keys(behavioralData.content_type_preferences).length) newBehaviorData.content_type_preferences = behavioralData.content_type_preferences;
        if (behavioralData.topic_preferences && Object.keys(behavioralData.topic_preferences).length) newBehaviorData.topic_preferences = behavioralData.topic_preferences;
        if (behavioralData.engagement_type_distribution && Object.keys(behavioralData.engagement_type_distribution).length) newBehaviorData.engagement_patterns = behavioralData.engagement_type_distribution;
        if (behavioralData.completion_rates && Object.keys(behavioralData.completion_rates).length) newBehaviorData.completion_rates = behavioralData.completion_rates;
        if (behavioralData.rewatch_patterns && Object.keys(behavioralData.rewatch_patterns).length) newBehaviorData.rewatch_patterns = behavioralData.rewatch_patterns;
        if (behavioralData.time_preferences && Object.keys(behavioralData.time_preferences).length) newBehaviorData.time_preferences = behavioralData.time_preferences;
        if (behavioralData.audience_segments && Object.keys(behavioralData.audience_segments).length) newBehaviorData.audience_segments = behavioralData.audience_segments;
        if (behavioralData.hook_effectiveness && Object.keys(behavioralData.hook_effectiveness).length) newBehaviorData.hook_effectiveness = behavioralData.hook_effectiveness;
        if (behavioralData.cta_response_rates && Object.keys(behavioralData.cta_response_rates).length) newBehaviorData.cta_response_rates = behavioralData.cta_response_rates;

        if (Object.keys(newBehaviorData).length > 0) {
          if (existing) {
            // Merge with existing: 70% new + 30% existing for each field
            const mergedData: any = { ...existing.behavior_data };
            for (const [key, newValue] of Object.entries(newBehaviorData)) {
              if (typeof newValue === 'object' && !Array.isArray(newValue) && mergedData[key]) {
                const merged: any = {};
                const allKeys = new Set([...Object.keys(newValue as any), ...Object.keys(mergedData[key])]);
                for (const k of allKeys) {
                  const nv = (newValue as any)[k];
                  const ov = mergedData[key][k];
                  if (typeof nv === 'number' && typeof ov === 'number') {
                    merged[k] = nv * 0.7 + ov * 0.3;
                  } else {
                    merged[k] = nv ?? ov;
                  }
                }
                mergedData[key] = merged;
              } else {
                mergedData[key] = newValue;
              }
            }

            const confidenceIncrement = behavioralData.data_quality_score > 0.7 ? 0.15 : 0.05;
            const newConfidence = Math.min(1.0, (existing.learning_confidence || 0) + confidenceIncrement);

            await supabase.from('user_behavior_patterns').update({
              behavior_data: mergedData,
              learning_confidence: newConfidence,
              last_analyzed: new Date().toISOString(),
            }).eq('id', existing.id);

            console.log(`Updated behavior patterns for ${platform}, confidence: ${newConfidence}`);
          } else {
            const confidenceIncrement = behavioralData.data_quality_score > 0.7 ? 0.15 : 0.05;
            await supabase.from('user_behavior_patterns').insert({
              user_id: userId,
              platform,
              behavior_data: newBehaviorData,
              learning_confidence: confidenceIncrement,
              last_analyzed: new Date().toISOString(),
            });
            console.log(`Created behavior patterns for ${platform}`);
          }
        }
      } catch (behaviorError) {
        console.error('Error updating behavior patterns:', behaviorError);
      }
    }

    console.log('Analysis complete, saved:', analyticsRecord?.id);

    return new Response(
      JSON.stringify({ success: true, analysis: formattedInsights, analysisData, analyticsId: analyticsRecord?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('File analysis error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to analyze file' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
