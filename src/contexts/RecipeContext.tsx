import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
import { Recipe } from "../types/Recipe";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import {
  type RecipeRow,
  rowToRecipe,
  fetchRecipeById,
  fetchFavoriteRecipesList,
  fetchVisibleRecipeCount,
  fetchFeedRecipesPage,
} from "../lib/recipeSupabase";
import {
  deleteRecipeCoverObject,
  uploadRecipeCover,
} from "../lib/recipeImageStorage";
import type { RecipeSubmitPayload } from "../components/RecipeForm/recipeFormModel";
import { GUEST_VIEWER_ID } from "../lib/guestBrowse";
import { playFavoriteToggleHaptics } from "../lib/playFavoriteToggleHaptics";

interface RecipeContextType {
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

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

const PAGE_SIZE = 10;
const shareWebBaseUrl = (import.meta.env.VITE_SHARE_WEB_BASE_URL ?? "").trim();
const appDownloadUrl = (import.meta.env.VITE_APP_DOWNLOAD_URL ?? "").trim();

const getRecipeShareUrl = (recipeId: string): string => {
  if (shareWebBaseUrl) {
    const base = shareWebBaseUrl.replace(/\/+$/, "");
    return `${base}/recipes/recipe/${encodeURIComponent(recipeId)}`;
  }
  if (appDownloadUrl) return appDownloadUrl;
  return window.location.href;
};

function upsertRecipeSorted(prev: Recipe[], updated: Recipe): Recipe[] {
  const others = prev.filter((r) => r.id !== updated.id);
  return [...others, updated].sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
  );
}

/** Update one recipe without re-sorting (feed order must stay stable when only likes change). */
function replaceRecipePreservingOrder(prev: Recipe[], updated: Recipe): Recipe[] {
  const i = prev.findIndex((r) => r.id === updated.id);
  if (i === -1) return upsertRecipeSorted(prev, updated);
  const next = prev.slice();
  next[i] = updated;
  return next;
}

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isGuest } = useAuth();
  const canLoadFeed = Boolean(user || isGuest);
  const viewerId = user?.id ?? GUEST_VIEWER_ID;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [hasMoreRecipes, setHasMoreRecipes] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [recipesTotalCount, setRecipesTotalCount] = useState<number | null>(
    null,
  );

  const loadGenerationRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const recipesRef = useRef<Recipe[]>([]);
  recipesRef.current = recipes;

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

  const loadRecipes = useCallback(async () => {
    const gen = ++loadGenerationRef.current;

    if (!canLoadFeed) {
      setRecipes([]);
      setHasMoreRecipes(false);
      setRecipesLoading(false);
      setRecipesTotalCount(null);
      setFavoriteRecipes([]);
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
  }, [user, canLoadFeed, viewerId]);

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
    loadRecipes();
  }, [loadRecipes]);

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

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ userId: string; displayName: string }>)
        .detail;
      if (!detail?.userId) return;
      const upd = (r: Recipe) =>
        r.userId === detail.userId
          ? { ...r, author: detail.displayName }
          : r;
      setRecipes((prev) => prev.map(upd));
      setFavoriteRecipes((prev) => prev.map(upd));
    };

    window.addEventListener("profile:updated", handler as EventListener);
    return () =>
      window.removeEventListener("profile:updated", handler as EventListener);
  }, []);

  const addRecipe = async (payload: RecipeSubmitPayload) => {
    if (!user) return;

    const { coverFile, removeCover: _removeCover, ...newRecipe } = payload;

    try {
      const { data: inserted, error } = await supabase
        .from("recipes")
        .insert({
          user_id: user.id,
          title: newRecipe.title.trim(),
          description: newRecipe.description.trim() || null,
          ingredients: newRecipe.ingredients,
          instructions: newRecipe.instructions,
          prep_time: newRecipe.prepTime ?? 0,
          cook_time: newRecipe.cookTime ?? 0,
          servings: newRecipe.servings ?? 0,
          tags: newRecipe.tags ?? [],
          image_url: newRecipe.image?.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;
      const row = inserted as RecipeRow;

      let imageUrl = row.image_url?.trim() || undefined;
      if (coverFile) {
        imageUrl = await uploadRecipeCover(user.id, row.id, coverFile);
        const { error: imgErr } = await supabase
          .from("recipes")
          .update({ image_url: imageUrl })
          .eq("id", row.id)
          .eq("user_id", user.id);
        if (imgErr) throw imgErr;
      }

      const recipe = rowToRecipe(
        { ...row, image_url: imageUrl ?? null },
        user.name ?? "Chef",
        0,
        false,
        0,
      );
      setRecipes((prev) => [recipe, ...prev]);
      setRecipesTotalCount((c) => (c ?? 0) + 1);
    } catch (error) {
      console.error("Error adding recipe:", error);
      throw error;
    }
  };

  const updateRecipe = async (id: string, data: RecipeSubmitPayload) => {
    if (!user) return;

    const { coverFile, removeCover, ...recipe } = data;

    try {
      const payload: Record<string, unknown> = {
        title: recipe.title.trim(),
        description: recipe.description.trim() || null,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prep_time: recipe.prepTime ?? 0,
        cook_time: recipe.cookTime ?? 0,
        servings: recipe.servings ?? 0,
        tags: recipe.tags ?? [],
      };

      if (coverFile) {
        payload.image_url = await uploadRecipeCover(user.id, id, coverFile);
      } else if (removeCover) {
        await deleteRecipeCoverObject(user.id, id);
        payload.image_url = null;
      }

      const { error } = await supabase
        .from("recipes")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      const ts = new Date().toISOString();
      const patch = (r: Recipe) =>
        r.id === id
          ? {
              ...r,
              title: recipe.title,
              description: recipe.description,
              ingredients: recipe.ingredients,
              instructions: recipe.instructions,
              prepTime: recipe.prepTime ?? 0,
              cookTime: recipe.cookTime ?? 0,
              servings: recipe.servings ?? 0,
              tags: recipe.tags ?? [],
              image: (() => {
                if (coverFile) return String(payload.image_url ?? "");
                if (removeCover) return undefined;
                return r.image;
              })(),
              updatedAt: ts,
            }
          : r;
      setRecipes((prev) => prev.map(patch));
      setFavoriteRecipes((prev) => prev.map(patch));
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  };

  const deleteRecipe = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      await deleteRecipeCoverObject(user.id, id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setFavoriteRecipes((prev) => prev.filter((r) => r.id !== id));
      setRecipesTotalCount((c) => Math.max(0, (c ?? 1) - 1));
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  };

  const toggleFavorite = async (id: string) => {
    if (!user) return;

    let recipe = recipesRef.current.find((r) => r.id === id);
    if (!recipe) {
      recipe = (await fetchRecipeById(id, user.id)) ?? undefined;
    }
    if (!recipe) {
      console.warn("toggleFavorite: recipe not found", id);
      throw new Error("Recipe not found");
    }

    const isFav = recipe.isLiked;
    const optimisticRecipe: Recipe = {
      ...recipe,
      isLiked: !isFav,
      likes: !isFav ? recipe.likes + 1 : Math.max(0, recipe.likes - 1),
    };

    // Optimistic UI: reflect heart/count immediately, then persist server-side.
    setRecipes((prev) => replaceRecipePreservingOrder(prev, optimisticRecipe));

    try {
      if (isFav) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", id);
      } else {
        await supabase.from("favorites").insert({
          user_id: user.id,
          recipe_id: id,
        });
        if (recipe.userId !== user.id) {
          const { error: notifyErr } = await supabase
            .from("notifications")
            .insert({
              user_id: recipe.userId,
              actor_id: user.id,
              recipe_id: id,
              type: "favorite",
            });
          if (notifyErr) {
            console.warn("Could not create favorite notification:", notifyErr);
          }
        }
      }
      await loadFavorites({ withSpinner: false });
      void playFavoriteToggleHaptics();
    } catch (error) {
      // Revert optimistic state if write fails.
      setRecipes((prev) => replaceRecipePreservingOrder(prev, recipe));
      console.error("Error toggling favorite:", error);
      throw error;
    }
  };

  const shareRecipe = async (recipe: Recipe) => {
    const shareUrl = getRecipeShareUrl(recipe.id);
    const recipeDescription = recipe.description?.trim() || "Open this recipe in RecipeHub.";
    const installLine = appDownloadUrl
      ? `\n\nGet RecipeHub: ${appDownloadUrl}`
      : "";

    let completed = false;

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipeDescription}${installLine}`,
          url: shareUrl,
        });
        completed = true;
      } catch (error: unknown) {
        const name =
          error &&
          typeof error === "object" &&
          "name" in error &&
          typeof (error as { name?: unknown }).name === "string"
            ? (error as { name: string }).name
            : "";
        if (name === "AbortError") return;
        console.log("Error sharing:", error);
        return;
      }
    } else {
      try {
        const shareText = `${recipe.title}\n\n${recipeDescription}\n\nIngredients:\n${recipe.ingredients.join("\n")}\n\nInstructions:\n${recipe.instructions.join("\n")}`;
        await navigator.clipboard.writeText(shareText);
        alert("Recipe copied to clipboard!");
        completed = true;
      } catch {
        return;
      }
    }

    if (!completed || !user) return;

    const { error } = await supabase.from("recipe_shares").insert({
      user_id: user.id,
      recipe_id: recipe.id,
    });

    if (error) {
      if (error.code === "23505") return;
      console.warn("Could not record share:", error);
      return;
    }

    const prevCount = recipe.shareCount ?? 0;
    const bumped: Recipe = { ...recipe, shareCount: prevCount + 1 };
    setRecipes((prev) => replaceRecipePreservingOrder(prev, bumped));
    setFavoriteRecipes((prev) =>
      prev.map((r) => (r.id === recipe.id ? bumped : r)),
    );
  };

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        recipesLoading,
        hasMoreRecipes,
        refreshRecipes: loadRecipes,
        loadMoreRecipes,
        ensureRecipeLoaded,
        favoriteRecipes,
        favoritesLoading,
        refreshFavorites: (options) => loadFavorites(options),
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

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipes must be used within RecipeProvider");
  }
  return context;
};
