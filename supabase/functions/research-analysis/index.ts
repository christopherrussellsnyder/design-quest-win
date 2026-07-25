// Standalone Research Analysis endpoint.
// Returns platform-level "what's working right now" intel — trending hooks,
// top-performing formats, high-signal content patterns, and niche benchmarks.
// Cached 24h in public.research_insights and shared across tenants (data is
// non-PII platform intelligence, not user data). Starter accounts see a
// depth-capped version; Pro/Agency see the full report.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { serviceClient } from "../_shared/supabase.ts";
import { checkRateLimit, clientKey } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";
const CACHE_TTL_HOURS = 24;

type ContentMode = "organic" | "paid" | "hybrid";

interface Body {
  platform: string;
  contentMode?: ContentMode;
  industry?: string;
  force?: boolean;
}

function normalizePlatform(p: string): string {
  const s = (p || "").toLowerCase().trim();
  if (s.includes("instagram")) return "instagram";
  if (s.includes("tiktok")) return "tiktok";
  if (s.includes("linkedin")) return "linkedin";
  if (s.includes("twitter") || s === "x") return "twitter";
  if (s.includes("facebook") || s.includes("meta")) return "facebook";
  if (s.includes("youtube")) return "youtube";
  return s || "instagram";
}

function buildPrompt(platform: string, mode: ContentMode, industry: string) {
  const modeLine =
    mode === "organic"
      ? "ORGANIC feed/profile content only (no paid ad spend)"
      : mode === "paid"
      ? "PAID ad creatives only (cold-audience direct-response)"
      : "HYBRID mix of organic feed content AND paid ad creatives";

  return `You are Korex Intelligence's research analyst. Produce a compact, high-signal "what's working RIGHT NOW" research report for ${platform}.

Scope: ${modeLine}
Industry focus: ${industry || "general (all industries)"}

Requirements:
- Base everything on well-known, currently-effective patterns from the last 6-12 months on ${platform}.
- Concrete, not generic. "Split-screen POV with hard cut at 1.2s" beats "use engaging videos".
- Cite the mechanic behind why each pattern works (pattern interrupt, curiosity gap, loop, social proof, etc.).
- No filler. No disclaimers.

Return ONLY valid JSON (no markdown, no prose outside JSON):
{
  "platform": "${platform}",
  "content_mode": "${mode}",
  "industry": "${industry || "general"}",
  "generated_at": "${new Date().toISOString()}",
  "trending_hooks": [
    { "hook": "string (exact opening line template)", "mechanic": "string", "example": "string", "best_for": "string" }
  ],
  "top_formats": [
    { "format": "string (e.g. 'Talking-head Reel with kinetic captions')", "why_it_works": "string", "typical_length_seconds": 0, "avg_engagement_lift": "string (e.g. '+38% vs baseline')" }
  ],
  "content_patterns": [
    { "pattern": "string", "description": "string", "when_to_use": "string" }
  ],
  "posting_cadence": { "posts_per_week": "string", "best_time_windows": ["string"], "notes": "string" },
  "hashtag_strategy": { "mix": "string (e.g. '2 broad + 5 mid + 3 niche')", "avoid": "string" },
  "cta_patterns": [ { "cta": "string", "context": "string" } ],
  "ad_campaign_intelligence": ${
    mode === "organic"
      ? "null"
      : `{ "recommended_optimization": "string (CBO / ABO / Advantage+ / Performance Max / manual)", "why": "string", "creative_ratios": "string", "budget_allocation": "string" }`
  },
  "emerging_trends": [ { "trend": "string", "signal_strength": "high|medium|low", "action": "string" } ],
  "pitfalls_to_avoid": [ "string" ]
}

Provide 5-7 trending_hooks, 4-6 top_formats, 4-6 content_patterns, 3-5 emerging_trends, 3-5 pitfalls_to_avoid, 3-5 cta_patterns.`;
}

async function generateReport(
  platform: string,
  mode: ContentMode,
  industry: string,
): Promise<Record<string, unknown>> {
  if (!LOVABLE_API_KEY) throw new Error("Missing LOVABLE_API_KEY");
  const prompt = buildPrompt(platform, mode, industry);

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You return only valid JSON. No markdown fences." },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`AI gateway ${resp.status}: ${body}`);
  }

  const json = await resp.json();
  const text = json?.choices?.[0]?.message?.content ?? "";
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Best-effort recovery: extract the first {...} block.
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Model returned invalid JSON");
  }
}

function starterCap(report: Record<string, unknown>): Record<string, unknown> {
  const cap = <T,>(arr: T[] | undefined, n: number) =>
    Array.isArray(arr) ? arr.slice(0, n) : arr;
  return {
    ...report,
    trending_hooks: cap(report.trending_hooks as unknown[], 3),
    top_formats: cap(report.top_formats as unknown[], 2),
    content_patterns: cap(report.content_patterns as unknown[], 2),
    emerging_trends: cap(report.emerging_trends as unknown[], 2),
    cta_patterns: cap(report.cta_patterns as unknown[], 2),
    pitfalls_to_avoid: cap(report.pitfalls_to_avoid as unknown[], 2),
    ad_campaign_intelligence: null,
    _starter_capped: true,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const rl = checkRateLimit(clientKey(req, "research-analysis"), {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = serviceClient();
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const platform = normalizePlatform(body.platform);
    const mode: ContentMode = body.contentMode ?? "hybrid";
    const industry = (body.industry || "").trim().slice(0, 80);
    const force = !!body.force;

    // Tier check
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, plan_type")
      .eq("user_id", user.id)
      .maybeSingle();
    const FOUNDER = new Set(["chrissnyder3456@gmail.com"]);
    const isPaid =
      FOUNDER.has(user.email || "") ||
      (sub?.status === "active" && (sub.plan_type === "pro" || sub.plan_type === "agency"));

    // Cache lookup (24h)
    let cached: Record<string, unknown> | null = null;
    if (!force) {
      const { data } = await supabase
        .from("research_insights")
        .select("data, generated_at, expires_at")
        .eq("platform", platform)
        .eq("content_mode", mode)
        .eq("industry", industry || "general")
        .gt("expires_at", new Date().toISOString())
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) cached = data.data as Record<string, unknown>;
    }

    let report = cached;
    let fromCache = !!cached;

    if (!report) {
      report = await generateReport(platform, mode, industry || "general");
      const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 3600 * 1000).toISOString();
      await supabase.from("research_insights").insert({
        platform,
        content_mode: mode,
        industry: industry || "general",
        data: report,
        expires_at: expiresAt,
      });
      fromCache = false;
    }

    const payload = isPaid ? report : starterCap(report);

    return new Response(
      JSON.stringify({
        report: payload,
        from_cache: fromCache,
        tier: isPaid ? "pro" : "starter",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("research-analysis error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
