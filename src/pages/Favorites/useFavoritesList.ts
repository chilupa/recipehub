import { useCallback, useState } from "react";
import { useRecipes } from "../../contexts/RecipeContext";

export function useFavoritesList() {
  const { favoriteRecipes, favoritesLoading, toggleFavorite, shareRecipe } =
    useRecipes();
  const [toast, setToast] = useState({ show: false, message: "" });
  /** Recipe row showing an in-place skeleton while favorite toggles (unfavorite on this tab). */
  const [skeletonRecipeId, setSkeletonRecipeId] = useState<string | null>(
    null,
  );

  const onFavoritePress = useCallback(
    async (recipeId: string) => {
      setSkeletonRecipeId(recipeId);
      try {
        await toggleFavorite(recipeId);
      } catch {
        setToast({ show: true, message: "Could not update favorite." });
      } finally {
        setSkeletonRecipeId(null);
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
    skeletonRecipeId,
    onFavoritePress,
    shareRecipe,
    toast,
    dismissToast,
  };
}
