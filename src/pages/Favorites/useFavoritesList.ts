import { useCallback, useState } from "react";
import { useRecipes } from "../../contexts/RecipeContext";

export function useFavoritesList() {
  const { favoriteRecipes, favoritesLoading, toggleFavorite, shareRecipe } =
    useRecipes();
  const [toast, setToast] = useState({ show: false, message: "" });

  const onFavoritePress = useCallback(
    async (recipeId: string) => {
      try {
        await toggleFavorite(recipeId);
      } catch {
        setToast({ show: true, message: "Could not update favorite." });
      }
    },
    [toggleFavorite],
  );

  const dismissToast = useCallback(() => {
    setToast((t) => ({ ...t, show: false }));
  }, []);

  return {
    favoriteRecipes,
    favoritesLoading,
    onFavoritePress,
    shareRecipe,
    toast,
    dismissToast,
  };
}
