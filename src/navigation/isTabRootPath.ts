import type { AppTabConfig } from "../types/app-config";

/**
 * Destinations that keep the glass tab bar even without their own tab button
 * (reachable from Profile browse).
 */
const EXTRA_TAB_BAR_ROOTS = ["/myrecipes"] as const;

/** True when pathname is exactly a configured tab root (not a pushed stack page). */
export function isTabRootPath(
  pathname: string,
  tabs: AppTabConfig[],
): boolean {
  const normalized = (pathname.replace(/\/+$/, "") || "/") as string;
  if (
    EXTRA_TAB_BAR_ROOTS.some((root) => normalized === root)
  ) {
    return true;
  }
  return tabs.some((tab) => {
    const href = tab.href.replace(/\/+$/, "") || "/";
    return normalized === href;
  });
}
