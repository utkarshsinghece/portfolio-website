## Goal

Give you a safe edit-then-publish loop on a redesigned admin, without losing work in flight.

## 1. Data model — draft vs published

Add one column to each content table (single source of truth, no shadow tables):

- `profile.draft jsonb` (nullable)
- `experience.draft jsonb`, `experience.is_published boolean default true`
- `skills.draft jsonb`, `skills.is_published boolean default true`
- `education.draft jsonb`, `education.is_published boolean default true`

Plus a tiny tracking table:

- `publish_state(id=1, last_published_at timestamptz, has_pending boolean)`

Rules:
- Public site reads only `is_published=true` rows and ignores `draft`.
- Admin editor reads `coalesce(draft, <row>)` so unpublished edits show only to you.
- Saving from admin writes to `draft` (and `is_published=false` for newly added rows). Live columns are untouched.
- "Publish" action: for every row with a non-null `draft`, copy draft→live columns, set `is_published=true`, null out `draft`. Updates `publish_state.last_published_at` and clears `has_pending`.

This keeps RLS rules unchanged and avoids a parallel table per entity.

## 2. Autosave

In the admin editor, any field change is debounced (~600ms) and persisted to the row's `draft` column via a single upsert. UI shows a small status pill: `Saving… → Saved · just now → Unsaved`. On unmount/route change we flush pending writes. No lost work even on accidental refresh.

A "View public preview" button opens `/?preview=1` in a new tab. In preview mode the public site reads draft-merged data (only works for admins — gated by `useAuth().isAdmin`).

## 3. Admin redesign — tabbed layout

Replace the sidebar with a top-level tab bar:

```
┌─ Admin ───────────────────────────────────────────────┐
│  Status: 3 unpublished changes  [Preview] [Publish ▸] │
├───────────────────────────────────────────────────────┤
│ Inbox · Profile · Skills · Experience · Education ·   │
│ Contact · Visibility                                  │
├───────────────────────────────────────────────────────┤
│  <Tab content with consistent spacing>                │
└───────────────────────────────────────────────────────┘
```

- Sticky header with: pending-changes count, autosave indicator, **Preview** button, **Publish** button (disabled when no pending changes).
- Each tab uses the same `Card` + `Field` primitives already in the codebase, with consistent `space-y-6` rhythm and a single max-width column.
- "Visibility" tab consolidates the toggles I just added (hire-me, resume, email, phone) plus per-section show/hide flags.
- "Contact" tab folds in the existing inbox.
- Drag-reorder, add/remove, and inline edit work the same — they just write to `draft`.

## 4. Publish UX

Clicking **Publish** opens a confirm dialog listing what will go live ("Profile, 2 experience entries, 1 new skill"), then runs the publish RPC in a single transaction. Toast on success, sticky header resets to "All changes published · {time}".

## Files

- Migration: add columns + `publish_state` table + a `publish_drafts()` SECURITY DEFINER function (admin-only) that does the copy in one transaction.
- `src/routes/admin.tsx` — refactored into `AdminShell` + `useAutosaveDraft()` hook + tabbed layout; tab components live in `src/components/admin/*`.
- `src/routes/index.tsx` — read merged draft+live when `?preview=1` and viewer is admin.
- New: `src/lib/admin-drafts.ts` (draft serialize/merge helpers) and `src/hooks/useAutosaveDraft.ts`.

## Out of scope (call out before I start)

- No version history / rollback beyond the current draft.
- Publish is all-or-nothing across sections (not per-tab) — keeps the model simple. I can add per-section publish later if you want.
