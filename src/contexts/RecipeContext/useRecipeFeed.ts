import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { User } from "../AuthContext";
import type { Recipe } from "../../types/Recipe";
import {
  fetchRecipeById,
  fetchVisibleRecipeCount,
  fetchFeedRecipesPage,
} from "../../lib/recipeSupabase";
import { GUEST_VIEWER_ID } from "../../lib/guestBrowse";
import { upsertRecipeSorted } from "./recipeListHelpers";
import { PAGE_SIZE } from "./constants";

export function useRecipeFeed(
  user: User | null,
  isGuest: boolean,
  canLoadFeed: boolean,
  setFavoriteRecipesOnClear: () => void,
) {
  const viewerId = user?.id ?? GUEST_VIEWER_ID;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [hasMoreRecipes, setHasMoreRecipes] = useState(false);
  const [recipesTotalCount, setRecipesTotalCount] = useState<number | null>(
    null,
  );

  const loadGenerationRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const recipesRef = useRef<Recipe[]>([]);
  recipesRef.current = recipes;

  const loadRecipes = useCallback(async () => {
    const gen = ++loadGenerationRef.current;

    if (!canLoadFeed) {
      setRecipes([]);
      setHasMoreRecipes(false);
      setRecipesLoading(false);
      setRecipesTotalCount(null);
      setFavoriteRecipesOnClear();
      return;
    }

    setRecipesLoading(true);
    loadingMoreRef.current = false;

    try {
      try {
        const list = await fetchFeedRecipesPage(PAGE_SIZE, 0, viewerId);
        if (gen !== loadGenerationRef.current) return;

        setRecipes(list);
        setHasMoreRecipes(list.length === PAGE_SIZE);

        void (async () => {
          try {
            const countRes = await fetchVisibleRecipeCount();
            if (gen !== loadGenerationRef.current) return;
            setRecipesTotalCount(countRes);
          } catch {
            // total is non-critical for first paint
          }
        })();
      } catch (error) {
        console.error("Error loading recipes:", error);
        if (gen !== loadGenerationRef.current) return;
        setRecipes([]);
        setHasMoreRecipes(false);
      }
    } finally {
      if (gen === loadGenerationRef.current) {
        setRecipesLoading(false);
      }
    }
  }, [user, canLoadFeed, viewerId, setFavoriteRecipesOnClear]);

  const loadMoreRecipes = useCallback(async () => {
    if (!canLoadFeed || !hasMoreRecipes || loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    const offset = recipesRef.current.length;

    try {
      const list = await fetchFeedRecipesPage(PAGE_SIZE, offset, viewerId);
      if (list.length === 0) {
        setHasMoreRecipes(false);
        return;
      }

      setRecipes((prev) => {
        const seen = new Set(prev.map((r) => r.id));
        const merged = [...prev];
        for (const r of list) {
          if (!seen.has(r.id)) {
            seen.add(r.id);
            merged.push(r);
          }
        }
        return merged;
      });
      setHasMoreRecipes(list.length === PAGE_SIZE);
    } catch (e) {
      console.error("Error loading more recipes:", e);
    } finally {
      loadingMoreRef.current = false;
    }
  }, [user, canLoadFeed, viewerId, hasMoreRecipes]);

  const ensureRecipeLoaded = useCallback(
    async (id: string): Promise<boolean> => {
      if (!canLoadFeed) return false;
      if (recipesRef.current.some((r) => r.id === id)) return true;

      const r = await fetchRecipeById(id, viewerId);
      if (r) {
        setRecipes((prev) => upsertRecipeSorted(prev, r));
        return true;
      }
      return false;
    },
    [canLoadFeed, viewerId],
  );

  useLayoutEffect(() => {
    if (user?.id || isGuest) {
      setRecipesLoading(true);
    }
  }, [user?.id, isGuest]);

  useEffect(() => {
    void loadRecipes();
  }, [loadRecipes]);

  return {
    recipes,
    setRecipes,
    recipesLoading,
    hasMoreRecipes,
    recipesTotalCount,
    setRecipesTotalCount,
    recipesRef,
    refreshRecipes: loadRecipes,
    loadMoreRecipes,
    ensureRecipeLoaded,
  };
}
