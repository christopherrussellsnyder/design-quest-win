import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { resolveVideoQuota, videoCorsHeaders as corsHeaders } from "../_shared/video-quota.ts";
import { checkRateLimit, clientKey } from "../_shared/rate-limit.ts";
import { createHeygenVideo, uploadHeygenImage, ASPECT_DIMENSIONS, type RenderScene } from "../_shared/heygen.ts";
import {
  archiveSceneImage,
  generateSceneImage,
  loadBrandKit,
  normalizePlan,
  sceneImagePrompt,
  type AdScene,
} from "../_shared/ad-production.ts";

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
      productionPlan,
    } = (body ?? {}) as Record<string, unknown> & { aspectRatio?: string };

    const asText = (v: unknown) => (typeof v === "string" ? v : undefined);
    const scriptText = asText(script);
    const avatarIdText = asText(avatarId);
    const voiceIdText = asText(voiceId);

    // ---- Validation -----------------------------------------------------
    if (!scriptText || !scriptText.trim()) {
      return json({ error: "A script is required." }, 400);
    }
    if (scriptText.length > MAX_SCRIPT_CHARS) {
      return json(
        { error: `Script is too long (${scriptText.length} characters). Keep it under ${MAX_SCRIPT_CHARS}.` },
        400,
      );
    }
    if (!avatarIdText) {
      return json({ error: "Please choose an actor." }, 400);
    }
    if (!voiceIdText) {
      return json({ error: "Please choose a voice." }, 400);
    }
    if (!ASPECT_DIMENSIONS[aspectRatio]) {
      return json({ error: "Unsupported aspect ratio." }, 400);
    }

    // ---- Build the storyboard -------------------------------------------
    // Visual elements are only produced for scenes the art direction actually
    // asked for; everything else stays a clean presenter shot.
    const plan = normalizePlan(productionPlan, scriptText.trim());
    const brandKit = await loadBrandKit(supabase, userId, asText(workspaceId));
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    const renderScenes: RenderScene[] = [];
    const usedAssets: { role: string; visual: string; storage_path?: string }[] = [];

    for (const scene of plan.scenes as AdScene[]) {
      const rendered: RenderScene = { text: scene.spoken };

      const wantsPlate = scene.visual === "broll" || scene.visual === "text-card";
      if (wantsPlate && lovableKey) {
        const bytes = await generateSceneImage(sceneImagePrompt(scene, brandKit, aspectRatio), lovableKey);
        if (bytes) {
          try {
            const uploaded = await uploadHeygenImage(bytes, "image/png");
            rendered.backgroundAssetId = uploaded.assetId;
            rendered.backgroundUrl = uploaded.assetId ? undefined : uploaded.url;
            // Pull the presenter down and aside so the visual reads.
            rendered.characterScale = scene.visual === "text-card" ? 0.72 : 0.82;
            rendered.offsetX = 0.18;
            rendered.offsetY = 0.12;
          } catch (e) {
            console.error("[video-ad] plate upload failed, falling back to plain scene:", e);
          }
          const storagePath = await archiveSceneImage(supabase, userId, bytes);
          usedAssets.push({ role: scene.role, visual: scene.visual, storage_path: storagePath ?? undefined });
        }
      } else if (scene.visual === "brand-color") {
        rendered.backgroundColor = scene.background_color ?? brandKit.primaryColor ?? "#101010";
        usedAssets.push({ role: scene.role, visual: scene.visual });
      }

      renderScenes.push(rendered);
    }

    // ---- Kick off the render -------------------------------------------
    let providerVideoId: string;
    try {
      providerVideoId = await createHeygenVideo({
        script: scriptText.trim(),
        avatarId: avatarIdText,
        voiceId: voiceIdText,
        aspectRatio,
        scenes: renderScenes,
        captions: plan.captions,
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
        workspace_id: asText(workspaceId) ?? null,
        strategy_post_id: asText(strategyPostId) ?? null,
        title: asText(title) ?? null,
        hook: asText(hook) ?? null,
        script: scriptText.trim(),
        angle: asText(angle) ?? null,
        provider: "heygen",
        provider_video_id: providerVideoId,
        avatar_id: avatarIdText,
        avatar_name: asText(avatarName) ?? null,
        avatar_preview_url: asText(avatarPreviewUrl) ?? null,
        voice_id: voiceIdText,
        aspect_ratio: aspectRatio,
        status: "processing",
        counts_against_quota: true,
        treatment: plan.treatment,
        scene_count: plan.scenes.length,
        production_plan: { ...plan, assets: usedAssets },
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
