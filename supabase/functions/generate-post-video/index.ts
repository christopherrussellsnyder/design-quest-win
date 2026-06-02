// Generate an AI video for a strategy post via Replicate (image-to-video).
// Uploads result to the ai-videos bucket.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/replicate/v1";

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractProviderMessage(status: number, text: string) {
  try {
    const parsed = JSON.parse(text);
    return parsed.detail || parsed.message || parsed.title || text;
  } catch (_) {
    return text;
  }
}

function providerErrorResponse(status: number, text: string) {
  const providerMessage = extractProviderMessage(status, text);
  if (status === 402) {
    return jsonResponse({
      error: "The connected Replicate account has insufficient credits to render this video. Add credits to that Replicate account, wait a few minutes, then click Animate to video again.",
      billing_required: true,
      provider_status: status,
      provider_message: providerMessage,
    });
  }
  if (status === 401 || status === 403) {
    return jsonResponse({
      error: "The Replicate connection could not be authorized. Reconnect Replicate, then try again.",
      reconnect_required: true,
      provider_status: status,
      provider_message: providerMessage,
    });
  }
  return jsonResponse({
    error: `Replicate could not start the video render: ${providerMessage}`,
    provider_status: status,
  });
}

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
      return jsonResponse({ error: "Replicate connector not configured" }, 500);
    }

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const userId = userData.user.id;

    // Note: tier gating disabled for now — open to all authenticated users.


    const body = await req.json();
    const {
      imageUrl, caption, hook, theme,
      visualDescription, motionPrompt,
    } = body || {};

    if (!imageUrl || typeof imageUrl !== "string") {
      return jsonResponse({ error: "imageUrl is required (generate an image first)" }, 400);
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
      return providerErrorResponse(createRes.status, errText);
    }

    const created = await createRes.json();
    const predId = created.id;
    if (!predId) {
      return jsonResponse({ error: "No prediction id returned" }, 502);
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
        return jsonResponse({ error: `Generation ${status}: ${p.error || "unknown"}` }, 502);
      }
    }

    if (!output) {
      return jsonResponse({ error: "Video generation timed out. Please try again." }, 504);
    }

    const videoUrl = Array.isArray(output) ? output[0] : output;
    if (!videoUrl || typeof videoUrl !== "string") {
      return jsonResponse({ error: "Invalid output from Replicate" }, 502);
    }

    // Download and persist to ai-videos bucket
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) {
      return jsonResponse({ error: "Failed to download generated video" }, 502);
    }
    const videoBytes = new Uint8Array(await videoRes.arrayBuffer());
    const path = `${userId}/generated/${Date.now()}-${predId}.mp4`;
    const { error: uploadErr } = await supabase.storage
      .from("ai-videos")
      .upload(path, videoBytes, { contentType: "video/mp4", upsert: false });
    if (uploadErr) {
      return jsonResponse({ error: `Upload failed: ${uploadErr.message}` }, 500);
    }
    const { data: pub } = supabase.storage.from("ai-videos").getPublicUrl(path);

    // Best-effort: register in media_library if table exists
    try {
      const filename = path.split("/").pop() || `${predId}.mp4`;
      await supabase.from("media_library").insert({
        user_id: userId,
        filename,
        original_filename: filename,
        file_type: "video",
        mime_type: "video/mp4",
        file_size: videoBytes.byteLength,
        storage_url: pub.publicUrl,
        title: "AI-generated post video",
        description: prompt,
        tags: ["ai-generated", "strategy-post"],
      });
    } catch (_) { /* ignore */ }

    return jsonResponse({ url: pub.publicUrl, prompt, predictionId: predId });
  } catch (e: any) {
    return jsonResponse({ error: e?.message || "Unexpected error" }, 500);
  }
});
