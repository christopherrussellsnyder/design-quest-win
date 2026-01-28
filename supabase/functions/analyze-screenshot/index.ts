import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ANALYSIS_PROMPT = `You are analyzing a marketing analytics screenshot. Extract ALL visible metrics and provide insights.

Extract:
- Platform (Instagram, Facebook, TikTok, LinkedIn, Google Analytics, Shopify, etc.)
- Time period shown (dates)
- All numeric metrics (followers, engagement rate, reach, impressions, clicks, conversions, etc.)
- Trends (percentages up/down)
- Top performing content if visible
- Any charts or graphs interpretation

Provide:
- Structured JSON with all extracted data
- Key insights (3-5 bullet points)
- Recommendations (3-5 actionable items)
- Opportunities identified
- Warning signs if any

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "platform": "instagram",
  "time_period": { "start": "2025-12-01", "end": "2025-12-31" },
  "metrics": {
    "followers": 8234,
    "follower_growth": 265,
    "engagement_rate": 3.8,
    "reach": 45200,
    "impressions": 158330,
    "profile_visits": 2134
  },
  "insights": [
    "Your engagement rate of 3.8% is above industry average (3.2%)",
    "Carousel posts perform 3.2x better than single images"
  ],
  "recommendations": [
    "Increase carousel posts from 20% to 50% of content",
    "Post consistently at 7-9 PM EST (peak engagement time)"
  ],
  "opportunities": ["Video content underutilized"],
  "warnings": ["Posting frequency dropped 40% in December"]
}`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const userId = claimsData.claims.sub;

    const { imageUrl, conversationId } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing screenshot for user:', userId);
    console.log('Image URL:', imageUrl);

    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image from storage');
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    // Detect content type
    const contentType = imageResponse.headers.get('content-type') || 'image/png';

    // Call Lovable AI Gateway with vision capability (using Gemini which supports multimodal)
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
                text: ANALYSIS_PROMPT
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
        max_tokens: 4000,
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
    
    console.log('Raw AI response:', analysisText);

    // Parse the JSON response from AI
    let extractedData: any = {};
    let aiInsights = '';
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
        
        // Format insights for display
        const insights = extractedData.insights || [];
        const recommendations = extractedData.recommendations || [];
        const opportunities = extractedData.opportunities || [];
        const warnings = extractedData.warnings || [];
        
        aiInsights = `## 📊 Analytics Analysis

### Platform: ${extractedData.platform || 'Unknown'}
**Time Period:** ${extractedData.time_period?.start || 'N/A'} to ${extractedData.time_period?.end || 'N/A'}

### 📈 Key Metrics
${Object.entries(extractedData.metrics || {}).map(([key, value]) => `- **${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:** ${value}`).join('\n')}

### 💡 Insights
${insights.map((i: string) => `- ${i}`).join('\n')}

### ✅ Recommendations
${recommendations.map((r: string) => `- ${r}`).join('\n')}

${opportunities.length > 0 ? `### 🚀 Opportunities\n${opportunities.map((o: string) => `- ${o}`).join('\n')}` : ''}

${warnings.length > 0 ? `### ⚠️ Warnings\n${warnings.map((w: string) => `- ${w}`).join('\n')}` : ''}`;
      } else {
        // If no JSON found, use raw text
        aiInsights = analysisText;
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      aiInsights = analysisText;
    }

    // Save to uploaded_analytics table
    const { data: analyticsRecord, error: insertError } = await supabase
      .from('uploaded_analytics')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        platform: extractedData.platform || null,
        extracted_data: extractedData,
        time_period_start: extractedData.time_period?.start || null,
        time_period_end: extractedData.time_period?.end || null,
        ai_insights: aiInsights,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to save analytics:', insertError);
      // Continue anyway - the analysis was successful
    }

    console.log('Analysis complete, saved to database:', analyticsRecord?.id);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: aiInsights,
        extractedData,
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
