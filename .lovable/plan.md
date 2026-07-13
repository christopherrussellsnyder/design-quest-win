# Finish Phase 1 + Ship Phase 2: White-Label Reports

## Part A — Finish Phase 1 (workspace scoping)

### A1. Client hooks/pages: filter by `activeWorkspaceId`
Thread `workspace_id` filter into every read and set it on every insert.

Files to update:
- `src/hooks/useStrategyGeneration.ts` — pass `workspace_id` in edge-function body
- `src/hooks/useWebsiteAnalysis.ts` — pass `workspace_id`
- `src/hooks/useScreenshotAnalysis.ts` — pass `workspace_id`
- `src/pages/ContentStrategies.tsx` — `.eq('workspace_id', activeWorkspaceId)`
- `src/pages/ContentLibrary.tsx` — same
- `src/pages/Insights.tsx` — filter `uploaded_analytics` by workspace
- `src/pages/MediaLibrary.tsx` — filter `media_library` (add scoping if needed)
- `src/components/settings/BusinessInformationSection.tsx` — read/write `business_context` by workspace
- `src/components/settings/business-info/PromotionsSection.tsx` — `business_promotions` by workspace
- `src/components/campaign-intelligence/**` — `campaigns` + `campaign_drafts` by workspace

### A2. Edge functions: accept + persist `workspace_id`
Update these to read `workspace_id` from body (fallback: active workspace via `user_profiles`) and set on inserts:
- `generate-strategy`
- `generate-comprehensive-campaign-strategy`
- `analyze-business`
- `scrape-website`
- `analyze-screenshot`
- `analytics-intelligence`
- `campaign-intelligence`

### A3. Workspace switch cache reset
On `switchWorkspace`, call `queryClient.invalidateQueries()` so stale per-workspace data is dropped.

---

## Part B — Phase 2: White-Label Reports

### B1. Schema
New migration:
```
public.brand_kits
  workspace_id uuid PK -> workspaces(id) on delete cascade
  logo_url text
  primary_color text default '#CC0000'
  accent_color text default '#0F1013'
  company_name text
  tagline text
  contact_email text
  contact_website text
  footer_note text
  created_at, updated_at

public.client_reports
  id uuid PK
  workspace_id uuid -> workspaces(id)
  created_by uuid -> auth.users
  title text
  period_start date, period_end date
  metrics jsonb        -- rolled-up numbers
  insights jsonb       -- AI narrative
  strategy_snapshot jsonb
  share_token text unique
  is_public boolean default false
  expires_at timestamptz
  view_count int default 0
  created_at, updated_at
```
Both tables: GRANTs + RLS keyed to `has_workspace_access(auth.uid(), workspace_id)`. `client_reports` gets an additional anon SELECT policy where `is_public = true AND share_token IS NOT NULL AND (expires_at IS NULL OR expires_at > now())`, with `GRANT SELECT ON public.client_reports TO anon`.

### B2. Edge function `generate-client-report`
- Inputs: `workspace_id`, `period_start`, `period_end`, optional `include_ai_narrative`
- Aggregates: `scheduled_posts` (impressions, engagement, top posts), `uploaded_analytics` (latest insights), active `content_strategies`, `business_promotions`
- Uses Lovable AI (`google/gemini-3-flash-preview`) to write a 4-paragraph client-facing narrative
- Inserts into `client_reports`, returns id + share_token

### B3. UI
- `src/components/settings/BrandKitSection.tsx` — new Settings tab for Agency users: upload logo, pick colors, company name, tagline, footer note. Gated to `tier === 'agency'` or founder.
- `src/pages/Reports.tsx` — Agency-only route: list past reports, "Generate report" modal (workspace picker + date range), row actions (copy public link, download PDF, delete).
- `src/pages/PublicReport.tsx` — public route `/r/:token`, no auth, renders branded report with brand-kit colors/logo, uses `react-helmet-async` for title.
- `src/components/reports/ReportView.tsx` — shared render (metrics cards, top posts, AI narrative, strategy snapshot). Used by both authed and public view.
- Add "Print / Save as PDF" button that calls `window.print()` with a `@media print` stylesheet — avoids adding a PDF library. PDF via server render can come later.

### B4. Routing + nav
- Add `/reports` (protected, Agency-gated) and `/r/:token` (public) in `src/App.tsx`.
- Add "Reports" link in the sidebar for Agency users.

### B5. Gating
- Non-Agency users hitting `/reports` see `UpgradePromptModal`.
- Brand kit tab hidden for non-Agency (except founder).

---

## Technical notes
- Reuse `has_workspace_access` for all new RLS.
- `share_token`: `encode(gen_random_bytes(16), 'hex')` default; unique index.
- Increment `view_count` via a small `increment-report-view` edge function (public, rate-limited by token).
- Print stylesheet: hide app chrome, force light background using brand kit colors on the report container only (does not affect the main dark theme).
- No new dependencies required.

## Out of scope (deferred)
- Server-side PDF rendering (Puppeteer/Chromium). `window.print()` is enough for launch.
- Scheduled recurring reports.
- Report email delivery via Resend.

## Delivery order
1. Migration (brand_kits + client_reports).
2. Workspace scoping in hooks/pages (Part A1).
3. Edge functions accept `workspace_id` (Part A2) + cache reset on switch (A3).
4. `generate-client-report` + `increment-report-view` edge functions.
5. Brand kit UI, Reports page, PublicReport page, routes + nav.
6. Verify: create workspace → generate report → open public link in incognito.
