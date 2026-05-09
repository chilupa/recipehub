import { createContext } from "react";
import type { Recipe } from "../../types/Recipe";
import type { RecipeSubmitPayload } from "../../components/RecipeForm/recipeFormModel";

export interface RecipeContextType {
  recipes: Recipe[];
  /** True while the first page for the signed-in user is loading. */
  recipesLoading: boolean;
  /** More pages available for the main list (infinite scroll). */
  hasMoreRecipes: boolean;
  /** Re-fetch the first page for pull-to-refresh. */
  refreshRecipes: () => Promise<void>;
  loadMoreRecipes: () => Promise<void>;
  /** Fetch a recipe by id and merge into `recipes` if missing (detail / edit deep links). */
  ensureRecipeLoaded: (id: string) => Promise<boolean>;
  favoriteRecipes: Recipe[];
  favoritesLoading: boolean;
  refreshFavorites: (options?: { withSpinner?: boolean }) => Promise<void>;
  /** Total recipes visible under RLS (for profile); null until first load. */
  recipesTotalCount: number | null;
  addRecipe: (recipe: RecipeSubmitPayload) => Promise<void>;
  updateRecipe: (id: string, updates: RecipeSubmitPayload) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  shareRecipe: (recipe: Recipe) => Promise<void>;
}

export const RecipeContext = createContext<RecipeContextType | undefined>(
  undefined,
);
