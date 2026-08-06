import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { resolveVideoQuota, videoCorsHeaders as corsHeaders } from "../_shared/video-quota.ts";
import { getHeygenStatus } from "../_shared/heygen.ts";

const BUCKET = "video-ads";
const SIGNED_URL_TTL = 60 * 60; // 1 hour

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

  // Polling must not be quota-enforced — users check on renders they already paid for.
  const gate = await resolveVideoQuota(req, { enforce: false });
  if (gate instanceof Response) return gate;
  const { userId, supabase } = gate;

  try {
    const body = await req.json().catch(() => ({}));
    const id = (body as { id?: string })?.id;
    if (!id || typeof id !== "string") {
      return json({ error: "id is required" }, 400);
    }

    const { data: ad, error } = await supabase
      .from("video_ads")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !ad) {
      return json({ error: "Video not found." }, 404);
    }

    // Already finished — just hand back a fresh signed URL.
    if (ad.status === "completed" && ad.storage_path) {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(ad.storage_path as string, SIGNED_URL_TTL);
      return json({
        id: ad.id,
        status: "completed",
        url: signed?.signedUrl ?? null,
        thumbnail_url: ad.thumbnail_url,
        duration_seconds: ad.duration_seconds,
      });
    }

    if (ad.status === "failed") {
      return json({ id: ad.id, status: "failed", error: ad.error_message });
    }

    if (!ad.provider_video_id) {
      return json({ id: ad.id, status: ad.status });
    }

    // ---- Poll the provider ----------------------------------------------
    let remote;
    try {
      remote = await getHeygenStatus(ad.provider_video_id as string);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error(`[video-ad-status] poll failed for ${id}: ${detail}`);
      // Transient — keep the row processing so the client retries.
      return json({ id: ad.id, status: ad.status, transient_error: detail });
    }

    if (remote.status === "failed") {
      const message = remote.error ?? "The provider could not render this video.";
      // A failed render costs nothing, so release the quota slot.
      await supabase
        .from("video_ads")
        .update({ status: "failed", error_message: message, counts_against_quota: false })
        .eq("id", id);
      return json({ id: ad.id, status: "failed", error: message });
    }

    if (remote.status !== "completed" || !remote.videoUrl) {
      if (ad.status !== "processing") {
        await supabase.from("video_ads").update({ status: "processing" }).eq("id", id);
      }
      return json({ id: ad.id, status: "processing" });
    }

    // ---- Completed: persist the MP4 before the provider URL expires -----
    const storagePath = `${userId}/${id}.mp4`;

    // Idempotent: another poll may have already stored it.
    const { data: existing } = await supabase.storage
      .from(BUCKET)
      .list(userId, { search: `${id}.mp4`, limit: 1 });

    if (!existing?.length) {
      const videoRes = await fetch(remote.videoUrl);
      if (!videoRes.ok) {
        console.error(`[video-ad-status] download failed [${videoRes.status}] for ${id}`);
        return json({ id: ad.id, status: "processing" });
      }
      const bytes = await videoRes.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, bytes, { contentType: "video/mp4", upsert: true });

      if (uploadError) {
        console.error(`[video-ad-status] upload failed for ${id}: ${uploadError.message}`);
        return json({ id: ad.id, status: "processing" });
      }
    }

    await supabase
      .from("video_ads")
      .update({
        status: "completed",
        storage_path: storagePath,
        thumbnail_url: remote.thumbnailUrl ?? null,
        duration_seconds: remote.duration ?? null,
        completed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", id);

    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_TTL);

    return json({
      id: ad.id,
      status: "completed",
      url: signed?.signedUrl ?? null,
      thumbnail_url: remote.thumbnailUrl ?? null,
      duration_seconds: remote.duration ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[video-ad-status] ERROR:", message);
    return json({ error: message }, 500);
  }
});
