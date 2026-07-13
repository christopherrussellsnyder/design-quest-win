# Phase 1 — Multi-Brand Workspaces

Give Agency-tier users the ability to manage multiple client brands from one login, with isolated data per brand and a Slack-style switcher.

## Goal

An Agency user (e.g. "Chris's Marketing Co") can create separate brand workspaces ("Client A Coffee Shop", "Client B Law Firm"), each with its own business context, strategies, campaigns, content library, and analytics — completely siloed. Switching brands changes the entire app context.

## Architecture

```text
User (auth.users)
  └── owns → Workspaces (client brands)   ← Agency tier can create many; Pro/Starter = 1
        ├── business_context
        ├── campaigns
        ├── scheduled_posts
        ├── content_library
        ├── strategy_posts
        ├── uploaded_analytics
        └── business_promotions
```

Every scoped table gains a `workspace_id` column. RLS switches from `user_id = auth.uid()` to `workspace_id IN (user's accessible workspaces)`.

## Scope (what's in / what's out)

**In:**
- `workspaces` table + membership model
- `workspace_id` added to 8 core tables with backfill
- RLS rewritten on those 8 tables via a `has_workspace_access()` security-definer helper
- Active workspace tracked per user (stored in `user_profiles.active_workspace_id`)
- Workspace switcher UI in the sidebar
- Create / rename / delete workspace flow
- Tier gating: Starter/Pro = 1 workspace, Agency = up to 10, Founder = unlimited
- Edge-function updates: `generate-strategy`, `analyze-website`, `generate-content`, `analyze-uploaded-content`, `caption-variants`, `generate-visual` read `workspace_id` from the request and scope queries to it

**Out (future phases):**
- White-label branding per workspace (Phase 2)
- Inviting teammates into a specific workspace (Phase 3 — table exists, flow doesn't)
- Cross-workspace reporting rollups
- API access

## Data Model

```sql
-- Core workspace record
workspaces (
  id uuid pk,
  owner_id uuid → auth.users,
  name text,
  slug text unique,
  logo_url text nullable,
  is_default boolean,
  created_at, updated_at
)

-- Membership (owner is auto-member; ready for Phase 3 invites)
workspace_members (
  workspace_id uuid → workspaces,
  user_id uuid → auth.users,
  role text ('owner' | 'manager' | 'viewer'),
  pk (workspace_id, user_id)
)

-- Helper (security definer)
has_workspace_access(_user_id uuid, _workspace_id uuid) → boolean
```

`user_profiles.active_workspace_id uuid` added to remember the last-selected workspace.

## Migration Strategy

1. Create `workspaces` + `workspace_members` + helper function.
2. For each existing user, create a default workspace named after their business (or "My Workspace") and insert an `owner` membership.
3. Add nullable `workspace_id` to the 8 scoped tables, backfill from `user_id → default workspace`, then set `NOT NULL`.
4. Drop old `user_id`-only RLS policies and replace with `has_workspace_access(auth.uid(), workspace_id)` policies. `user_id` column stays (for authorship), but access control moves to workspace.
5. Set `user_profiles.active_workspace_id` to the default workspace for each user.

This is done in a single migration so nothing is ever half-migrated.

## Frontend Changes

- New `useWorkspace()` hook + `WorkspaceProvider` at the app root. Exposes `activeWorkspace`, `workspaces`, `switchWorkspace(id)`, `createWorkspace()`.
- All existing queries add `.eq('workspace_id', activeWorkspace.id)` — done via a shared `useWorkspaceQuery` wrapper so we don't hand-edit 40 components.
- Sidebar gets a workspace switcher at the top (dropdown showing all accessible workspaces + "New workspace" button for Agency tier).
- Settings gets a "Workspaces" section for rename/delete/create.
- Tier gate: `createWorkspace()` checks subscription tier and shows `UpgradePromptModal` if Starter/Pro user tries to create a 2nd.

## Edge Function Changes

Six functions take an optional `workspace_id` in the request body. Where they currently do `.eq('user_id', user.id)` on scoped tables, they switch to `.eq('workspace_id', workspaceId)` after verifying access via `has_workspace_access`. Founder bypass still works.

## Risk & Rollout

- **Riskiest step:** the RLS rewrite. Mitigation: the migration keeps `user_id` columns intact so we can roll back policies without data loss; every new policy is tested against the founder account first.
- **Perf:** add indexes on `(workspace_id)` and `(workspace_id, created_at)` for the hot tables (`scheduled_posts`, `strategy_posts`, `campaigns`).
- **Backwards compat:** users with a single workspace see zero UI change beyond a small workspace pill in the sidebar. No feature removed.

## Build Order

1. Migration (schema + backfill + RLS + indexes)
2. `WorkspaceProvider` + `useWorkspace` hook + sidebar switcher
3. Refactor data hooks (`useCampaigns`, `useStrategies`, `useContentLibrary`, etc.) to scope by workspace
4. Update the 6 edge functions
5. Settings → Workspaces management UI
6. Tier gate + `UpgradePromptModal` hook-up
7. QA pass with founder account + a fresh Agency test account

## Technical Notes

- `has_workspace_access` is a `SECURITY DEFINER` function using `workspace_members` — same pattern as the existing `has_role` helper, so no recursive-RLS risk.
- Founder account (`chrissnyder3456@gmail.com`) gets unlimited workspaces via the existing founder-bypass check.
- We keep `user_id` on scoped tables to preserve authorship trails (who created the post) even though access is workspace-scoped.

Estimated build time from here: ~4-5 focused work sessions. Approve and I'll start with the migration.
