import { useCallback, useEffect, useState } from "react";
import type { User } from "../contexts/AuthContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useRecipes } from "../contexts/RecipeContext";
import {
  emptyDeleteRecipeAlertState,
  emptyRecipeMenuPopoverState,
} from "../lib/recipeListOwnerState";
import type {
  DeleteRecipeAlertState,
  RecipeMenuPopoverState,
} from "../lib/recipeListOwnerState";
import type { Recipe } from "../types/Recipe";

const FAVORITE_ERROR = "Could not update favorite.";

export type RecipeFilterListPageController = {
  recipes: Recipe[];
  loading: boolean;
  load: () => Promise<void>;
  user: User | null;
  shareRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  deleteAlert: DeleteRecipeAlertState;
  dismissDeleteAlert: () => void;
  popoverOpen: RecipeMenuPopoverState;
  dismissPopover: () => void;
  openPopover: (event: Event, recipeId: string) => void;
  requestDelete: (recipeId: string, recipeName: string) => void;
  favoriteRecipe: (recipeId: string) => Promise<void>;
  showErrorToast: (message: string) => void;
};

export function useRecipeFilterListPage(
  fetchRecipes: () => Promise<Recipe[]>,
): RecipeFilterListPageController {
  const { user } = useAuth();
  const { toggleFavorite, shareRecipe, deleteRecipe } = useRecipes();
  const { showErrorToast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteAlert, setDeleteAlert] = useState<DeleteRecipeAlertState>(
    emptyDeleteRecipeAlertState,
  );
  const [popoverOpen, setPopoverOpen] = useState<RecipeMenuPopoverState>(
    emptyRecipeMenuPopoverState,
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchRecipes();
      setRecipes(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [fetchRecipes]);

  useEffect(() => {
    void load();
  }, [load]);

  const dismissDeleteAlert = useCallback(
    () => setDeleteAlert(emptyDeleteRecipeAlertState),
    [],
  );

  const dismissPopover = useCallback(
    () => setPopoverOpen(emptyRecipeMenuPopoverState),
    [],
  );

  const openPopover = useCallback((event: Event, recipeId: string) => {
    setPopoverOpen({ isOpen: true, event, recipeId });
  }, []);

  const requestDelete = useCallback(
    (recipeId: string, recipeName: string) =>
      setDeleteAlert({
        isOpen: true,
        recipeId,
        recipeName,
      }),
    [],
  );

  const favoriteRecipe = useCallback(
    async (recipeId: string) => {
      if (!user) return;
      try {
        await toggleFavorite(recipeId);
        // Feed context gets optimistic updates; this page keeps its own list copy.
        setRecipes((prev) => {
          const r = prev.find((x) => x.id === recipeId);
          if (!r) return prev;
          const isLiked = !r.isLiked;
          const likes = r.isLiked ? Math.max(0, r.likes - 1) : r.likes + 1;
          return prev.map((item) =>
            item.id === recipeId ? { ...item, isLiked, likes } : item,
          );
        });
      } catch {
        showErrorToast(FAVORITE_ERROR);
      }
    },
    [toggleFavorite, showErrorToast, user],
  );

  return {
    recipes,
    loading,
    load,
    user,
    shareRecipe,
    deleteRecipe,
    deleteAlert,
    dismissDeleteAlert,
    popoverOpen,
    dismissPopover,
    openPopover,
    requestDelete,
    favoriteRecipe,
    showErrorToast,
  };
}
