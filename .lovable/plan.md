# Backend Algorithm Enhancement Layer

Backend-only. No frontend/UI changes. All algorithms run inside existing Edge Functions + one new scheduled job, reusing existing tables (`niche_calibration`, `outcome_tracking`, `campaign_intelligence_signals`, `content_performance_patterns`).

## 1. Strategy generation — competitive decisioning
**File:** `supabase/functions/_shared/strategy-intel.ts`, `generate-strategy/index.ts`

- **Niche Saturation Index**: embed the user's product/UVP + recent strategy outputs and competitor ad copy (already gathered), compute cosine-similarity density. Score 0–1; injected into the critic prompt as a constraint ("saturation 0.72 — position against angles X, Y").
- **Thompson-sampling platform/timing selection**: model platform × daypart as Beta-distribution arms built from `niche_calibration` + `content_performance_patterns`. Sampled recommendations replace fixed heuristics; exploration bonus when sample size is low. Output stays inside the existing strategy JSON (recommended platform mix + posting windows).
- **Demand-aware scheduling**: combine audience time-zone activity (business profile) with search-demand signal strength to order the 7/14-day calendar so highest-demand topics land on highest-activity windows.

## 2. Content generation — quality optimization
**File:** `generate-caption-variants/index.ts`, `generate-content-enhanced/index.ts`

- **Multi-objective caption scorer**: deterministic scoring function (no extra model cost) rating each variant on hook strength, CTA clarity, reading level, brand-voice match (embedding distance to brand voice samples), and calibrated-pattern lift from `niche_calibration`. Variants are ranked and the top score stored on the row; Pareto-style selection keeps one "safe" and one "exploration" variant instead of two near-duplicates.
- **Constrained generation**: hard filters (banned phrases, length caps, required promo terms from `business_promotions`) applied as a validation pass with one repair retry.

## 3. Research engine — signal detection
**File:** `refresh-campaign-intelligence/index.ts`, `research-analysis/index.ts`, new `supabase/functions/detect-trend-shifts/index.ts`

- **CUSUM change-point detection**: nightly scheduled function over `campaign_intelligence_signals` confidence/engagement series per niche; flags emerging vs fading trends (`trend_state: emerging | stable | fading` column added) so strategy generation weights fresh signals higher. Labeled `ai_estimated` per the provenance rules.
- **Competitor positioning clusters**: embed competitor ad angles, cluster (k-means via embeddings, k auto from silhouette), store cluster centroids in a `niche_angle_clusters` table; the saturation index and critic prompt reference "cluster N of M — crowded/uncrowded".

## Database changes (one migration)
- Add `trend_state` + `trend_shift_detected_at` to `campaign_intelligence_signals`.
- New `niche_angle_clusters` table (niche, cluster_index, centroid_embedding, member_count, updated_at) + GRANTs + RLS (service-role write, authenticated read of own-niche rows is not user-scoped — read via security-definer or service only).
- New `caption_scores` columns on variant storage (`score_overall`, `score_breakdown jsonb`).
- pg_cron entries for the nightly trend-shift job.

## Execution order
1. Migration
2. Shared algorithm helpers (`_shared/algorithms.ts`: cosine, CUSUM, Thompson sampling, multi-objective scorer)
3. Strategy integration
4. Caption variant integration
5. Trend-shift + clustering jobs
6. Deploy + smoke test each function

## Verification
- Deploy all touched functions; invoke each once against the test account and confirm 200s, new fields written, and provenance labels intact.
