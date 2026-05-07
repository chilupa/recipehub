/** Scoped MRU recipe ids (newest first). Mirrors shopping list scope (signed-in vs guest). */

const STORAGE_PREFIX = "recipehub-recent-recipes:";

export function recentlyViewedStorageKey(scopeId: string): string {
  return `${STORAGE_PREFIX}${scopeId}`;
}

export function parseRecentlyViewedIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

export function loadRecentlyViewedIds(scopeId: string): string[] {
  try {
    return parseRecentlyViewedIds(
      localStorage.getItem(recentlyViewedStorageKey(scopeId)),
    );
  } catch {
    return [];
  }
}

export function saveRecentlyViewedIds(scopeId: string, ids: string[]): void {
  try {
    localStorage.setItem(
      recentlyViewedStorageKey(scopeId),
      JSON.stringify(ids),
    );
  } catch {
    /* quota */
  }
}
