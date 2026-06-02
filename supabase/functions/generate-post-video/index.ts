// Generate an AI video for a strategy post via Replicate (image-to-video).
// Gated to Pro/Agency tier. Uploads result to the ai-videos bucket.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/replicate/v1";

function buildVideoPrompt(input: {
  caption?: string;
  hook?: string;
  theme?: string;
  visualDescription?: string;
  motionPrompt?: string;
}) {
  const parts: string[] = [];
  if (input.motionPrompt) {
    parts.push(input.motionPrompt);
  } else {
    parts.push("Subtle cinematic motion, gentle camera push-in, soft parallax, natural ambient movement.");
  }
  if (input.visualDescription) parts.push("Scene: " + input.visualDescription);
  else if (input.hook) parts.push("Concept: " + input.hook);
  if (input.theme) parts.push("Mood: " + input.theme.replace(/_/g, " ") + ".");
  parts.push("High quality, smooth motion, no text artifacts, no flicker.");
  return parts.join(" ");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY || !REPLICATE_API_KEY) {
      return new Response(JSON.stringify({ error: "Replicate connector not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Gate to Pro/Agency tier
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan_type,status")
      .eq("user_id", userId)
      .maybeSingle();
    const tier = (sub?.plan_type || "").toLowerCase();
    const isPaid = sub?.status === "active" && (tier === "pro" || tier === "agency");
    if (!isPaid) {
      return new Response(JSON.stringify({
        error: "Video generation is a Pro/Agency feature. Upgrade to animate your posts.",
        upgrade_required: true,
      }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      imageUrl, caption, hook, theme,
      visualDescription, motionPrompt,
    } = body || {};

    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response(JSON.stringify({ error: "imageUrl is required (generate an image first)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildVideoPrompt({ caption, hook, theme, visualDescription, motionPrompt });

    const gwHeaders = {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": REPLICATE_API_KEY,
      "Content-Type": "application/json",
    };

    // Create prediction
    const createRes = await fetch(`${GATEWAY}/models/wan-video/wan-2.2-i2v-fast/predictions`, {
      method: "POST",
      headers: gwHeaders,
      body: JSON.stringify({ input: { image: imageUrl, prompt } }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      return new Response(JSON.stringify({ error: `Replicate error: ${createRes.status} ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const created = await createRes.json();
    const predId = created.id;
    if (!predId) {
      return new Response(JSON.stringify({ error: "No prediction id returned" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Poll for up to ~3 minutes
    let output: any = null;
    let status = created.status;
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, i < 5 ? 3000 : 5000));
      const pollRes = await fetch(`${GATEWAY}/predictions/${predId}`, {
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": REPLICATE_API_KEY,
        },
      });
      if (!pollRes.ok) continue;
      const p = await pollRes.json();
      status = p.status;
      if (status === "succeeded") { output = p.output; break; }
      if (status === "failed" || status === "canceled") {
        return new Response(JSON.stringify({ error: `Generation ${status}: ${p.error || "unknown"}` }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!output) {
      return new Response(JSON.stringify({ error: "Video generation timed out. Please try again." }), {
        status: 504,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const videoUrl = Array.isArray(output) ? output[0] : output;
    if (!videoUrl || typeof videoUrl !== "string") {
      return new Response(JSON.stringify({ error: "Invalid output from Replicate" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download and persist to ai-videos bucket
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to download generated video" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const videoBytes = new Uint8Array(await videoRes.arrayBuffer());
    const path = `${userId}/generated/${Date.now()}-${predId}.mp4`;
    const { error: uploadErr } = await supabase.storage
      .from("ai-videos")
      .upload(path, videoBytes, { contentType: "video/mp4", upsert: false });
    if (uploadErr) {
      return new Response(JSON.stringify({ error: `Upload failed: ${uploadErr.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: pub } = supabase.storage.from("ai-videos").getPublicUrl(path);

    // Best-effort: register in media_library if table exists
    try {
      await supabase.from("media_library").insert({
        user_id: userId,
        url: pub.publicUrl,
        type: "video",
        source: "ai-generated",
        prompt,
      });
    } catch (_) { /* ignore */ }

    return new Response(JSON.stringify({ url: pub.publicUrl, prompt, predictionId: predId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
