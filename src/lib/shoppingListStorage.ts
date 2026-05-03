import type { ShoppingLine } from "../types/shoppingList";

/** Legacy key (single shared list); migrated into scoped keys on read. */
const LEGACY_ITEMS_KEY = "recipehub-shopping-v1";

export function shoppingItemsKey(scopeId: string): string {
  return `recipehub-shopping-items:${scopeId}`;
}

/** Signed-in: Supabase user id. Guest browse: `"guest"`. Login screen: `"__signed_out__"`. */
export function shoppingScopeId(
  userId: string | undefined,
  isGuest: boolean,
): string {
  if (userId) return userId;
  if (isGuest) return "guest";
  return "__signed_out__";
}

function parseItems(raw: string | null): ShoppingLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is ShoppingLine =>
        row != null &&
        typeof row === "object" &&
        typeof (row as ShoppingLine).id === "string" &&
        typeof (row as ShoppingLine).text === "string" &&
        typeof (row as ShoppingLine).checked === "boolean" &&
        typeof (row as ShoppingLine).recipeId === "string" &&
        typeof (row as ShoppingLine).recipeTitle === "string",
    );
  } catch {
    return [];
  }
}

/**
 * Load items for this scope. Migrates legacy unscoped data into this scope once.
 */
export function loadShoppingItems(scopeId: string): ShoppingLine[] {
  try {
    const scopedKey = shoppingItemsKey(scopeId);
    const scopedRaw = localStorage.getItem(scopedKey);
    if (scopedRaw) return parseItems(scopedRaw);

    const legacyRaw = localStorage.getItem(LEGACY_ITEMS_KEY);
    if (legacyRaw) {
      const items = parseItems(legacyRaw);
      localStorage.setItem(scopedKey, JSON.stringify(items));
      localStorage.removeItem(LEGACY_ITEMS_KEY);
      return items;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveShoppingItems(scopeId: string, items: ShoppingLine[]): void {
  try {
    localStorage.setItem(shoppingItemsKey(scopeId), JSON.stringify(items));
  } catch {
    /* quota */
  }
}
