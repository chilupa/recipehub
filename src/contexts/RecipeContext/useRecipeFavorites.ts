import { useCallback, useEffect, useState } from "react";
import type { User } from "../AuthContext";
import type { Recipe } from "../../types/Recipe";
import { fetchFavoriteRecipesList } from "../../lib/recipeSupabase";

export function useRecipeFavorites(user: User | null) {
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const loadFavorites = useCallback(
    async (options?: { withSpinner?: boolean }) => {
      const withSpinner = options?.withSpinner !== false;
      if (!user) {
        setFavoriteRecipes([]);
        return;
      }
      if (withSpinner) setFavoritesLoading(true);
      try {
        const list = await fetchFavoriteRecipesList(user.id);
        setFavoriteRecipes(list);
      } catch (e) {
        console.error("Error loading favorites:", e);
        setFavoriteRecipes([]);
      } finally {
        if (withSpinner) setFavoritesLoading(false);
      }
    },
    [user?.id],
  );

  const clearFavorites = useCallback(() => {
    setFavoriteRecipes([]);
  }, []);

  useEffect(() => {
    if (!user) {
      setFavoriteRecipes([]);
      return;
    }
    const t = window.setTimeout(() => {
      void loadFavorites();
    }, 0);
    return () => clearTimeout(t);
  }, [user?.id, loadFavorites]);

  return {
    favoriteRecipes,
    setFavoriteRecipes,
    favoritesLoading,
    refreshFavorites: loadFavorites,
    clearFavorites,
  };
}
