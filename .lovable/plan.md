# Full Software Optimization Sweep

Goal: reduce DB/API calls, tighten edge functions (latency + cost), and clean up general code hygiene across every feature — without changing product behavior.

I'll work in **5 sequential phases**. Each phase ends with a build check so we don't ship regressions.

---

## Phase 1 — Client Data Layer (biggest DB/API call win)

The frontend currently uses raw `useEffect + supabase.from(...)` in most pages. This causes duplicate fetches, no caching, and re-fetch on every mount/tab switch.

**Actions:**
1. Introduce **React Query** as the canonical data layer (already in dependencies via shadcn).
2. Create `src/hooks/queries/` with typed hooks per resource:
   - `useStrategies`, `useStrategyPosts(id)`, `useInsights`, `useMediaLibrary`, `useBusinessContext`, `useBusinessPromotions`, `useSubscription`, `useUserProfile`, `useContactSubmissions`.
3. Convert `SubscriptionContext`, `Settings.tsx`, `ContentStrategies.tsx`, `Insights.tsx`, `MediaLibrary.tsx`, `AdminMessages.tsx`, `AIStrategist.tsx` to React Query — with sensible `staleTime` (30s–5m depending on volatility) and `gcTime`.
4. Replace manual Supabase realtime + `useEffect` polling with **`queryClient.invalidateQueries`** on realtime events (single source of truth).
5. Add **request deduplication** for the "on-app-load" burst (subscription + profile + business context currently fire 3 separate reads on every page — collapse into a single prefetch in `App.tsx`).

**Expected impact:** 40–60% fewer client → Supabase reads, instant tab switches, no stale UI.

---

## Phase 2 — Edge Function Efficiency

**Actions:**
1. **Shared Supabase client factory** (`_shared/supabase.ts`): every function currently constructs its own `createClient` inline — move to a memoized helper.
2. **Response caching** for read-heavy AI functions:
   - `campaign-intelligence`, `competitor-analysis`, `analyze-business`, `scrape-website`: cache by hash of inputs in the existing `cache_entries` table with 1–24h TTLs (varies by function).
3. **Prompt trimming** in `generate-strategy` and `generate-comprehensive-campaign-strategy`:
   - Move static instructions to a system prompt constant (once per request, not concatenated per post).
   - Drop redundant "quality floor / anti-oversaturation" preamble duplication.
   - Compress historical analytics context to top-N rows before sending to the model.
4. **Streaming**: switch long completions (`generate-strategy`, `ai-chat`, `support-chat`) fully to `toUIMessageStreamResponse` where not already, so TTFB drops.
5. **Batched writes**: `generate-strategy` currently `insert`s posts one-by-one in some paths — batch into a single `.insert([...])` call.
6. **Remove dead functions** (if any remain unused after audit: e.g. old `generate-content` if `generate-content-enhanced` supersedes it).

**Expected impact:** 30–50% faster edge function response, ~20% lower token cost on cached hits, cheaper cold starts.

---

## Phase 3 — Database Query Optimization

**Actions:**
1. Run `supabase--slow_queries` + `supabase--linter` to get the real offenders.
2. Add missing indexes (candidates based on schema):
   - `scheduled_posts (user_id, status, published_at DESC)`
   - `strategy_posts (strategy_id, scheduled_date)`
   - `uploaded_analytics (user_id, uploaded_at DESC)`
   - `support_conversations (user_id, created_at DESC)`
   - `contact_submissions (status, submitted_at DESC)`
3. Replace client-side `.select('*')` on wide tables (business_information has 49 cols) with **column projections** on list views.
4. Audit RLS policies flagged by linter — some may be doing per-row subqueries.

**Expected impact:** Lower DB CPU, faster admin/insights pages.

---

## Phase 4 — Bundle & Render Hygiene

**Actions:**
1. **Route-level code splitting**: `React.lazy` for admin, marketing, and settings routes (they don't need to be in the main bundle).
2. **Memoize expensive tree renders**: `StrategyPostCard`, `AnalysisDetail`, big Settings tabs — add `React.memo` + `useMemo` on derived data.
3. **Remove duplicate utilities**: consolidate `formatDate`, `truncate`, tier-check helpers into `src/lib/` (currently duplicated in 3–4 places).
4. **Dead code removal**: unused imports, orphaned components from removed features (e.g. remnants of the removed video feature).
5. **Consistent error handling**: standardize toast + error boundary usage per the existing memory rule.

**Expected impact:** Smaller initial JS payload, fewer re-renders.

---

## Phase 5 — Verification

1. `bun run build` — check bundle size deltas.
2. `tsgo` typecheck.
3. Smoke-test critical flows via Playwright: login → strategist chat → generate strategy → view insights → settings save.
4. Re-run `supabase--linter` to confirm no new warnings.

---

## Out of Scope (won't touch)

- Visual design, copy, animations, branding.
- Product behavior (all features work identically after the sweep).
- Auth/security posture (already covered by prior passes).
- Anything requiring paid plan changes or new secrets.

---

## Delivery

I'll ship phase-by-phase in this thread so you can review each diff before I move to the next. If you'd rather I go straight through all 5 phases and hand you one final report, say the word.
