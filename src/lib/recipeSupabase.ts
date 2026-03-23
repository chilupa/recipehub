import { supabase } from "./supabase";
import type { Recipe } from "../types/Recipe";

export type RecipeRow = {
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

export function rowToRecipe(
  row: RecipeRow,
  author: string,
  likes: number,
  isLiked: boolean,
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

/** Hydrate DB rows with author names and favorite counts for the current user. */
export async function enrichRecipeRows(
  recipeList: RecipeRow[],
  userId: string,
): Promise<Recipe[]> {
  if (recipeList.length === 0) return [];

  const userIds = [...new Set(recipeList.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.display_name ?? "Chef"]),
  );

  const recipeIds = recipeList.map((r) => r.id);

  const { data: favRows } = await supabase
    .from("favorites")
    .select("recipe_id")
    .in("recipe_id", recipeIds);

  const { data: userFavRows } = await supabase
    .from("favorites")
    .select("recipe_id")
    .eq("user_id", userId)
    .in("recipe_id", recipeIds);

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

  return recipeList.map((row) =>
    rowToRecipe(
      row,
      profileMap.get(row.user_id) ?? "Chef",
      favoriteCounts.get(row.id) ?? 0,
      userFavoriteIds.has(row.id),
    ),
  );
}

export async function fetchRecipeById(
  recipeId: string,
  userId: string,
): Promise<Recipe | null> {
  const { data: row, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .maybeSingle();

  if (error || !row) return null;
  const list = await enrichRecipeRows([row as RecipeRow], userId);
  return list[0] ?? null;
}

export async function fetchFavoriteRecipesList(
  userId: string,
): Promise<Recipe[]> {
  const { data: favRows, error: favErr } = await supabase
    .from("favorites")
    .select("recipe_id")
    .eq("user_id", userId);

  if (favErr || !favRows?.length) return [];

  const ids = favRows.map((f) => f.recipe_id);
  const { data: rows, error: rowErr } = await supabase
    .from("recipes")
    .select("*")
    .in("id", ids)
    .order("created_at", { ascending: false });

  if (rowErr || !rows?.length) return [];
  return enrichRecipeRows(rows as RecipeRow[], userId);
}

export async function fetchVisibleRecipeCount(): Promise<number> {
  const { count, error } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true });

  if (error) return 0;
  return count ?? 0;
}

export async function fetchRecipesByTag(
  tag: string,
  userId: string,
): Promise<Recipe[]> {
  const trimmed = tag.trim();
  if (!trimmed) return [];

  const { data: rows, error } = await supabase
    .from("recipes")
    .select("*")
    .contains("tags", JSON.stringify([trimmed]))
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("fetchRecipesByTag:", error);
    return [];
  }
  if (!rows?.length) return [];
  return enrichRecipeRows(rows as RecipeRow[], userId);
}
