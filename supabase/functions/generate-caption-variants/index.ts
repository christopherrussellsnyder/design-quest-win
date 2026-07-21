import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requirePro } from "../_shared/require-pro.ts";
import { checkRateLimit, clientKey } from "../_shared/rate-limit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const gate = await requirePro(req);
  if (gate instanceof Response) return gate;

  // Abuse guard: generous ceiling that won't affect real usage.
  const rl = checkRateLimit(clientKey(req, "caption-variants"), { limit: 30, windowMs: 60_000 });
  if (!rl.ok) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please slow down.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { caption, hook, platform, postType, theme, contentCategory } = body ?? {};

    if (!caption || typeof caption !== 'string' || caption.length > 8000) {
      return new Response(
        JSON.stringify({ error: 'caption is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const systemPrompt = `You are Korex Intelligence, an elite social media copywriter.
Generate TWO distinct A/B caption variants for the same post idea. Each variant should test a different angle so the user can compare performance.

Rules:
- Keep the same core message, offer, and CTA intent as the original.
- Variant A = a DIFFERENT HOOK/ANGLE (e.g., curiosity-driven, contrarian, story-led).
- Variant B = a DIFFERENT TONE/STRUCTURE (e.g., more direct/punchy, list-style, emotional).
- Match the platform's native voice (${platform || 'social'}).
- Length should be similar to the original (±20%).
- Do NOT include hashtags in the variants.
- Output ONLY valid JSON, no markdown.

JSON schema:
{
  "variants": [
    { "label": "Variant A", "angle": "<short angle description>", "hook": "<opening hook line>", "caption": "<full caption>" },
    { "label": "Variant B", "angle": "<short angle description>", "hook": "<opening hook line>", "caption": "<full caption>" }
  ]
}`;

    const userPrompt = `ORIGINAL POST CONTEXT:
- Platform: ${platform || 'unspecified'}
- Post type: ${postType || 'unspecified'}
- Theme/Category: ${theme || contentCategory || 'unspecified'}
- Original hook: ${hook || '(none)'}
- Original caption:
"""
${caption}
"""

Generate the two A/B variants now.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { variants: [] };
    }

    const variants = Array.isArray(parsed?.variants) ? parsed.variants.slice(0, 2) : [];

    return new Response(
      JSON.stringify({ variants }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('generate-caption-variants error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
