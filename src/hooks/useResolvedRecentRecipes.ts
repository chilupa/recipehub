import { useEffect, useMemo } from "react";
import type { Recipe } from "../types/Recipe";

/** Resolve MRU ids against loaded recipes and fetch missing ids via `ensureRecipeLoaded`. */
export function useResolvedRecentRecipes(
  recentRecipeIds: string[],
  recipes: Recipe[],
  ensureRecipeLoaded: (id: string) => Promise<boolean>,
): Recipe[] {
  const recentRecipes = useMemo(() => {
    const byId = new Map(recipes.map((r) => [r.id, r]));
    return recentRecipeIds
      .map((rid) => byId.get(rid))
      .filter((r): r is Recipe => r != null);
  }, [recentRecipeIds, recipes]);

  useEffect(() => {
    recentRecipeIds.forEach((rid) => {
      if (!recipes.some((r) => r.id === rid)) void ensureRecipeLoaded(rid);
    });
  }, [recentRecipeIds, recipes, ensureRecipeLoaded]);

  return recentRecipes;
}
