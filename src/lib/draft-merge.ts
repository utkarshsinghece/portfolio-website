/**
 * Draft merge helpers.
 *
 * Each content row may carry a `draft` jsonb that overrides its live columns.
 * In public mode we read only `is_published=true` rows and ignore drafts.
 * In preview mode (admin-only, ?preview=1) we apply drafts on top, hide
 * `pending_delete` rows, and include unpublished rows.
 */

export type Draftable<T> = T & {
  draft?: Record<string, unknown> | null;
  is_published?: boolean | null;
  pending_delete?: boolean | null;
};

/** Merge a row with its draft jsonb. Draft fields win when present. */
export function mergeDraft<T extends object>(row: Draftable<T>): T {
  if (!row.draft) return row as T;
  const out = { ...row, ...(row.draft as object) } as T;
  // strip meta fields from result
  delete (out as Record<string, unknown>).draft;
  return out;
}

/** Apply preview rules to a list (drafts merged, deletes hidden). */
export function previewList<T extends object>(rows: Draftable<T>[]): T[] {
  return rows.filter((r) => !r.pending_delete).map(mergeDraft);
}

/** Detect whether we're in preview mode (URL flag). */
export function isPreviewUrl(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("preview") === "1";
}
