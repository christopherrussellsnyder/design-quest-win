import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const IMAGE_ANALYSIS_PROMPT = `You are an expert data analyst specializing in social media and marketing analytics with deep knowledge of industry benchmarks and performance optimization.

TASK: Analyze this analytics screenshot/document with comprehensive depth and precision.

ANALYSIS FRAMEWORK:

1. PLATFORM IDENTIFICATION - Identify platform, confidence, interface type, screen type
2. TIME PERIOD EXTRACTION - Start/end dates, duration, granularity
3. COMPREHENSIVE METRICS EXTRACTION - Extract EVERY visible number with label
4. TREND ANALYSIS - Positive/negative trends, health score 1-10, growth momentum
5. PERFORMANCE BENCHMARKING - Compare against industry standards
6. PATTERN RECOGNITION - Content, timing, audience patterns, anomalies
7. STRATEGIC INSIGHTS - 5-7 data-backed insights ranked by importance
8. ACTIONABLE RECOMMENDATIONS - 5-7 prioritized recommendations with implementation steps
9. OPPORTUNITIES & RISKS
10. FOLLOW-UP QUESTIONS

OUTPUT FORMAT - Return ONLY valid JSON (no markdown, no code blocks):
${JSON_SCHEMA}

VALIDATION:
- All visible metrics must be extracted
- Every insight must cite specific numbers
- Recommendations must have implementation steps
- Use null for metrics not visible
- Do not include placeholder text`;

const TEXT_DATA_ANALYSIS_PROMPT = `You are an expert data analyst specializing in marketing analytics.

TASK: Analyze this marketing analytics data and provide comprehensive insights.

The data below was extracted from a spreadsheet file. Analyze it thoroughly.

DATA:
{DATA}

Provide your analysis as ONLY valid JSON (no markdown, no code blocks) with this structure:
${JSON_SCHEMA}

Focus on:
- Identifying key metrics and their trends
- Performance benchmarking against industry standards
- Actionable recommendations with implementation steps
- Opportunities and risks
- Use null for any fields not derivable from the data`;

const JSON_SCHEMA = `{
  "metadata": {
    "platform": "",
    "platform_confidence": "High/Medium/Low",
    "interface_type": "",
    "screen_type": "",
    "time_period": { "start_date": "", "end_date": "", "duration": "", "granularity": "" },
    "comparison_period": null,
    "data_completeness": "Complete/Partial/Limited"
  },
  "extracted_metrics": {
    "account_metrics": { "followers": null, "followers_change": null, "followers_change_percent": null, "following": null, "posts_count": null },
    "engagement_metrics": { "total_likes": null, "total_comments": null, "total_shares": null, "total_saves": null, "engagement_rate": null, "engagement_rate_change": null },
    "reach_metrics": { "reach": null, "reach_change": null, "reach_change_percent": null, "impressions": null, "impressions_change": null, "impressions_change_percent": null },
    "traffic_metrics": { "profile_visits": null, "profile_visits_change": null, "link_clicks": null, "link_clicks_change": null, "conversions": null, "conversion_rate": null },
    "audience_metrics": { "top_locations": [], "age_distribution": [], "gender_distribution": null, "active_times": [] },
    "content_performance": { "top_posts": [], "best_content_type": null, "avg_post_reach": null, "avg_post_engagement": null },
    "video_metrics": { "total_views": null, "avg_watch_time": null, "completion_rate": null },
    "ad_metrics": { "spend": null, "cpm": null, "cpc": null, "ctr": null, "roas": null }
  },
  "trend_analysis": {
    "positive_trends": [],
    "negative_trends": [],
    "stable_metrics": [],
    "overall_health_score": 7,
    "growth_momentum": "Accelerating/Steady/Slowing/Declining"
  },
  "benchmark_comparison": {
    "engagement_rate_analysis": { "user_rate": null, "industry_benchmark": null, "performance_vs_benchmark": "", "percentile_rank": "" },
    "reach_rate_analysis": { "user_reach_rate": null, "typical_range": "" },
    "posting_frequency_analysis": { "detected_frequency": "", "recommended_frequency": "", "assessment": "" },
    "overall_performance_rating": "Excellent/Above Average/Average/Below Average/Poor",
    "percentile_estimate": ""
  },
  "pattern_recognition": { "content_patterns": [], "audience_patterns": [], "timing_patterns": [], "anomalies_detected": [], "correlations_found": [] },
  "insights": [{ "insight_number": 1, "insight": "", "supporting_data": "", "importance": "Critical/High/Medium/Low", "category": "Strength/Opportunity/Warning/Neutral", "impact_potential": "High/Medium/Low", "reasoning": "" }],
  "recommendations": [{ "recommendation_number": 1, "recommendation": "", "rationale": "", "expected_impact": "High/Medium/Low", "effort_required": "Low/Medium/High", "timeframe": "Immediate/1-2 weeks/1 month+", "priority": "P0/P1/P2/P3", "implementation_steps": [], "success_metrics": "" }],
  "opportunities": [{ "opportunity": "", "potential_impact": "High/Medium/Low", "difficulty": "Low/Medium/High", "priority": 1 }],
  "risks": [{ "risk": "", "severity": "Critical/High/Medium/Low", "mitigation": "", "urgency": "Immediate/Soon/Later" }],
  "follow_up_questions": [],
  "summary": { "one_sentence_summary": "", "top_3_strengths": [], "top_3_areas_for_improvement": [], "immediate_action_required": false, "immediate_action_reason": "" }
}`;

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
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 8000,
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
          max_tokens: 8000,
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
        formatted += `### Platform: ${data.metadata.platform || 'Unknown'}\n`;
        formatted += `**Confidence:** ${data.metadata.platform_confidence || 'N/A'}\n`;
        if (data.metadata.time_period) {
          formatted += `**Period:** ${data.metadata.time_period.start_date || 'N/A'} to ${data.metadata.time_period.end_date || 'N/A'}\n`;
        }
        formatted += '\n';
      }

      if (data.trend_analysis) {
        formatted += `### 📈 Health Score: ${data.trend_analysis.overall_health_score || 'N/A'}/10\n`;
        formatted += `**Momentum:** ${data.trend_analysis.growth_momentum || 'N/A'}\n\n`;
      }

      if (data.summary) {
        formatted += `### 📝 Summary\n${data.summary.one_sentence_summary || 'No summary available'}\n\n`;
        if (data.summary.top_3_strengths?.length) {
          formatted += `**Strengths:**\n${data.summary.top_3_strengths.map((s: string) => `- ✅ ${s}`).join('\n')}\n\n`;
        }
        if (data.summary.top_3_areas_for_improvement?.length) {
          formatted += `**Areas for Improvement:**\n${data.summary.top_3_areas_for_improvement.map((s: string) => `- ⚠️ ${s}`).join('\n')}\n\n`;
        }
      }

      if (data.insights?.length) {
        formatted += `### 💡 Key Insights\n`;
        data.insights.forEach((insight: any, i: number) => {
          const icon = insight.category === 'Strength' ? '💪' : 
                       insight.category === 'Warning' ? '⚠️' : 
                       insight.category === 'Opportunity' ? '🚀' : '💡';
          formatted += `${i + 1}. ${icon} **${insight.importance}:** ${insight.insight}\n`;
        });
        formatted += '\n';
      }

      if (data.recommendations?.length) {
        formatted += `### ✅ Recommendations\n`;
        data.recommendations.forEach((rec: any, i: number) => {
          formatted += `${i + 1}. **[${rec.priority}]** ${rec.recommendation}\n`;
        });
        formatted += '\n';
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
