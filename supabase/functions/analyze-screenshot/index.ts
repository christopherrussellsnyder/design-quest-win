import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ENHANCED_ANALYSIS_PROMPT = `You are an expert data analyst specializing in social media and marketing analytics with deep knowledge of industry benchmarks and performance optimization.

TASK: Analyze this analytics screenshot with comprehensive depth and precision.

═══════════════════════════════════════════════════════════════
ANALYSIS FRAMEWORK
═══════════════════════════════════════════════════════════════

STEP 1: PLATFORM IDENTIFICATION
Identify:
- Platform: [Instagram/Facebook/TikTok/LinkedIn/Twitter/YouTube/Pinterest/Google Analytics/Shopify/Meta Ads Manager/Google Ads/Email Platform/Other]
- Confidence Level: [High/Medium/Low]
- Interface Type: [Native mobile app/Desktop web/Third-party analytics tool]
- Screen Type: [Profile analytics/Post insights/Ad performance/Audience demographics/Content performance]

STEP 2: TIME PERIOD EXTRACTION
Extract:
- Primary Time Period: Start Date, End Date, Duration
- Comparison Period (if shown)
- Time Granularity: [Hourly/Daily/Weekly/Monthly]

STEP 3: COMPREHENSIVE METRICS EXTRACTION
Extract EVERY visible number with its complete label. Be exhaustive.

Categories:
- ACCOUNT METRICS: Followers, Following, Posts Count
- ENGAGEMENT METRICS: Likes, Comments, Shares, Saves, Engagement Rate
- REACH & VISIBILITY: Reach, Impressions, Frequency
- TRAFFIC & CONVERSION: Profile Visits, Link Clicks, Conversions
- AUDIENCE: Demographics, Locations, Active Times
- CONTENT PERFORMANCE: Top Posts, Content Type Breakdown
- STORY/REEL/VIDEO: Views, Completion Rate, Watch Time
- AD METRICS (if applicable): Spend, CPM, CPC, CTR, ROAS

For each metric, include current value, change (+/- X, +/-Y%), and trend direction.

STEP 4: TREND ANALYSIS
For every metric with comparison data:
- Identify Strongest Positive Trends (top 3)
- Identify Most Concerning Declines (top 3)
- Calculate Overall Account Health Score: [1-10]
- Determine Growth Momentum: [Accelerating/Steady/Slowing/Declining]

STEP 5: PERFORMANCE BENCHMARKING
Compare against industry standards:
- Instagram: 1.5-3.5% engagement (varies by follower count)
- TikTok: 4.5-5.5%
- Facebook: 0.8-1.5%
- LinkedIn: 2.0-2.5%
- Twitter/X: 0.5-1.0%
- YouTube: 1.5-2.5%

Provide:
- User rate vs benchmark
- Percentile rank estimate
- Performance verdict: [Excellent/Above Average/Average/Below Average/Poor]

STEP 6: PATTERN RECOGNITION
Identify:
- Content patterns (which types outperform)
- Timing patterns (optimal posting times)
- Audience patterns (when most active)
- Anomalies (unusual spikes or drops)
- Correlations found

STEP 7: STRATEGIC INSIGHTS
Generate 5-7 KEY INSIGHTS ranked by importance. Each insight must:
- Be specific and data-backed (cite exact numbers)
- Be actionable
- Include importance level: [Critical/High/Medium/Low]
- Include category: [Strength/Opportunity/Warning/Neutral]
- Include reasoning

STEP 8: ACTIONABLE RECOMMENDATIONS
Provide 5-7 SPECIFIC, PRIORITIZED recommendations. Each must include:
- Clear action to take
- Rationale based on data
- Expected impact: [High/Medium/Low]
- Effort required: [Low/Medium/High]
- Priority: [P0 (Critical)/P1 (High)/P2 (Medium)/P3 (Low)]
- Implementation steps (3 specific steps)
- Success metrics

STEP 9: OPPORTUNITIES & RISKS
Opportunities:
- Underutilized content formats
- Untapped platform features
- High-performing themes to expand

Risks:
- Declining metrics requiring attention
- Dependency risks
- Audience fatigue indicators

STEP 10: FOLLOW-UP QUESTIONS
Suggest 3-5 strategic questions to deepen the analysis.

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT - Return ONLY valid JSON (no markdown, no code blocks):
═══════════════════════════════════════════════════════════════

{
  "metadata": {
    "platform": "",
    "platform_confidence": "High/Medium/Low",
    "interface_type": "",
    "screen_type": "",
    "time_period": {
      "start_date": "",
      "end_date": "",
      "duration": "",
      "granularity": ""
    },
    "comparison_period": null,
    "data_completeness": "Complete/Partial/Limited"
  },
  
  "extracted_metrics": {
    "account_metrics": {
      "followers": null,
      "followers_change": null,
      "followers_change_percent": null,
      "following": null,
      "posts_count": null
    },
    "engagement_metrics": {
      "total_likes": null,
      "total_comments": null,
      "total_shares": null,
      "total_saves": null,
      "engagement_rate": null,
      "engagement_rate_change": null
    },
    "reach_metrics": {
      "reach": null,
      "reach_change": null,
      "reach_change_percent": null,
      "impressions": null,
      "impressions_change": null,
      "impressions_change_percent": null
    },
    "traffic_metrics": {
      "profile_visits": null,
      "profile_visits_change": null,
      "link_clicks": null,
      "link_clicks_change": null,
      "conversions": null,
      "conversion_rate": null
    },
    "audience_metrics": {
      "top_locations": [],
      "age_distribution": [],
      "gender_distribution": null,
      "active_times": []
    },
    "content_performance": {
      "top_posts": [],
      "best_content_type": null,
      "avg_post_reach": null,
      "avg_post_engagement": null
    },
    "video_metrics": {
      "total_views": null,
      "avg_watch_time": null,
      "completion_rate": null
    },
    "ad_metrics": {
      "spend": null,
      "cpm": null,
      "cpc": null,
      "ctr": null,
      "roas": null
    }
  },
  
  "trend_analysis": {
    "positive_trends": [
      {
        "metric": "",
        "current_value": null,
        "change": "",
        "velocity": "Rapid/Strong/Moderate/Slight",
        "significance": "High/Medium/Low"
      }
    ],
    "negative_trends": [],
    "stable_metrics": [],
    "overall_health_score": 7,
    "growth_momentum": "Accelerating/Steady/Slowing/Declining"
  },
  
  "benchmark_comparison": {
    "engagement_rate_analysis": {
      "user_rate": null,
      "industry_benchmark": null,
      "performance_vs_benchmark": "",
      "percentile_rank": ""
    },
    "reach_rate_analysis": {
      "user_reach_rate": null,
      "typical_range": ""
    },
    "posting_frequency_analysis": {
      "detected_frequency": "",
      "recommended_frequency": "",
      "assessment": ""
    },
    "overall_performance_rating": "Excellent/Above Average/Average/Below Average/Poor",
    "percentile_estimate": ""
  },
  
  "pattern_recognition": {
    "content_patterns": [],
    "audience_patterns": [],
    "timing_patterns": [],
    "anomalies_detected": [],
    "correlations_found": []
  },
  
  "insights": [
    {
      "insight_number": 1,
      "insight": "",
      "supporting_data": "",
      "importance": "Critical/High/Medium/Low",
      "category": "Strength/Opportunity/Warning/Neutral",
      "impact_potential": "High/Medium/Low",
      "reasoning": ""
    }
  ],
  
  "recommendations": [
    {
      "recommendation_number": 1,
      "recommendation": "",
      "rationale": "",
      "expected_impact": "High/Medium/Low",
      "effort_required": "Low/Medium/High",
      "timeframe": "Immediate/1-2 weeks/1 month+",
      "priority": "P0/P1/P2/P3",
      "implementation_steps": [],
      "success_metrics": ""
    }
  ],
  
  "opportunities": [
    {
      "opportunity": "",
      "potential_impact": "High/Medium/Low",
      "difficulty": "Low/Medium/High",
      "priority": 1
    }
  ],
  
  "risks": [
    {
      "risk": "",
      "severity": "Critical/High/Medium/Low",
      "mitigation": "",
      "urgency": "Immediate/Soon/Later"
    }
  ],
  
  "follow_up_questions": [],
  
  "summary": {
    "one_sentence_summary": "",
    "top_3_strengths": [],
    "top_3_areas_for_improvement": [],
    "immediate_action_required": false,
    "immediate_action_reason": ""
  }
}

VALIDATION:
- All visible metrics must be extracted
- Every insight must cite specific numbers
- Recommendations must have implementation steps
- Use null for metrics not visible in screenshot
- Do not include placeholder text`;

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

    const { imageBase64, userId, screenshotUrl, imageUrl, conversationId } = await req.json();

    // Support both imageBase64 and imageUrl
    let base64Image = imageBase64;
    let contentType = 'image/png';

    if (!base64Image && imageUrl) {
      // Fetch the image and convert to base64
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image from storage');
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      base64Image = btoa(
        new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      contentType = imageResponse.headers.get('content-type') || 'image/png';
    }

    if (!base64Image) {
      return new Response(
        JSON.stringify({ error: 'Image data is required (imageBase64 or imageUrl)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing screenshot for user:', userId);

    // Call Lovable AI Gateway with vision capability
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: ENHANCED_ANALYSIS_PROMPT
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${contentType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 8000,
        temperature: 0.3,
      }),
    });

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
    
    console.log('Raw AI response received, length:', analysisText.length);

    // Parse the JSON response from AI
    let analysisData: any = {};
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Create a basic structure from the text
      analysisData = {
        metadata: { platform: 'Unknown', platform_confidence: 'Low', data_completeness: 'Partial' },
        summary: { one_sentence_summary: analysisText.slice(0, 200) },
        insights: [],
        recommendations: []
      };
    }

    // Format AI insights for display
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

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Save to uploaded_analytics table with enhanced fields
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
    console.error('Screenshot analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to analyze screenshot' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
