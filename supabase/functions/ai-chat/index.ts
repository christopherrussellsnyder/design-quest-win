import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface BusinessContext {
  businessProfile?: {
    businessName?: string;
    industry?: string;
    businessType?: string;
    targetAudience?: {
      ageRange?: string;
      customerType?: string;
      genderFocus?: string;
      incomeLevel?: string;
      interests?: string[];
      painPoints?: string[];
    };
    brandIdentity?: {
      voiceScale?: number;
      toneCharacteristics?: string[];
      valueProposition?: string;
      brandValues?: string[];
    };
    productsServices?: Array<{ name?: string; description?: string }>;
  };
  recentAnalytics?: Array<{
    platform?: string;
    metrics?: Record<string, any>;
    insights?: string;
  }>;
}

function buildSystemPrompt(context?: BusinessContext): string {
  let basePrompt = `You are an expert AI marketing strategist for MarketAI. You provide personalized, data-driven marketing advice.

Your capabilities:
1. **Analytics Interpretation**: Analyze marketing data, identify trends, and provide actionable insights
2. **Content Strategy**: Create detailed content plans, suggest post ideas, optimal posting times, and engagement strategies
3. **Campaign Planning**: Help plan marketing campaigns across platforms (Instagram, TikTok, LinkedIn, Twitter, Facebook)
4. **Performance Optimization**: Provide recommendations to improve engagement, reach, and conversions
5. **Competitor Analysis**: Help understand competitive positioning and opportunities

Guidelines:
- Be conversational but professional
- Provide specific, measurable, and actionable recommendations
- Use bullet points and formatting for clarity
- When generating content strategies, be detailed and structured
- Reference the user's specific business context when available
- If you need more information, ask clarifying questions
- Always cite data when making recommendations
`;

  if (context?.businessProfile) {
    const bp = context.businessProfile;
    basePrompt += `

BUSINESS CONTEXT:
- Business Name: ${bp.businessName || 'Not specified'}
- Industry: ${bp.industry || 'Not specified'}
- Business Type: ${bp.businessType || 'Not specified'}
`;

    if (bp.targetAudience) {
      const ta = bp.targetAudience;
      basePrompt += `
TARGET AUDIENCE:
- Age Range: ${ta.ageRange || 'Not specified'}
- Customer Type: ${ta.customerType || 'Not specified'}
- Gender Focus: ${ta.genderFocus || 'Not specified'}
- Income Level: ${ta.incomeLevel || 'Not specified'}
${ta.interests?.length ? `- Interests: ${ta.interests.join(', ')}` : ''}
${ta.painPoints?.length ? `- Pain Points: ${ta.painPoints.join(', ')}` : ''}
`;
    }

    if (bp.brandIdentity) {
      const bi = bp.brandIdentity;
      basePrompt += `
BRAND IDENTITY:
- Voice Scale (1-10, 1=formal, 10=casual): ${bi.voiceScale || 'Not specified'}
${bi.toneCharacteristics?.length ? `- Tone: ${bi.toneCharacteristics.join(', ')}` : ''}
${bi.valueProposition ? `- Value Proposition: ${bi.valueProposition}` : ''}
${bi.brandValues?.length ? `- Brand Values: ${bi.brandValues.join(', ')}` : ''}
`;
    }

    if (bp.productsServices?.length) {
      basePrompt += `
PRODUCTS/SERVICES:
${bp.productsServices.map(p => `- ${p.name}: ${p.description || 'No description'}`).join('\n')}
`;
    }
  }

  if (context?.recentAnalytics?.length) {
    basePrompt += `

RECENT PERFORMANCE DATA:
`;
    context.recentAnalytics.forEach((analytics, i) => {
      basePrompt += `
${i + 1}. ${analytics.platform?.toUpperCase() || 'Unknown Platform'}:
`;
      if (analytics.metrics) {
        const metrics = analytics.metrics;
        if (metrics.followers) basePrompt += `   - Followers: ${metrics.followers}\n`;
        if (metrics.engagement_rate) basePrompt += `   - Engagement Rate: ${metrics.engagement_rate}%\n`;
        if (metrics.reach) basePrompt += `   - Reach: ${metrics.reach}\n`;
        if (metrics.impressions) basePrompt += `   - Impressions: ${metrics.impressions}\n`;
      }
      if (analytics.insights) {
        basePrompt += `   Key Insights: ${analytics.insights.slice(0, 200)}...\n`;
      }
    });
  }

  basePrompt += `

When creating content strategies:
1. Start with a clear objective statement
2. Provide a weekly theme breakdown
3. Include specific post ideas with hooks, captions, and CTAs
4. Suggest optimal posting times based on platform best practices
5. Include hashtag recommendations
6. Provide expected outcomes and KPIs to track
7. Give tips for maximizing engagement

Remember to personalize all recommendations based on the business context provided above.`;

  return basePrompt;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, businessContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI Chat request with', messages.length, 'messages');
    console.log('Business context:', businessContext ? 'provided' : 'not provided');

    const systemPrompt = buildSystemPrompt(businessContext);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
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
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
