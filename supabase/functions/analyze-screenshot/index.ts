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
    "positive_trends": [{ "metric": "", "current_value": null, "previous_value": null, "absolute_change": null, "percentage_change": null, "trend_direction": "up", "trend_velocity": "Rapid/Strong/Moderate/Slight", "trend_quality": "Positive", "significance": "High/Medium/Low" }],
    "negative_trends": [{ "metric": "", "current_value": null, "previous_value": null, "absolute_change": null, "percentage_change": null, "trend_direction": "down", "trend_velocity": "", "trend_quality": "Negative", "significance": "" }],
    "stable_metrics": [],
    "volatile_metrics": [],
    "overall_health_score": 7,
    "growth_momentum": "Accelerating/Steady/Slowing/Declining"
  },
  "benchmark_comparison": {
    "engagement_rate_analysis": { "user_rate": null, "industry_benchmark": null, "performance_vs_benchmark": "", "percentile_rank": "", "verdict": "Excellent/Above Average/Average/Below Average/Poor" },
    "reach_rate_analysis": { "user_reach_rate": null, "typical_range": "" },
    "posting_frequency_analysis": { "detected_frequency": "", "recommended_frequency": "", "assessment": "Optimal/Acceptable/Too Low/Too High" },
    "overall_performance_rating": "Excellent/Above Average/Average/Below Average/Poor",
    "percentile_estimate": ""
  },
  "pattern_recognition": {
    "content_patterns": [{ "pattern": "", "evidence": "", "impact": "" }],
    "audience_patterns": [{ "pattern": "", "evidence": "", "impact": "" }],
    "timing_patterns": [{ "pattern": "", "evidence": "", "impact": "" }],
    "anomalies_detected": [{ "anomaly": "", "metric": "", "deviation": "", "possible_cause": "" }],
    "correlations_found": [{ "correlation": "", "metrics_involved": [], "strength": "Strong/Moderate/Weak" }]
  },
  "insights": [{ "insight_number": 1, "insight": "", "supporting_data": "", "importance": "Critical/High/Medium/Low", "category": "Strength/Opportunity/Warning/Neutral", "impact_potential": "High/Medium/Low", "reasoning": "" }],
  "recommendations": [{ "recommendation_number": 1, "recommendation": "", "rationale": "", "expected_impact": "High/Medium/Low", "effort_required": "Low/Medium/High", "timeframe": "Immediate/1-2 weeks/1 month+", "priority": "P0/P1/P2/P3", "implementation_steps": [], "success_metrics": "" }],
  "opportunities": [{ "opportunity": "", "potential_impact": "High/Medium/Low", "difficulty": "Low/Medium/High", "priority": 1 }],
  "risks": [{ "risk": "", "severity": "Critical/High/Medium/Low", "mitigation": "", "urgency": "Immediate/Soon/Later" }],
  "follow_up_questions": [],
  "summary": { "one_sentence_summary": "", "top_3_strengths": [], "top_3_areas_for_improvement": [], "immediate_action_required": false, "immediate_action_reason": "" }
}`;

const IMAGE_ANALYSIS_PROMPT = `You are an expert data analyst specializing in social media and marketing analytics with deep knowledge of industry benchmarks and performance optimization.

TASK: Analyze this analytics screenshot/document with comprehensive depth and precision.

═══════════════════════════════════════════════════════════════
COMPREHENSIVE 10-STEP ANALYSIS FRAMEWORK
═══════════════════════════════════════════════════════════════

STEP 1: PLATFORM IDENTIFICATION
- Examine visual elements, layout, metric names, interface design
- Identify: Platform (Instagram/Facebook/TikTok/LinkedIn/Twitter/YouTube/Pinterest/Google Analytics/Shopify/Meta Ads Manager/Google Ads/Email Platform/Other)
- Confidence Level (High/Medium/Low)
- Interface Type (Native mobile app/Desktop web/Third-party analytics tool)
- Screen Type (Profile analytics/Post insights/Ad performance/Audience demographics/Content performance)
- If uncertain, explain why

STEP 2: TIME PERIOD EXTRACTION
- Look for date indicators, time ranges, period labels
- Extract: Primary Time Period (start date, end date, duration)
- Comparison Period if shown (previous period, year-over-year)
- Time Granularity (Hourly/Daily/Weekly/Monthly)
- Data Freshness (Real-time/Last updated timestamp if visible)
- If no dates visible, state "time period not visible"

STEP 3: COMPREHENSIVE METRICS EXTRACTION
Extract EVERY visible number with complete label. Be exhaustive:
- Account Metrics: Followers/Subscribers with changes, Following, Posts Count
- Engagement Metrics: Likes, Comments, Shares, Saves, Engagement Rate with changes, Average Per Post
- Reach & Visibility: Reach (unique), Impressions (total), Viral/Organic/Paid split if shown
- Traffic & Conversion: Profile Visits, Link Clicks, Website Clicks, Conversions, Conversion Rate
- Audience Metrics: Top Locations with %, Age Ranges with %, Gender Distribution, Active Times, Growth Rate
- Content Performance: Top Posts with metrics, Post Type Breakdown, Average Reach/Engagement per post
- Story/Reel/Video: Views, Watch Time, Completion Rate, Plays, Engagement Rate
- Ad Metrics (if applicable): Spend, CPM, CPC, CTR, ROAS, Cost Per Conversion
- If metric partially visible, note "approximately" with clarity note

STEP 4: TREND ANALYSIS
For EVERY metric with comparison data:
- Current value, Previous value, Absolute change, Percentage change
- Trend direction (up/down/flat), Velocity (Rapid >50%/Strong 25-50%/Moderate 10-25%/Slight 0-10%)
- Trend quality (Positive/Negative/Neutral), Significance (High/Medium/Low)
- Identify: Top 3 strongest positive trends, Top 3 most concerning declines
- Calculate: Overall Account Health Score (1-10), Growth Momentum

STEP 5: PERFORMANCE BENCHMARKING
Compare against industry standards:
- Instagram avg engagement: <10K followers: 3.5%, 10K-100K: 2.5%, 100K-1M: 1.5%, 1M+: 0.8%
- TikTok avg: 4.5-5.5%, Facebook: 0.8-1.5%, LinkedIn: 2.0-2.5%, Twitter: 0.5-1.0%, YouTube: 1.5-2.5%
- Provide: User rate vs benchmark, Performance verdict, Percentile rank estimate
- Assess posting frequency vs recommended

STEP 6: PATTERN RECOGNITION
Identify non-obvious patterns:
- Content patterns: which types consistently outperform, timing patterns, visual patterns
- Audience patterns: when most active, which demographics engage most, geographic patterns
- Anomaly detection: unusual spikes (>50% jumps), unexpected drops (>30% declines), inconsistencies
- Correlation insights: when X changed, what else changed and by how much

STEP 7: STRATEGIC INSIGHTS (5-7 KEY INSIGHTS ranked by importance)
Each insight must be:
- Specific and data-backed with exact numbers from the screenshot
- Actionable (user can do something about it)
- Strategic (affects business outcomes)
- Non-obvious (not just "engagement went up 5%")
- Categorized: Strength/Opportunity/Warning/Neutral
- Include reasoning for why this matters

STEP 8: ACTIONABLE RECOMMENDATIONS (5-7 prioritized by impact)
Each must include:
- Specific actionable instruction (not vague advice)
- Rationale based on the data
- Expected impact (High/Medium/Low)
- Effort required (Low/Medium/High)
- Timeframe (Immediate/1-2 weeks/1 month+)
- Priority (P0 Critical/P1 High/P2 Medium/P3 Low)
- Implementation steps (3 specific actions)
- Success metrics (how to measure results)

STEP 9: OPPORTUNITY & RISK IDENTIFICATION
- Growth Opportunities: underutilized formats, underserved segments, untapped features, optimal times not used
- Risk Factors: declining metrics with severity, dependency risks, audience fatigue indicators, algorithm impact
- Sustainability concerns: metrics that can't be maintained long-term

STEP 10: INTELLIGENT FOLLOW-UP QUESTIONS (3-5)
Suggest strategic questions to deepen analysis:
- What specific posts drove changes?
- How does performance compare to competitors?
- What content performed best in the period?
- Would a strategy optimized for top content type help?

═══════════════════════════════════════════════════════════════

OUTPUT FORMAT - Return ONLY valid JSON (no markdown, no code blocks):
${JSON_SCHEMA}

QUALITY VALIDATION before returning:
✓ All visible metrics extracted with complete labels
✓ Every trend analyzed with direction and velocity
✓ Insights are specific and data-backed with exact numbers
✓ Recommendations are actionable with implementation steps
✓ Benchmarks applied correctly for the identified platform
✓ Patterns identified are non-obvious
✓ Opportunities and risks are strategic
✓ Follow-up questions add analytical value
✓ JSON structure complete and valid
✓ No placeholder text remains
✓ Use null for metrics not visible (never guess values)`;

const TEXT_DATA_ANALYSIS_PROMPT = `You are an expert data analyst specializing in marketing analytics.

TASK: Analyze this marketing analytics data with comprehensive depth using the same 10-step framework as visual analytics.

The data below was extracted from a spreadsheet file. Analyze it thoroughly.

DATA:
{DATA}

Apply the full analysis framework:
1. Identify the data source and platform
2. Extract time periods and granularity
3. Extract ALL metrics with labels
4. Analyze trends with velocity and significance
5. Benchmark against industry standards
6. Identify patterns and anomalies
7. Generate 5-7 strategic insights with data
8. Provide 5-7 prioritized recommendations with steps
9. Identify opportunities and risks
10. Suggest follow-up questions

Return ONLY valid JSON (no markdown, no code blocks) with this structure:
${JSON_SCHEMA}

Focus on actionable intelligence. Use null for any fields not derivable from the data.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { imageBase64, userId, screenshotUrl, imageUrl, textData, fileType, fileName, contentType } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing file for user:', userId, 'fileType:', fileType || 'image');

    let aiResponse: Response;

    if (textData) {
      // ===== TEXT DATA PATH (CSV/Excel) =====
      console.log('Processing text data from', fileType, 'file');
      const prompt = TEXT_DATA_ANALYSIS_PROMPT.replace('{DATA}', textData.slice(0, 30000));

      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are an expert marketing analytics data analyst. Return ONLY valid JSON without any markdown formatting or code blocks. Be thorough, specific, and data-driven in your analysis.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 10000,
          temperature: 0.3,
        }),
      });
    } else {
      // ===== BINARY DATA PATH (Image/PDF) =====
      let base64Data = imageBase64;
      let mimeType = contentType || 'image/png';

      if (!base64Data && imageUrl) {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) throw new Error('Failed to fetch file from storage');
        const imageBuffer = await imageResponse.arrayBuffer();
        base64Data = btoa(
          new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        mimeType = imageResponse.headers.get('content-type') || 'image/png';
      }

      if (!base64Data) {
        return new Response(
          JSON.stringify({ error: 'File data is required (imageBase64, imageUrl, or textData)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Processing binary data, mimeType:', mimeType);

      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: IMAGE_ANALYSIS_PROMPT },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } }
            ]
          }],
          max_tokens: 10000,
          temperature: 0.3,
        }),
      });
    }

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error('AI analysis failed');
    }

    const aiResult = await aiResponse.json();
    const analysisText = aiResult.choices?.[0]?.message?.content || '';
    console.log('Raw AI response length:', analysisText.length);

    // Parse JSON response
    let analysisData: any = {};
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      analysisData = {
        metadata: { platform: fileType === 'csv' || fileType === 'excel' ? 'Spreadsheet Data' : 'Unknown', platform_confidence: 'Low', data_completeness: 'Partial' },
        summary: { one_sentence_summary: analysisText.slice(0, 200) },
        insights: [],
        recommendations: []
      };
    }

    // Format insights for display
    const formatInsightsForDisplay = (data: any): string => {
      let formatted = `## 📊 Analytics Analysis\n\n`;
      
      if (data.metadata) {
        formatted += `### Platform: ${data.metadata.platform || 'Unknown'}`;
        if (data.metadata.platform_confidence) formatted += ` (${data.metadata.platform_confidence} confidence)`;
        formatted += '\n';
        if (data.metadata.time_period) {
          const tp = data.metadata.time_period;
          if (tp.start_date || tp.end_date) {
            formatted += `**Period:** ${tp.start_date || 'N/A'} to ${tp.end_date || 'N/A'}`;
            if (tp.duration) formatted += ` (${tp.duration})`;
            formatted += '\n';
          }
        }
        formatted += '\n';
      }

      if (data.trend_analysis) {
        formatted += `### 📈 Health Score: ${data.trend_analysis.overall_health_score || 'N/A'}/10\n`;
        formatted += `**Growth Momentum:** ${data.trend_analysis.growth_momentum || 'N/A'}\n\n`;
      }

      if (data.benchmark_comparison) {
        const bc = data.benchmark_comparison;
        if (bc.overall_performance_rating) {
          formatted += `### 🏆 Performance Rating: ${bc.overall_performance_rating}\n`;
          if (bc.percentile_estimate) formatted += `**Percentile:** ${bc.percentile_estimate}\n`;
          formatted += '\n';
        }
      }

      if (data.summary) {
        formatted += `### 📝 Summary\n${data.summary.one_sentence_summary || 'No summary available'}\n\n`;
        if (data.summary.top_3_strengths?.length) {
          formatted += `**Top Strengths:**\n${data.summary.top_3_strengths.map((s: string) => `- ✅ ${s}`).join('\n')}\n\n`;
        }
        if (data.summary.top_3_areas_for_improvement?.length) {
          formatted += `**Areas for Improvement:**\n${data.summary.top_3_areas_for_improvement.map((s: string) => `- ⚠️ ${s}`).join('\n')}\n\n`;
        }
        if (data.summary.immediate_action_required) {
          formatted += `🚨 **Immediate Action Required:** ${data.summary.immediate_action_reason}\n\n`;
        }
      }

      if (data.insights?.length) {
        formatted += `### 💡 Key Insights\n`;
        data.insights.forEach((insight: any, i: number) => {
          const icon = insight.category === 'Strength' ? '💪' : 
                       insight.category === 'Warning' ? '⚠️' : 
                       insight.category === 'Opportunity' ? '🚀' : '💡';
          formatted += `${i + 1}. ${icon} **[${insight.importance}]** ${insight.insight}\n`;
          if (insight.supporting_data) formatted += `   _Data: ${insight.supporting_data}_\n`;
        });
        formatted += '\n';
      }

      if (data.recommendations?.length) {
        formatted += `### ✅ Recommendations\n`;
        data.recommendations.forEach((rec: any, i: number) => {
          formatted += `${i + 1}. **[${rec.priority}]** ${rec.recommendation}\n`;
          if (rec.expected_impact) formatted += `   Impact: ${rec.expected_impact} | Effort: ${rec.effort_required || 'N/A'} | Timeline: ${rec.timeframe || 'N/A'}\n`;
        });
        formatted += '\n';
      }

      if (data.opportunities?.length) {
        formatted += `### 🚀 Opportunities\n`;
        data.opportunities.forEach((opp: any, i: number) => {
          formatted += `${i + 1}. ${opp.opportunity} (Impact: ${opp.potential_impact})\n`;
        });
        formatted += '\n';
      }

      if (data.risks?.length) {
        formatted += `### ⚠️ Risks\n`;
        data.risks.forEach((risk: any, i: number) => {
          formatted += `${i + 1}. **[${risk.severity}]** ${risk.risk} → ${risk.mitigation}\n`;
        });
        formatted += '\n';
      }

      if (data.follow_up_questions?.length) {
        formatted += `### ❓ Suggested Next Steps\n`;
        data.follow_up_questions.forEach((q: string, i: number) => {
          formatted += `${i + 1}. ${q}\n`;
        });
      }

      return formatted;
    };

    const formattedInsights = formatInsightsForDisplay(analysisData);

    // Save to database
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

    if (insertError) {
      console.error('Failed to save analytics:', insertError);
    }

    console.log('Analysis complete, saved to database:', analyticsRecord?.id);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: formattedInsights,
        analysisData,
        analyticsId: analyticsRecord?.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('File analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to analyze file' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
