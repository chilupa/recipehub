/** Anonymous viewer id for favorite enrichment queries (no rows will match). */
export const GUEST_VIEWER_ID = "00000000-0000-0000-0000-000000000000";

export const GUEST_BROWSE_STORAGE_KEY = "recipehub-guest-browse";

export function readGuestBrowsePreference(): boolean {
  try {
    return localStorage.getItem(GUEST_BROWSE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function persistGuestBrowsePreference(on: boolean) {
  try {
    if (on) localStorage.setItem(GUEST_BROWSE_STORAGE_KEY, "1");
    else localStorage.removeItem(GUEST_BROWSE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Shared recipe / deep links: allow the app shell without landing on sign-in first. */
export function shouldAutoGuestBrowseFromLocation(
  pathname: string,
  search: string,
): boolean {
  const path = pathname.replace(/\/$/, "") || "/";
  if (/^\/recipes\/recipe\/[^/]+$/i.test(path)) return true;
  if (path === "/" && new URLSearchParams(search).get("recipeId")) return true;
  return false;
}
