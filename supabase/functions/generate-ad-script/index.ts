import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { checkRateLimit, clientKey } from "../_shared/rate-limit.ts";
import { loadBrandKit, recentTreatments, normalizePlan } from "../_shared/ad-production.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "google/gemini-2.5-flash";

type HookAngle = "intelligence" | "time" | "money" | "auto";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Authentication required", code: "UNAUTHENTICATED" }, 401);
  }

  const rl = await checkRateLimit(clientKey(req, "ad-script"), { limit: 20, windowMs: 60_000 });
  if (!rl.ok) {
    return json({ error: "Too many requests. Please slow down." }, 429);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return json({ error: "Invalid session", code: "UNAUTHENTICATED" }, 401);
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const {
      angle = "auto",
      durationSeconds = 30,
      count = 3,
      promoCode,
      promoDetail,
      customBrief,
      workspaceId,
      strategyPostId,
    } = (body ?? {}) as {
      angle?: HookAngle;
      durationSeconds?: number;
      count?: number;
      promoCode?: string;
      promoDetail?: string;
      customBrief?: string;
      workspaceId?: string;
      strategyPostId?: string;
    };


    if (typeof customBrief === "string" && customBrief.length > 4000) {
      return json({ error: "Brief is too long." }, 400);
    }
    const variantCount = Math.min(Math.max(Number(count) || 3, 1), 5);
    const seconds = Math.min(Math.max(Number(durationSeconds) || 30, 15), 60);

    // ---- Business context grounding -------------------------------------
    let contextBlock = "";
    let promotionsBlock = "";
    try {
      let ctxQuery = supabase
        .from("business_context")
        .select("*")
        .eq("user_id", userId)
        .limit(1);
      if (workspaceId) ctxQuery = ctxQuery.eq("workspace_id", workspaceId);
      const { data: ctx } = await ctxQuery.maybeSingle();

      if (ctx) {
        contextBlock = `
BUSINESS CONTEXT (ground every claim in this — never invent facts):
${JSON.stringify(ctx, null, 2)}`;
      }

      const { data: promos } = await supabase
        .from("business_promotions")
        .select("title, description, discount_value, promo_code, is_active")
        .eq("user_id", userId)
        .eq("is_active", true)
        .limit(5);

      if (promos?.length) {
        promotionsBlock = `
ACTIVE PROMOTIONS (weave the strongest one into the mid-roll and close):
${JSON.stringify(promos, null, 2)}`;
      }
    } catch (e) {
      console.error("[ad-script] context load failed (non-fatal):", e);
    }

    // ---- Strategy-day linkage ------------------------------------------
    // Production elements only earn their place when the day's post calls for
    // them. Without a linked post we deliberately stay closer to a clean read.
    let strategyBlock = "";
    if (strategyPostId) {
      try {
        const { data: post } = await supabase
          .from("strategy_posts")
          .select(
            "day_number, post_type, theme, hook, caption, cta, content_pillar, primary_emotion, hook_technique, visual_guidance, week_theme",
          )
          .eq("id", strategyPostId)
          .maybeSingle();
        if (post) {
          strategyBlock = `
LINKED STRATEGY DAY (this ad must be the video expression of THIS post — same promise, same emotion, same angle):
${JSON.stringify(post, null, 2)}`;
        }
      } catch (e) {
        console.error("[ad-script] strategy post load failed (non-fatal):", e);
      }
    }

    // ---- Brand kit + anti-repetition ------------------------------------
    const brandKit = await loadBrandKit(supabase, userId, workspaceId);
    const priorTreatments = await recentTreatments(supabase, userId);

    const brandBlock = `
BRAND KIT (design inspiration lifted from the advertiser's own website — every generated visual must look like it belongs to this brand):
${JSON.stringify(brandKit, null, 2)}`;

    const diversityBlock = priorTreatments.length
      ? `
RECENTLY SHIPPED TREATMENTS (do NOT repeat these looks — the market has already seen them from this advertiser):
${JSON.stringify(priorTreatments, null, 2)}`
      : "";


    const promoLine =
      promoCode || promoDetail
        ? `Explicit promo to feature: ${[promoDetail, promoCode ? `code ${promoCode}` : null]
            .filter(Boolean)
            .join(" — ")}`
        : promotionsBlock
          ? "Use the strongest active promotion listed above."
          : "No promo supplied. Use a soft value-based nudge instead of a discount, and leave promo fields as empty strings.";

    const angleInstruction =
      angle === "auto"
        ? `Produce ${variantCount} variants that each test a DIFFERENT hook angle. Rotate across these three families: (1) INTELLIGENCE — how the product's thinking/analysis beats guessing; (2) TIME — how much time it gives back; (3) MONEY — how much cost it removes vs agencies/freelancers.`
        : `Produce ${variantCount} variants that all attack the "${angle}" hook family, but with genuinely different opening lines and mechanics.`;

    const systemPrompt = `You are an elite direct-response UGC scriptwriter writing spoken video ad scripts for a single on-camera presenter.

STYLE BAR — this is non-negotiable:
Visually polished but conversationally relaxed. The presenter sounds like a sharp, credible person talking straight to camera — NOT a corporate announcer, NOT a hype-y guru. No exclamation marks. No "Are you tired of...". No "Introducing". No emojis. No stage directions or bracketed cues — output only words that are spoken aloud, because this text is fed directly to a text-to-speech engine.

MANDATORY STRUCTURE, in this exact order:
1. HOOK — one simple sentence that names the viewer's problem and implies the fix. This is where the ad lives or dies. It must be concrete and specific, never generic.
2. BENEFIT — how the product is specifically designed to benefit this viewer. Speak to outcome, not features.
3. MECHANISM — a very brief, plain explanation of how the product actually works. Two sentences maximum. Credibility, not a tour.
4. PROMO (mid-roll) — drop the offer here to hold attention through the middle.
5. CLOSE — restate the single strongest benefit, then repeat the promo and a clear next step.

PACING: roughly 2.4 spoken words per second. A ${seconds}-second script is about ${Math.round(seconds * 2.4)} words total. Respect this closely — going long gets the ad cut off.

${angleInstruction}

Return ONLY valid JSON, no markdown fences.

Schema:
{
  "variants": [
    {
      "angle": "intelligence" | "time" | "money",
      "title": "<short internal label, max 6 words>",
      "hook": "<the single opening sentence, verbatim from the script>",
      "script": "<the FULL spoken script, plain prose, all five beats flowing naturally as one continuous read>",
      "estimated_seconds": <number>,
      "why_it_works": "<one sentence on the psychological mechanic>"
    }
  ]
}`;

    const userPrompt = `${contextBlock}
${promotionsBlock}

${promoLine}

Target spoken length: ${seconds} seconds.
${customBrief ? `\nAdditional direction from the advertiser:\n${customBrief}` : ""}

Write the ${variantCount} script variants now.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error(`[ad-script] gateway failed [${aiRes.status}]: ${errText}`);
      if (aiRes.status === 429) {
        return json({ error: "The AI is busy right now. Try again in a moment.", code: "RATE_LIMITED" }, 429);
      }
      if (aiRes.status === 402) {
        return json(
          { error: "AI credits are temporarily unavailable. Please try again shortly.", code: "AI_CREDITS_DEPLETED" },
          402,
        );
      }
      return json({ error: "Could not generate scripts right now." }, 502);
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";

    let parsed: { variants?: unknown[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Resilient extraction — strip fences / prose around the JSON.
      const match = String(raw).match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { variants: [] };
    }

    const variants = Array.isArray(parsed.variants) ? parsed.variants : [];
    if (!variants.length) {
      return json({ error: "The script engine returned nothing usable. Please try again." }, 502);
    }

    return json({ variants });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[ad-script] ERROR:", message);
    return json({ error: message }, 500);
  }
});
