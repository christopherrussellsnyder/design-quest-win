// Generate an AI image for a strategy post and upload it to the user's media bucket.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Platform-aware aspect ratios -> gpt-image-2 size strings
function sizeForPlatform(platform?: string, postType?: string): string {
  const p = (platform || "").toLowerCase();
  const t = (postType || "").toLowerCase();
  if (t.includes("reel") || t.includes("story") || p === "tiktok") return "1024x1536"; // 9:16-ish
  if (p === "linkedin") return "1536x1024"; // landscape
  if (p === "youtube") return "1536x1024";
  return "1024x1024"; // IG feed, default
}

function buildPrompt(input: {
  caption?: string;
  hook?: string;
  theme?: string;
  postType?: string;
  platform?: string;
  visualDescription?: string;
  colorPalette?: string;
  textOverlay?: string;
  brandColors?: string;
  brandVoice?: string;
  stylePrompt?: string;
}) {
  const parts: string[] = [];
  parts.push("Professional social media post visual for " + (input.platform || "Instagram") + ".");
  if (input.visualDescription) parts.push("Scene: " + input.visualDescription);
  else if (input.hook) parts.push("Concept: " + input.hook);
  else if (input.caption) parts.push("Concept: " + input.caption.slice(0, 240));
  if (input.textOverlay) parts.push("Include subtle text overlay: \"" + input.textOverlay + "\".");
  if (input.colorPalette) parts.push("Color palette: " + input.colorPalette + ".");
  else if (input.brandColors) parts.push("Brand colors: " + input.brandColors + ".");
  if (input.brandVoice) parts.push("Brand tone: " + input.brandVoice + ".");
  if (input.theme) parts.push("Theme/mood: " + input.theme.replace(/_/g, " ") + ".");
  if (input.stylePrompt) parts.push("Style override: " + input.stylePrompt + ".");
  parts.push("High quality, on-brand, native-feeling, no watermarks, no fake logos, sharp focus.");
  return parts.join(" ");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth: get user from JWT
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const {
      caption, hook, theme, postType, platform,
      visualDescription, colorPalette, textOverlay,
      brandColors, brandVoice, stylePrompt,
      model = "openai/gpt-image-2",
    } = body || {};

    const prompt = buildPrompt({
      caption, hook, theme, postType, platform,
      visualDescription, colorPalette, textOverlay,
      brandColors, brandVoice, stylePrompt,
    });
    const size = sizeForPlatform(platform, postType);

    // Call Lovable AI Gateway image endpoint (non-streaming for simplicity)
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        size,
        quality: "low",
        n: 1,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `Image generation failed: ${errText}` }), {
        status: aiRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const b64 = aiJson?.data?.[0]?.b64_json;
    if (!b64) {
      return new Response(JSON.stringify({ error: "No image returned by model" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decode and upload to media bucket
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const filename = `${userId}/generated/${Date.now()}-${crypto.randomUUID()}.png`;
    const { error: uploadErr } = await supabase.storage
      .from("media")
      .upload(filename, bytes, { contentType: "image/png", upsert: false });

    if (uploadErr) {
      return new Response(JSON.stringify({ error: `Upload failed: ${uploadErr.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pub } = supabase.storage.from("media").getPublicUrl(filename);

    return new Response(JSON.stringify({
      url: pub.publicUrl,
      path: filename,
      prompt,
      size,
      model,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
