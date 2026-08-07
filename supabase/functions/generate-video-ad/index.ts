import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { resolveVideoQuota, videoCorsHeaders as corsHeaders } from "../_shared/video-quota.ts";
import { checkRateLimit, clientKey } from "../_shared/rate-limit.ts";
import { createHeygenVideo, ASPECT_DIMENSIONS } from "../_shared/heygen.ts";

const MAX_SCRIPT_CHARS = 3000;

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

  // Rendering is expensive — keep the ceiling tight and well below the plan quota.
  const rl = await checkRateLimit(clientKey(req, "video-ad-generate"), { limit: 6, windowMs: 60_000 });
  if (!rl.ok) {
    return json({ error: "Too many render requests. Please wait a moment." }, 429);
  }

  const gate = await resolveVideoQuota(req, { enforce: true });
  if (gate instanceof Response) return gate;
  const { userId, supabase, tier, limit, used } = gate;

  try {
    if (!Deno.env.get("HEYGEN_API_KEY")) {
      return json(
        {
          error: "Video generation isn't switched on yet. Please try again shortly.",
          code: "PROVIDER_NOT_CONFIGURED",
        },
        503,
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      script,
      hook,
      title,
      angle,
      avatarId,
      avatarName,
      avatarPreviewUrl,
      voiceId,
      aspectRatio = "9:16",
      workspaceId,
      strategyPostId,
    } = (body ?? {}) as Record<string, string | undefined>;

    // ---- Validation -----------------------------------------------------
    if (!script || typeof script !== "string" || !script.trim()) {
      return json({ error: "A script is required." }, 400);
    }
    if (script.length > MAX_SCRIPT_CHARS) {
      return json(
        { error: `Script is too long (${script.length} characters). Keep it under ${MAX_SCRIPT_CHARS}.` },
        400,
      );
    }
    if (!avatarId || typeof avatarId !== "string") {
      return json({ error: "Please choose an actor." }, 400);
    }
    if (!voiceId || typeof voiceId !== "string") {
      return json({ error: "Please choose a voice." }, 400);
    }
    if (!ASPECT_DIMENSIONS[aspectRatio]) {
      return json({ error: "Unsupported aspect ratio." }, 400);
    }

    // ---- Kick off the render -------------------------------------------
    let providerVideoId: string;
    try {
      providerVideoId = await createHeygenVideo({
        script: script.trim(),
        avatarId,
        voiceId,
        aspectRatio,
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      const status = (err as { heygen?: { status: number } })?.heygen?.status;
      console.error(`[video-ad] HeyGen create failed: ${detail}`);

      if (status === 401 || status === 403) {
        return json(
          { error: "Video provider credentials were rejected. Support has been notified.", details: detail },
          502,
        );
      }
      if (status === 429) {
        return json({ error: "The video provider is at capacity. Try again in a minute." }, 429);
      }
      return json({ error: "Could not start the render.", details: detail }, 502);
    }

    // ---- Record it ------------------------------------------------------
    const { data: row, error: insertError } = await supabase
      .from("video_ads")
      .insert({
        user_id: userId,
        workspace_id: workspaceId ?? null,
        strategy_post_id: strategyPostId ?? null,
        title: title ?? null,
        hook: hook ?? null,
        script: script.trim(),
        angle: angle ?? null,
        provider: "heygen",
        provider_video_id: providerVideoId,
        avatar_id: avatarId,
        avatar_name: avatarName ?? null,
        avatar_preview_url: avatarPreviewUrl ?? null,
        voice_id: voiceId,
        aspect_ratio: aspectRatio,
        status: "processing",
        counts_against_quota: true,
      })
      .select("id, status, created_at")
      .single();

    if (insertError) {
      console.error("[video-ad] insert failed:", insertError.message);
      return json({ error: "Render started but could not be saved. Please contact support." }, 500);
    }

    return json({
      id: row.id,
      status: row.status,
      quota: {
        tier,
        limit: limit === Number.POSITIVE_INFINITY ? null : limit,
        used: used + 1,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[video-ad] ERROR:", message);
    return json({ error: message }, 500);
  }
});
