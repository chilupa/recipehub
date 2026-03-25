import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
import { Recipe, NewRecipe } from "../types/Recipe";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import {
  type RecipeRow,
  rowToRecipe,
  enrichRecipeRows,
  fetchRecipeById,
  fetchFavoriteRecipesList,
  fetchVisibleRecipeCount,
} from "../lib/recipeSupabase";
import { GUEST_VIEWER_ID } from "../lib/guestBrowse";

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
  addRecipe: (recipe: NewRecipe) => Promise<void>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  shareRecipe: (recipe: Recipe) => Promise<void>;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";
const MOCK_RECIPES_KEY = "recipe-logger-recipes";
const MAX_TAGS = 5;
const PAGE_SIZE = 10;
const shareWebBaseUrl = (import.meta.env.VITE_SHARE_WEB_BASE_URL ?? "").trim();
const appDownloadUrl = (import.meta.env.VITE_APP_DOWNLOAD_URL ?? "").trim();

const readAllMockRecipes = (): Recipe[] => {
  try {
    const stored = localStorage.getItem(MOCK_RECIPES_KEY);
    const all = stored ? (JSON.parse(stored) as Recipe[]) : [];
    return Array.isArray(all) ? all : [];
  } catch {
    return [];
  }
};

const writeAllMockRecipes = (all: Recipe[]) => {
  try {
    localStorage.setItem(MOCK_RECIPES_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
};

const getRecipeShareUrl = (recipeId: string): string => {
  if (shareWebBaseUrl) {
    const base = shareWebBaseUrl.replace(/\/+$/, "");
    // Public web URL (e.g. Netlify with `/*` → `/index.html`). Works with client-side routing.
    return `${base}/recipes/recipe/${encodeURIComponent(recipeId)}`;
  }
  if (appDownloadUrl) return appDownloadUrl;
  return window.location.href;
};

const seedMockRecipesForUser = (u: {
  id: string;
  name?: string;
  email?: string;
}) => {
  const now = new Date().toISOString();
  const author = u.name || u.email || "You";

  const mk = (
    idx: number,
    title: string,
    description: string,
    tags: string[],
  ): Recipe => ({
    id: `mock-${u.id}-${Date.now()}-${idx}`,
    userId: u.id,
    title,
    description,
    ingredients: ["1 cup ingredient", "2 tbsp ingredient", "to taste salt"],
    instructions: ["Mix ingredients", "Cook until done", "Serve and enjoy"],
    prepTime: 10 + idx * 2,
    cookTime: 15 + idx * 3,
    servings: 2 + idx,
    tags: tags.slice(0, MAX_TAGS),
    createdAt: now,
    updatedAt: now,
    likes: idx === 0 ? 3 : 0,
    isLiked: idx === 0,
    author,
  });

  return [
    mk(
      1,
      "Crispy Chickpea Bowl",
      "A crunchy, spicy bowl you can make in under 30 minutes.",
      ["quick", "high-protein", "vegan"],
    ),
    mk(
      2,
      "Garlic Lemon Pasta",
      "Bright lemon + garlic flavor with a silky sauce.",
      ["comfort", "pasta", "easy"],
    ),
  ];
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
      if (useMockData) {
        const favs = readAllMockRecipes()
          .filter((r) => r.isLiked)
          .slice()
          .sort((a, b) =>
            (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
          );
        setFavoriteRecipes(favs);
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
      if (useMockData) {
        const all = readAllMockRecipes();
        if (user) {
          let userRecipes = all.filter((r) => r.userId === user.id);

          if (userRecipes.length === 0) {
            userRecipes = seedMockRecipesForUser(user);
            writeAllMockRecipes([...(all ?? []), ...userRecipes]);
          }

          const sorted = userRecipes
            .slice()
            .sort((a, b) =>
              (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
            );
          if (gen !== loadGenerationRef.current) return;

          const first = sorted.slice(0, PAGE_SIZE);
          setRecipes(first);
          setHasMoreRecipes(sorted.length > PAGE_SIZE);
          setRecipesTotalCount(sorted.length);
          return;
        }

        const sorted = all
          .slice()
          .sort((a, b) =>
            (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
          );
        if (gen !== loadGenerationRef.current) return;

        const first = sorted.slice(0, PAGE_SIZE);
        setRecipes(first);
        setHasMoreRecipes(sorted.length > PAGE_SIZE);
        setRecipesTotalCount(sorted.length);
        return;
      }

      try {
        const [countRes, pageRes] = await Promise.all([
          fetchVisibleRecipeCount(),
          supabase
            .from("recipes")
            .select("*")
            .order("created_at", { ascending: false })
            .range(0, PAGE_SIZE - 1),
        ]);

        if (gen !== loadGenerationRef.current) return;

        setRecipesTotalCount(countRes);

        if (pageRes.error) {
          console.error("Error loading recipes:", pageRes.error);
          setRecipes([]);
          setHasMoreRecipes(false);
          return;
        }

        const recipeList = (pageRes.data ?? []) as RecipeRow[];
        if (recipeList.length === 0) {
          setRecipes([]);
          setHasMoreRecipes(false);
          return;
        }

        const list = await enrichRecipeRows(recipeList, viewerId);
        if (gen !== loadGenerationRef.current) return;

        setRecipes(list);
        setHasMoreRecipes(recipeList.length === PAGE_SIZE);
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

    if (useMockData) {
      loadingMoreRef.current = true;
      try {
        const all = readAllMockRecipes().filter((r) =>
          user ? r.userId === user.id : true,
        );
        const sorted = all
          .slice()
          .sort((a, b) =>
            (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
          );
        const offset = recipesRef.current.length;
        const next = sorted.slice(offset, offset + PAGE_SIZE);
        setRecipes((prev) => [...prev, ...next]);
        setHasMoreRecipes(offset + next.length < sorted.length);
      } finally {
        loadingMoreRef.current = false;
      }
      return;
    }

    loadingMoreRef.current = true;
    const offset = recipesRef.current.length;

    try {
      const { data: rows, error } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        console.error("Error loading more recipes:", error);
        return;
      }

      const recipeList = (rows ?? []) as RecipeRow[];
      if (recipeList.length === 0) {
        setHasMoreRecipes(false);
        return;
      }

      const list = await enrichRecipeRows(recipeList, viewerId);
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
      setHasMoreRecipes(recipeList.length === PAGE_SIZE);
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

      if (useMockData) {
        const r = readAllMockRecipes().find((x) => x.id === id);
        if (r) {
          setRecipes((prev) => upsertRecipeSorted(prev, r));
          return true;
        }
        return false;
      }

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
    void loadFavorites();
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

  const addRecipe = async (newRecipe: NewRecipe) => {
    if (!user) return;

    if (useMockData) {
      const all = readAllMockRecipes();
      const recipe: Recipe = {
        id: Date.now().toString(),
        title: newRecipe.title.trim(),
        description: newRecipe.description.trim() || "",
        ingredients: newRecipe.ingredients,
        instructions: newRecipe.instructions,
        prepTime: newRecipe.prepTime ?? 0,
        cookTime: newRecipe.cookTime ?? 0,
        servings: newRecipe.servings ?? 0,
        tags: newRecipe.tags ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        author: user.name || user.email || "You",
        userId: user.id,
      };

      writeAllMockRecipes([recipe, ...all]);
      setRecipes((prev) => [recipe, ...prev]);
      setRecipesTotalCount((c) => (c ?? 0) + 1);
      return;
    }

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
        })
        .select()
        .single();

      if (error) throw error;
      const row = inserted as RecipeRow;
      const recipe = rowToRecipe(row, user.name ?? "Chef", 0, false);
      setRecipes((prev) => [recipe, ...prev]);
      setRecipesTotalCount((c) => (c ?? 0) + 1);
    } catch (error) {
      console.error("Error adding recipe:", error);
      throw error;
    }
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    if (!user) return;

    if (useMockData) {
      const all = readAllMockRecipes();
      const updatedAt = new Date().toISOString();
      const nextAll = all.map((r) =>
        r.id === id && r.userId === user.id
          ? {
              ...r,
              ...updates,
              updatedAt,
              author: user.name || user.email || r.author,
            }
          : r,
      );

      writeAllMockRecipes(nextAll);
      const patch = (r: Recipe) =>
        r.id === id ? { ...r, ...updates, updatedAt } : r;
      setRecipes((prev) => prev.map(patch));
      setFavoriteRecipes((prev) => prev.map(patch));
      return;
    }

    try {
      const payload: Record<string, unknown> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined)
        payload.description = updates.description;
      if (updates.ingredients !== undefined)
        payload.ingredients = updates.ingredients;
      if (updates.instructions !== undefined)
        payload.instructions = updates.instructions;
      if (updates.prepTime !== undefined) payload.prep_time = updates.prepTime;
      if (updates.cookTime !== undefined) payload.cook_time = updates.cookTime;
      if (updates.servings !== undefined) payload.servings = updates.servings;
      if (updates.tags !== undefined) payload.tags = updates.tags;

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
              ...updates,
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

    if (useMockData) {
      const all = readAllMockRecipes();
      const nextAll = all.filter((r) => !(r.id === id && r.userId === user.id));
      writeAllMockRecipes(nextAll);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setFavoriteRecipes((prev) => prev.filter((r) => r.id !== id));
      setRecipesTotalCount((c) => Math.max(0, (c ?? 1) - 1));
      return;
    }

    try {
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
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
    if (!recipe && !useMockData) {
      recipe = (await fetchRecipeById(id, user.id)) ?? undefined;
    }
    if (!recipe && useMockData) {
      recipe = readAllMockRecipes().find((r) => r.id === id);
    }
    if (!recipe) return;

    const isFav = recipe.isLiked;
    const optimisticRecipe: Recipe = {
      ...recipe,
      isLiked: !isFav,
      likes: !isFav ? recipe.likes + 1 : Math.max(0, recipe.likes - 1),
    };

    if (useMockData) {
      const all = readAllMockRecipes();
      const nextAll = all.map((r) => {
        if (r.id !== id) return r;
        const nextLiked = !r.isLiked;
        const nextLikes = nextLiked ? r.likes + 1 : Math.max(0, r.likes - 1);
        return {
          ...r,
          isLiked: nextLiked,
          likes: nextLikes,
          updatedAt: new Date().toISOString(),
        };
      });
      writeAllMockRecipes(nextAll);
      setRecipes((prev) => replaceRecipePreservingOrder(prev, optimisticRecipe));
      void loadFavorites({ withSpinner: false });
      return;
    }

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
      void loadFavorites({ withSpinner: false });
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

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipeDescription}${installLine}`,
          url: shareUrl,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      const shareText = `${recipe.title}\n\n${recipeDescription}\n\nIngredients:\n${recipe.ingredients.join("\n")}\n\nInstructions:\n${recipe.instructions.join("\n")}`;
      await navigator.clipboard.writeText(shareText);
      alert("Recipe copied to clipboard!");
    }
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
