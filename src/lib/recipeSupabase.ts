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

type ProfileDisplayNameRow = {
  id: string;
  display_name: string | null;
};

type FavoriteRecipeIdRow = {
  recipe_id: string;
};

function toRecipeRows(data: unknown): RecipeRow[] {
  return Array.isArray(data) ? (data as RecipeRow[]) : [];
}

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

  const profileRows = (profiles ?? []) as ProfileDisplayNameRow[];
  const profileMap = new Map(profileRows.map((p) => [p.id, p.display_name ?? "Chef"]));

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
  const allFavoriteRows = (favRows ?? []) as FavoriteRecipeIdRow[];
  const userFavoriteRows = (userFavRows ?? []) as FavoriteRecipeIdRow[];

  allFavoriteRows.forEach((f) => {
    favoriteCounts.set(
      f.recipe_id,
      (favoriteCounts.get(f.recipe_id) ?? 0) + 1,
    );
  });
  userFavoriteRows.forEach((f) => {
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

  const favoriteRows = favRows as FavoriteRecipeIdRow[];
  const ids = favoriteRows.map((f) => f.recipe_id);
  const { data: rows, error: rowErr } = await supabase
    .from("recipes")
    .select("*")
    .in("id", ids)
    .order("created_at", { ascending: false });

  if (rowErr || !rows?.length) return [];
  return enrichRecipeRows(toRecipeRows(rows), userId);
}

export async function fetchVisibleRecipeCount(): Promise<number> {
  const { count, error } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true });

  if (error) return 0;
  return count ?? 0;
}

/** All recipes owned by `ownerId`, visible to `viewerId` under RLS (typically the same user). */
export async function fetchRecipesOwnedByUser(
  ownerId: string,
  viewerId: string,
): Promise<Recipe[]> {
  if (!ownerId.trim()) return [];

  const { data: rows, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("fetchRecipesOwnedByUser:", error);
    return [];
  }
  if (!rows?.length) return [];
  return enrichRecipeRows(toRecipeRows(rows), viewerId);
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
  return enrichRecipeRows(toRecipeRows(rows), userId);
}

export async function fetchRecipesByServings(
  servings: number,
  userId: string,
): Promise<Recipe[]> {
  if (!Number.isFinite(servings) || servings <= 0) return [];

  const { data: rows, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("servings", servings)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("fetchRecipesByServings:", error);
    return [];
  }
  if (!rows?.length) return [];
  return enrichRecipeRows(toRecipeRows(rows), userId);
}

export async function fetchRecipesByTotalMinutes(
  totalMinutes: number,
  userId: string,
): Promise<Recipe[]> {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return [];

  const { data, error } = await supabase.rpc("recipes_with_total_minutes", {
    p_total: Math.floor(totalMinutes),
  });

  if (error) {
    console.error("fetchRecipesByTotalMinutes:", error);
    return [];
  }
  const rows = toRecipeRows(data);
  if (rows.length === 0) return [];
  return enrichRecipeRows(rows, userId);
}

type SearchRecipesEnrichedRpcRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  ingredients: unknown;
  instructions: unknown;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  tags: unknown;
  created_at: string;
  updated_at: string;
  author: string | null;
  likes: number | string | null;
  is_liked: boolean | null;
};

function rpcJsonbToStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  return [];
}

function rpcRowToRecipeRow(row: SearchRecipesEnrichedRpcRow): RecipeRow {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    ingredients: rpcJsonbToStringArray(row.ingredients),
    instructions: rpcJsonbToStringArray(row.instructions),
    prep_time: row.prep_time ?? 0,
    cook_time: row.cook_time ?? 0,
    servings: row.servings ?? 0,
    tags: rpcJsonbToStringArray(row.tags),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Server-side search via `search_recipes_enriched` RPC (one round trip).
 * Deploy SQL from `supabase/migrations/20260218120000_search_recipes_enriched.sql`.
 */
export async function searchRecipesByQuery(
  query: string,
  userId: string,
): Promise<Recipe[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { data, error } = await supabase.rpc("search_recipes_enriched", {
    p_query: trimmed,
    p_viewer_id: userId,
  });

  if (error) {
    console.error("searchRecipesByQuery RPC:", error);
    return [];
  }

  const rows = (data ?? []) as SearchRecipesEnrichedRpcRow[];
  return rows.map((row) =>
    rowToRecipe(
      rpcRowToRecipeRow(row),
      row.author?.trim() || "Chef",
      Number(row.likes ?? 0),
      Boolean(row.is_liked),
    ),
  );
}

function mapEnrichedRpcRowsToRecipes(
  rows: SearchRecipesEnrichedRpcRow[],
): Recipe[] {
  return rows.map((row) =>
    rowToRecipe(
      rpcRowToRecipeRow(row),
      row.author?.trim() || "Chef",
      Number(row.likes ?? 0),
      Boolean(row.is_liked),
    ),
  );
}

/**
 * Home feed page via `list_recipes_feed` RPC (one round trip).
 * Falls back to select + enrich if RPC is missing (e.g. migration not applied).
 */
export async function fetchFeedRecipesPage(
  limit: number,
  offset: number,
  viewerId: string,
): Promise<Recipe[]> {
  const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 50);
  const safeOffset = Math.max(0, Math.floor(offset));

  const { data, error } = await supabase.rpc("list_recipes_feed", {
    p_limit: safeLimit,
    p_offset: safeOffset,
    p_viewer_id: viewerId,
  });

  if (!error && data != null) {
    return mapEnrichedRpcRowsToRecipes((data ?? []) as SearchRecipesEnrichedRpcRow[]);
  }

  console.warn("fetchFeedRecipesPage: RPC unavailable, using legacy path:", error);

  const { data: rows, error: qErr } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false })
    .range(safeOffset, safeOffset + safeLimit - 1);

  if (qErr) {
    console.error("fetchFeedRecipesPage legacy:", qErr);
    return [];
  }
  const recipeList = toRecipeRows(rows);
  if (recipeList.length === 0) return [];
  return enrichRecipeRows(recipeList, viewerId);
}
