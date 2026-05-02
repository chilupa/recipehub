/**
 * Profile tab shopping badge: show until the user opens Profile, then hide on the
 * tab until new items are added (add from recipe or custom line).
 */
const STORAGE_KEY = "recipehub-profile-shopping-tab-suppress-v1";

export const PROFILE_SHOPPING_TAB_BADGE_EVENT =
  "recipehub-profile-shopping-tab-badge";

export function readProfileShoppingTabSuppress(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function suppressProfileShoppingTabBadge(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(STORAGE_KEY) === "1") return;
  localStorage.setItem(STORAGE_KEY, "1");
  window.dispatchEvent(new Event(PROFILE_SHOPPING_TAB_BADGE_EVENT));
}

export function unsuppressProfileShoppingTabBadge(): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(STORAGE_KEY)) return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(PROFILE_SHOPPING_TAB_BADGE_EVENT));
}
