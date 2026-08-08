// Production layer for AI video ads.
//
// Everything here exists to answer one question per ad: what *visual* treatment
// does this specific script, on this specific strategy day, actually need?
// Elements (b-roll, brand backgrounds, text cards, captions) are opt-in per
// scene so consecutive ads don't collapse into the same look — the same
// anti-oversaturation discipline the strategy engine uses.

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type SceneVisual = "avatar" | "broll" | "text-card" | "brand-color";

export interface AdScene {
  /** hook | benefit | mechanism | promo | close */
  role: string;
  /** The words spoken during this beat. */
  spoken: string;
  visual: SceneVisual;
  /** Art direction for a generated background — only for broll / text-card. */
  background_prompt?: string;
  /** Short kinetic headline burned into a text card (max ~6 words). */
  on_screen_text?: string;
  /** Hex fallback pulled from the brand kit. */
  background_color?: string;
}

export interface ProductionPlan {
  treatment: "talking-head" | "product-showcase" | "text-driven" | "hybrid";
  rationale: string;
  captions: boolean;
  scenes: AdScene[];
}

export interface BrandKit {
  websiteUrl?: string;
  colors: string[];
  primaryColor?: string;
  fonts: string[];
  imagery?: string;
  tone?: string;
  products?: string;
  summary?: string;
  /** Real photography lifted from the advertiser's own website. */
  referenceImages: string[];
}

/* -------------------------------------------------------------------------- */
/* Brand kit — design inspiration lifted from the user's own website           */
/* -------------------------------------------------------------------------- */

function pluckStrings(value: unknown, depth = 0): string[] {
  if (depth > 3 || !value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap((v) => pluckStrings(v, depth + 1));
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((v) => pluckStrings(v, depth + 1));
  }
  return [];
}

const HEX = /#[0-9a-fA-F]{3,8}\b/g;

export async function loadBrandKit(
  supabase: SupabaseClient,
  userId: string,
  workspaceId?: string,
): Promise<BrandKit> {
  const kit: BrandKit = { colors: [], fonts: [] };

  try {
    let q = supabase
      .from("business_context")
      .select("website_url, visual_identity, brand_architecture, business_profile, executive_summary")
      .eq("user_id", userId)
      .limit(1);
    if (workspaceId) q = q.eq("workspace_id", workspaceId);
    const { data } = await q.maybeSingle();
    if (!data) return kit;

    kit.websiteUrl = data.website_url ?? undefined;

    const vi = (data.visual_identity ?? {}) as Record<string, unknown>;
    const viText = JSON.stringify(vi);
    kit.colors = Array.from(new Set(viText.match(HEX) ?? [])).slice(0, 6);
    kit.primaryColor = kit.colors[0];

    kit.fonts = pluckStrings(vi.typography ?? vi.fonts)
      .filter((s) => s.length < 40)
      .slice(0, 3);
    kit.imagery = pluckStrings(vi.imagery ?? vi.photography ?? vi.style).slice(0, 4).join("; ") || undefined;

    const brand = (data.brand_architecture ?? {}) as Record<string, unknown>;
    kit.tone = pluckStrings(brand.tone ?? brand.voice ?? brand.personality).slice(0, 3).join("; ") || undefined;

    const profile = (data.business_profile ?? {}) as Record<string, unknown>;
    kit.products =
      pluckStrings(profile.products ?? profile.offerings ?? profile.services).slice(0, 6).join("; ") || undefined;

    kit.summary = pluckStrings(data.executive_summary).slice(0, 3).join(" ") || undefined;
  } catch (e) {
    console.error("[ad-production] brand kit load failed (non-fatal):", e);
  }

  return kit;
}

/* -------------------------------------------------------------------------- */
/* Diversification — never ship the same look twice in a row                   */
/* -------------------------------------------------------------------------- */

export async function recentTreatments(
  supabase: SupabaseClient,
  userId: string,
  limit = 8,
): Promise<{ treatment: string; hook: string }[]> {
  try {
    const { data } = await supabase
      .from("video_ads")
      .select("treatment, hook, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? [])
      .filter((r) => r.treatment)
      .map((r) => ({ treatment: String(r.treatment), hook: String(r.hook ?? "") }));
  } catch {
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* Scene visual generation                                                     */
/* -------------------------------------------------------------------------- */

const IMAGE_MODEL = "google/gemini-3-pro-image";

function aspectHint(aspectRatio: string): string {
  if (aspectRatio === "16:9") return "wide 16:9 landscape frame";
  if (aspectRatio === "1:1") return "square 1:1 frame";
  return "vertical 9:16 mobile frame";
}

/** Composes the art-direction prompt for one scene background. */
export function sceneImagePrompt(scene: AdScene, kit: BrandKit, aspectRatio: string): string {
  const palette = kit.colors.length ? `Brand palette to obey exactly: ${kit.colors.join(", ")}.` : "";
  const typography = kit.fonts.length ? `Typographic feel: ${kit.fonts.join(", ")}.` : "";
  const imagery = kit.imagery ? `Existing brand imagery style: ${kit.imagery}.` : "";

  if (scene.visual === "text-card") {
    return [
      `A modern advertising motion-graphics title card, ${aspectHint(aspectRatio)}.`,
      `Render this exact headline, spelled precisely, as the only text in the image: "${scene.on_screen_text ?? ""}".`,
      "Bold contemporary sans-serif typography, generous negative space, strong contrast, editorial ad-agency composition.",
      "Leave the lower right third visually calm — a presenter will be composited there.",
      palette,
      typography,
      "No watermarks, no logos, no extra words, no lorem ipsum, no gibberish letterforms.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [
    `Cinematic advertising b-roll background plate, ${aspectHint(aspectRatio)}.`,
    scene.background_prompt ?? "Premium product-in-context environment.",
    "Shot on a full-frame camera, shallow depth of field, soft directional light, subtle film grain, colour-graded like a high-end brand campaign.",
    "Composition keeps the centre and lower right uncluttered so a presenter can be composited over it.",
    palette,
    imagery,
    "No text, no typography, no logos, no watermarks, no people looking at camera.",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Generates one background plate and returns raw PNG bytes. */
export async function generateSceneImage(prompt: string, apiKey: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) {
      console.error(`[ad-production] scene image failed [${res.status}]: ${await res.text()}`);
      return null;
    }

    const json = await res.json();
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) return null;
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  } catch (e) {
    console.error("[ad-production] scene image error:", e);
    return null;
  }
}

/** Archives the plate so the user can see what was used inside their ad. */
export async function archiveSceneImage(
  supabase: SupabaseClient,
  userId: string,
  bytes: Uint8Array,
): Promise<string | null> {
  const path = `${userId}/scenes/${Date.now()}-${crypto.randomUUID()}.png`;
  const { error } = await supabase.storage
    .from("ad-scene-assets")
    .upload(path, bytes, { contentType: "image/png", upsert: false });
  if (error) {
    console.error("[ad-production] archive failed (non-fatal):", error.message);
    return null;
  }
  return path;
}

/* -------------------------------------------------------------------------- */
/* Safety rails                                                                */
/* -------------------------------------------------------------------------- */

/** Caps how much visual production a single render is allowed to request. */
export const MAX_GENERATED_PLATES = 2;

export function normalizePlan(plan: unknown, fallbackScript: string): ProductionPlan {
  const p = (plan ?? {}) as Partial<ProductionPlan>;
  const rawScenes = Array.isArray(p.scenes) ? p.scenes : [];

  const scenes: AdScene[] = rawScenes
    .filter((s) => s && typeof (s as AdScene).spoken === "string" && (s as AdScene).spoken.trim())
    .slice(0, 5)
    .map((s) => {
      const scene = s as AdScene;
      const visual: SceneVisual = (["avatar", "broll", "text-card", "brand-color"] as SceneVisual[]).includes(
        scene.visual,
      )
        ? scene.visual
        : "avatar";
      return {
        role: String(scene.role ?? "beat"),
        spoken: scene.spoken.trim(),
        visual,
        background_prompt: scene.background_prompt ? String(scene.background_prompt).slice(0, 600) : undefined,
        on_screen_text: scene.on_screen_text ? String(scene.on_screen_text).slice(0, 70) : undefined,
        background_color: /^#[0-9a-fA-F]{3,8}$/.test(String(scene.background_color ?? ""))
          ? String(scene.background_color)
          : undefined,
      };
    });

  if (!scenes.length) {
    return {
      treatment: "talking-head",
      rationale: "Straight-to-camera read — no visual element earned its place here.",
      captions: true,
      scenes: [{ role: "full", spoken: fallbackScript, visual: "avatar" }],
    };
  }

  // Hard cap on generated plates keeps render time and cost predictable.
  let plates = 0;
  for (const scene of scenes) {
    if (scene.visual === "broll" || scene.visual === "text-card") {
      plates += 1;
      if (plates > MAX_GENERATED_PLATES) scene.visual = "brand-color";
    }
  }

  const treatment = (["talking-head", "product-showcase", "text-driven", "hybrid"] as const).includes(
    p.treatment as never,
  )
    ? (p.treatment as ProductionPlan["treatment"])
    : "hybrid";

  return {
    treatment,
    rationale: String(p.rationale ?? "").slice(0, 400),
    captions: p.captions !== false,
    scenes,
  };
}
