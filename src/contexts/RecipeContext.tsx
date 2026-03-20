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

interface RecipeContextType {
  recipes: Recipe[];
  /** True while the first fetch for the signed-in user is in flight (avoids empty-state flash). */
  recipesLoading: boolean;
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

const seedMockRecipesForUser = (u: { id: string; name?: string; email?: string }) => {
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

type RecipeRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  tags: string[];
  created_at: string;
  updated_at: string;
};

function rowToRecipe(
  row: RecipeRow,
  author: string,
  likes: number,
  isLiked: boolean
): Recipe {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? "",
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
    instructions: Array.isArray(row.instructions) ? row.instructions : [],
    prepTime: row.prep_time ?? 0,
    cookTime: row.cook_time ?? 0,
    servings: row.servings ?? 0,
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    likes,
    isLiked,
    author,
  };
}

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const loadGenerationRef = useRef(0);

  const loadRecipes = useCallback(async () => {
    const gen = ++loadGenerationRef.current;

    if (!user) {
      setRecipes([]);
      setRecipesLoading(false);
      return;
    }

    setRecipesLoading(true);

    try {
      if (useMockData) {
        const all = readAllMockRecipes();
        let userRecipes = all.filter((r) => r.userId === user.id);

        // Seed once per user if localStorage is empty.
        if (userRecipes.length === 0) {
          userRecipes = seedMockRecipesForUser(user);
          writeAllMockRecipes([...(all ?? []), ...userRecipes]);
        }

        // Sort newest first for a nice default ordering.
        userRecipes = userRecipes
          .slice()
          .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
        if (gen !== loadGenerationRef.current) return;
        setRecipes(userRecipes);
        return;
      }

      try {
        const { data: rows, error: recipesError } = await supabase
          .from("recipes")
          .select("*")
          .order("created_at", { ascending: false });

        if (gen !== loadGenerationRef.current) return;

        if (recipesError) {
          console.error("Error loading recipes:", recipesError);
          setRecipes([]);
          return;
        }

        const recipeList = (rows ?? []) as RecipeRow[];
        if (recipeList.length === 0) {
          setRecipes([]);
          return;
        }

        const userIds = [...new Set(recipeList.map((r) => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", userIds);

        if (gen !== loadGenerationRef.current) return;

        const profileMap = new Map(
          (profiles ?? []).map((p) => [p.id, p.display_name ?? "Chef"])
        );

        const recipeIds = recipeList.map((r) => r.id);

        // Only fetch favorites relevant to the current recipes list.
        // This keeps the query fast as the favorites table grows.
        const { data: favRows } = await supabase
          .from("favorites")
          .select("recipe_id")
          .in("recipe_id", recipeIds);

        const { data: userFavRows } = await supabase
          .from("favorites")
          .select("recipe_id")
          .eq("user_id", user.id)
          .in("recipe_id", recipeIds);

        if (gen !== loadGenerationRef.current) return;

        const favoriteCounts = new Map<string, number>();
        const userFavoriteIds = new Set<string>();
        (favRows ?? []).forEach((f: { recipe_id: string }) => {
          favoriteCounts.set(
            f.recipe_id,
            (favoriteCounts.get(f.recipe_id) ?? 0) + 1,
          );
        });
        (userFavRows ?? []).forEach((f: { recipe_id: string }) => {
          userFavoriteIds.add(f.recipe_id);
        });

        const list = recipeList.map((row) =>
          rowToRecipe(
            row,
            profileMap.get(row.user_id) ?? "Chef",
            favoriteCounts.get(row.id) ?? 0,
            userFavoriteIds.has(row.id)
          )
        );
        if (gen !== loadGenerationRef.current) return;
        setRecipes(list);
      } catch (error) {
        console.error("Error loading recipes:", error);
        if (gen !== loadGenerationRef.current) return;
        setRecipes([]);
      }
    } finally {
      if (gen === loadGenerationRef.current) {
        setRecipesLoading(false);
      }
    }
  }, [user?.id]);

  /** Before first paint with a signed-in user, avoid treating empty `recipes` as “no data yet”. */
  useLayoutEffect(() => {
    if (user?.id) {
      setRecipesLoading(true);
    }
  }, [user?.id]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Keep already-loaded recipe authors in sync when the user updates their profile.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ userId: string; displayName: string }>).detail;
      if (!detail?.userId) return;
      setRecipes((prev) =>
        prev.map((r) =>
          r.userId === detail.userId ? { ...r, author: detail.displayName } : r,
        ),
      );
    };

    window.addEventListener("profile:updated", handler as EventListener);
    return () => window.removeEventListener("profile:updated", handler as EventListener);
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
      const recipe = rowToRecipe(row, user.name, 0, false);
      setRecipes((prev) => [recipe, ...prev]);
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
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, ...updates, updatedAt } : r,
        ),
      );
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
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
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
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  };

  const toggleFavorite = async (id: string) => {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe || !user) return;

    const isFav = recipe.isLiked;

    if (useMockData) {
      const all = readAllMockRecipes();
      const nextAll = all.map((r) => {
        if (r.id !== id || r.userId !== user.id) return r;
        const nextLiked = !r.isLiked;
        const nextLikes = nextLiked ? r.likes + 1 : Math.max(0, r.likes - 1);
        return { ...r, isLiked: nextLiked, likes: nextLikes, updatedAt: new Date().toISOString() };
      });
      writeAllMockRecipes(nextAll);
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                isLiked: !isFav,
                likes: !isFav ? r.likes + 1 : Math.max(0, r.likes - 1),
              }
            : r,
        ),
      );
      return;
    }

    try {
      if (isFav) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", id);
        setRecipes((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  isLiked: false,
                  likes: Math.max(0, r.likes - 1),
                }
              : r
          )
        );
      } else {
        await supabase.from("favorites").insert({
          user_id: user.id,
          recipe_id: id,
        });
        setRecipes((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, isLiked: true, likes: r.likes + 1 }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  };

  const shareRecipe = async (recipe: Recipe) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipe.description}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      const shareText = `${recipe.title}\n\n${recipe.description}\n\nIngredients:\n${recipe.ingredients.join("\n")}\n\nInstructions:\n${recipe.instructions.join("\n")}`;
      await navigator.clipboard.writeText(shareText);
      alert("Recipe copied to clipboard!");
    }
  };

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        recipesLoading,
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
