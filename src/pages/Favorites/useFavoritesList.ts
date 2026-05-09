import { useCallback, useState } from "react";
import { useRecipes } from "../../contexts/RecipeContext";
import { useToast } from "../../contexts/ToastContext";

export function useFavoritesList() {
  const { favoriteRecipes, favoritesLoading, toggleFavorite, shareRecipe } =
    useRecipes();
  const { showErrorToast } = useToast();
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
        showErrorToast("Could not update favorite.");
      } finally {
        setSkeletonRecipeId(null);
      }
    },
    [toggleFavorite, showErrorToast],
  );

  return {
    favoriteRecipes,
    favoritesLoading,
    skeletonRecipeId,
    onFavoritePress,
    shareRecipe,
  };
}
