import type { FC, ReactNode } from "react";
import { useAuth } from "../AuthContext";
import { RecipeContext } from "./recipeContextTypes";
import { useRecipeCrudMutations } from "./useRecipeCrudMutations";
import { useRecipeFavorites } from "./useRecipeFavorites";
import { useRecipeFeed } from "./useRecipeFeed";
import { useRecipeProfileUpdatedSync } from "./useRecipeProfileUpdatedSync";
import { useRecipeSocialMutations } from "./useRecipeSocialMutations";

export const RecipeProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user, isGuest } = useAuth();
  const canLoadFeed = Boolean(user || isGuest);

  const {
    favoriteRecipes,
    setFavoriteRecipes,
    favoritesLoading,
    refreshFavorites,
    clearFavorites,
  } = useRecipeFavorites(user);

  const {
    recipes,
    setRecipes,
    recipesLoading,
    hasMoreRecipes,
    recipesTotalCount,
    setRecipesTotalCount,
    recipesRef,
    refreshRecipes,
    loadMoreRecipes,
    ensureRecipeLoaded,
  } = useRecipeFeed(user, isGuest, canLoadFeed, clearFavorites);

  useRecipeProfileUpdatedSync(setRecipes, setFavoriteRecipes);

  const { addRecipe, updateRecipe, deleteRecipe } = useRecipeCrudMutations(
    user,
    setRecipes,
    setFavoriteRecipes,
    setRecipesTotalCount,
  );

  const { toggleFavorite, shareRecipe } = useRecipeSocialMutations(
    user,
    setRecipes,
    setFavoriteRecipes,
    recipesRef,
    refreshFavorites,
  );

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        recipesLoading,
        hasMoreRecipes,
        refreshRecipes,
        loadMoreRecipes,
        ensureRecipeLoaded,
        favoriteRecipes,
        favoritesLoading,
        refreshFavorites,
        recipesTotalCount,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        toggleFavorite,
        shareRecipe,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};
