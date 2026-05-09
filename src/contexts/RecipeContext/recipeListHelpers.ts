import type { Recipe } from "../../types/Recipe";

export function upsertRecipeSorted(prev: Recipe[], updated: Recipe): Recipe[] {
  const others = prev.filter((r) => r.id !== updated.id);
  return [...others, updated].sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
  );
}

/** Update one recipe without re-sorting (feed order must stay stable when only likes change). */
export function replaceRecipePreservingOrder(
  prev: Recipe[],
  updated: Recipe,
): Recipe[] {
  const i = prev.findIndex((r) => r.id === updated.id);
  if (i === -1) return upsertRecipeSorted(prev, updated);
  const next = prev.slice();
  next[i] = updated;
  return next;
}
