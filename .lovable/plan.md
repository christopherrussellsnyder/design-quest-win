## Three-part implementation plan

### 1. Campaign Structure Intelligence (CBO/ABO) inside Strategy Generation

**Goal:** Every generated strategy includes a "Recommended Campaign Structure" section per platform, informed by (a) the user's business profile + goals, (b) live competitive/industry intelligence about what campaign optimization types (CBO vs ABO, Advantage+, manual, etc.) are currently outperforming on each ad platform, and (c) what's working specifically inside the user's niche.

**Backend:**
- New edge function `refresh-campaign-intelligence` — periodically (daily via pg_cron) uses Lovable AI (`google/gemini-3-flash-preview`) with web-grounded research prompts to compile, per platform (Meta, TikTok, Google, LinkedIn) × per niche, the current best-performing campaign structures, recommended budgets, audience approach, and key ROAS/CPA trends. Optionally augments with Semrush data when relevant.
- New table `campaign_intelligence_signals` — stores: `platform`, `niche`, `recommended_structure` (CBO/ABO/Advantage+), `confidence_score`, `rationale`, `roas_trend`, `profit_margin_trend`, `sources` (jsonb), `refreshed_at`. Indexed by (platform, niche) with a TTL of 7 days.
- Update `generate-strategy/index.ts` to: pull the user's business profile + niche → fetch matching `campaign_intelligence_signals` → inject into the system prompt → require the LLM to output a new `recommended_campaign_structure` field on the strategy (per platform): `{ structure_type, budget_split, audience_approach, creative_volume, rationale, why_this_works_in_your_niche, alternative_to_test }`.
- Migration: add `recommended_campaign_structure jsonb` column to `content_strategies`.

**Frontend:**
- New "Campaign Structure" tab/section in `StrategyOverviewCard.tsx` rendering the recommended structure with rationale, niche-specific evidence, and an "alternative to A/B test" callout.
- Subtle "Intelligence refreshed [X days ago]" timestamp for transparency.

### 2. KOREX Launch Promo Code (15% off first month)

**Implementation:**
- Use `stripe--create_coupon` to create a 15% off, duration `once` coupon.
- Create a Stripe Promotion Code "KOREX" tied to that coupon via `stripe_api_execute` (PostPromotionCodes).
- Update `create-checkout` edge function to pass `allow_promotion_codes: true` on the Checkout Session so users can enter "KOREX" at checkout.
- Add a small dismissible launch banner on `/pricing` and the landing page hero: "Launch offer — use code **KOREX** for 15% off your first month." Stored dismiss state in localStorage.

### 3. AI-Powered Customer Support Widget

**Goal:** Floating chat widget on all authenticated app pages that answers generic/FAQ questions instantly using Lovable AI grounded in Korex's product knowledge, and escalates complex issues to the existing contact form.

**Backend:**
- New edge function `support-chat` — streaming chat endpoint using Lovable AI (`google/gemini-3-flash-preview`). System prompt grounded in a curated Korex knowledge base (features, pricing, plans, strategies workflow, billing, account management, troubleshooting, demo mode, etc.) plus the active user's plan/email context.
- Detects escalation triggers (billing disputes, account access, bugs, "talk to human") and surfaces a "Send to support team" button that pre-fills the existing contact form.
- New table `support_conversations` — stores per-user transcripts: `user_id`, `messages` (jsonb), `escalated`, `created_at`. RLS: users see their own only.

**Frontend:**
- New `SupportWidget.tsx` floating button (bottom-right, brand red `#CC0000`) mounted in the authenticated layout. Click expands to a chat panel matching the Korex dark cyberpunk aesthetic.
- Renders messages with markdown via `react-markdown`. Streaming responses, optimistic UI, "Escalate to human" CTA always visible.
- Hidden on public marketing pages and `/ai-strategist` (where Korex Intelligence already lives).

### Order of execution
1. Database migrations (campaign_intelligence_signals, content_strategies column, support_conversations).
2. Edge functions (refresh-campaign-intelligence, support-chat) + update generate-strategy + update create-checkout.
3. Stripe coupon + promo code.
4. Frontend: StrategyOverviewCard section, launch banner, SupportWidget.
5. Schedule `refresh-campaign-intelligence` via pg_cron (daily).
6. QA: generate a fresh strategy, run a Stripe checkout in test mode, open support widget and verify escalation.

### Technical notes
- All AI calls via Lovable AI Gateway (`LOVABLE_API_KEY`, no user-supplied keys).
- All new tables: explicit GRANTs + RLS scoped to `auth.uid()`.
- Campaign intelligence refresh limited to 4 platforms × top 20 niches to control cost; falls back to generic platform recommendations if no niche match.
- Support widget will NOT replace the contact form — it complements it.
