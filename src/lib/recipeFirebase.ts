import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  addDoc,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFirestoreDb } from "./firebase";
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
  image_url?: string | null;
  created_at: string;
  updated_at: string;
};

function recipesCol() {
  return collection(getFirestoreDb(), "recipes");
}

function profilesCol() {
  return collection(getFirestoreDb(), "profiles");
}

function favoritesCol() {
  return collection(getFirestoreDb(), "favorites");
}

function sharesCol() {
  return collection(getFirestoreDb(), "recipe_shares");
}

function notificationsCol() {
  return collection(getFirestoreDb(), "notifications");
}

export function favoriteDocId(userId: string, recipeId: string): string {
  return `${userId}__${recipeId}`;
}

export function shareDocId(userId: string, recipeId: string): string {
  return `${userId}__${recipeId}`;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v)) : [];
}

function snapToRecipeRow(snap: QueryDocumentSnapshot<DocumentData>): RecipeRow {
  const data = snap.data();
  return {
    id: snap.id,
    user_id: String(data.user_id ?? ""),
    title: String(data.title ?? ""),
    description: (data.description as string | null) ?? null,
    ingredients: asStringArray(data.ingredients),
    instructions: asStringArray(data.instructions),
    prep_time: Number(data.prep_time ?? 0),
    cook_time: Number(data.cook_time ?? 0),
    servings: Number(data.servings ?? 0),
    tags: asStringArray(data.tags),
    image_url: (data.image_url as string | null) ?? null,
    created_at: String(data.created_at ?? new Date().toISOString()),
    updated_at: String(data.updated_at ?? new Date().toISOString()),
  };
}

type ProfileSummary = {
  displayName: string;
  avatarUrl?: string;
};

export function rowToRecipe(
  row: RecipeRow,
  author: string,
  likes: number,
  isLiked: boolean,
  shareCount = 0,
  authorAvatarUrl?: string,
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
    image: row.image_url?.trim() || undefined,
    likes,
    isLiked,
    shareCount,
    author,
    authorAvatarUrl,
  };
}

async function loadProfileMap(
  userIds: string[],
): Promise<Map<string, ProfileSummary>> {
  const map = new Map<string, ProfileSummary>();
  await Promise.all(
    userIds.map(async (id) => {
      const snap = await getDoc(doc(profilesCol(), id));
      if (!snap.exists()) {
        map.set(id, { displayName: "Chef" });
        return;
      }
      const data = snap.data();
      const name = String(data.display_name ?? "").trim();
      const avatarUrl = String(data.avatar_url ?? "").trim() || undefined;
      map.set(id, {
        displayName: name || "Chef",
        avatarUrl,
      });
    }),
  );
  return map;
}

async function loadSocialMaps(
  recipeIds: string[],
  viewerId: string,
): Promise<{
  favoriteCounts: Map<string, number>;
  shareCounts: Map<string, number>;
  userFavoriteIds: Set<string>;
}> {
  const favoriteCounts = new Map<string, number>();
  const shareCounts = new Map<string, number>();
  const userFavoriteIds = new Set<string>();

  if (recipeIds.length === 0) {
    return { favoriteCounts, shareCounts, userFavoriteIds };
  }

  // Firestore `in` is capped at 30; chunk recipe id lookups.
  const chunkSize = 30;
  for (let i = 0; i < recipeIds.length; i += chunkSize) {
    const chunk = recipeIds.slice(i, i + chunkSize);
    const [favSnap, shareSnap] = await Promise.all([
      getDocs(query(favoritesCol(), where("recipe_id", "in", chunk))),
      getDocs(query(sharesCol(), where("recipe_id", "in", chunk))),
    ]);

    favSnap.forEach((d) => {
      const recipeId = String(d.data().recipe_id ?? "");
      const userId = String(d.data().user_id ?? "");
      if (!recipeId) return;
      favoriteCounts.set(recipeId, (favoriteCounts.get(recipeId) ?? 0) + 1);
      if (userId === viewerId) userFavoriteIds.add(recipeId);
    });

    shareSnap.forEach((d) => {
      const recipeId = String(d.data().recipe_id ?? "");
      if (!recipeId) return;
      shareCounts.set(recipeId, (shareCounts.get(recipeId) ?? 0) + 1);
    });
  }

  return { favoriteCounts, shareCounts, userFavoriteIds };
}

export async function enrichRecipeRows(
  recipeList: RecipeRow[],
  userId: string,
): Promise<Recipe[]> {
  if (recipeList.length === 0) return [];

  const ownerIds = [...new Set(recipeList.map((r) => r.user_id))];
  const recipeIds = recipeList.map((r) => r.id);
  const [profileMap, social] = await Promise.all([
    loadProfileMap(ownerIds),
    loadSocialMaps(recipeIds, userId),
  ]);

  return recipeList.map((row) => {
    const profile = profileMap.get(row.user_id);
    return rowToRecipe(
      row,
      profile?.displayName ?? "Chef",
      social.favoriteCounts.get(row.id) ?? 0,
      social.userFavoriteIds.has(row.id),
      social.shareCounts.get(row.id) ?? 0,
      profile?.avatarUrl,
    );
  });
}

export async function fetchRecipeById(
  recipeId: string,
  userId: string,
): Promise<Recipe | null> {
  const snap = await getDoc(doc(recipesCol(), recipeId));
  if (!snap.exists()) return null;
  const row = snapToRecipeRow(snap as QueryDocumentSnapshot<DocumentData>);
  const list = await enrichRecipeRows([row], userId);
  return list[0] ?? null;
}

export async function fetchFavoriteRecipesList(
  userId: string,
): Promise<Recipe[]> {
  const favSnap = await getDocs(
    query(favoritesCol(), where("user_id", "==", userId)),
  );
  if (favSnap.empty) return [];

  const ids = favSnap.docs
    .map((d) => String(d.data().recipe_id ?? ""))
    .filter(Boolean);
  const rows: RecipeRow[] = [];
  for (let i = 0; i < ids.length; i += 30) {
    const chunk = ids.slice(i, i + 30);
    const snaps = await Promise.all(
      chunk.map((id) => getDoc(doc(recipesCol(), id))),
    );
    snaps.forEach((snap) => {
      if (snap.exists()) {
        rows.push(snapToRecipeRow(snap as QueryDocumentSnapshot<DocumentData>));
      }
    });
  }

  rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return enrichRecipeRows(rows, userId);
}

export async function fetchVisibleRecipeCount(): Promise<number> {
  const snap = await getDocs(recipesCol());
  return snap.size;
}

export async function fetchRecipesOwnedByUser(
  ownerId: string,
  viewerId: string,
): Promise<Recipe[]> {
  if (!ownerId.trim()) return [];
  const snap = await getDocs(
    query(
      recipesCol(),
      where("user_id", "==", ownerId),
      orderBy("created_at", "desc"),
      limit(500),
    ),
  );
  const rows = snap.docs.map((d) => snapToRecipeRow(d));
  return enrichRecipeRows(rows, viewerId);
}

export async function fetchRecipesByTag(
  tag: string,
  userId: string,
): Promise<Recipe[]> {
  const trimmed = tag.trim();
  if (!trimmed) return [];
  const snap = await getDocs(
    query(
      recipesCol(),
      where("tags", "array-contains", trimmed),
      orderBy("created_at", "desc"),
      limit(200),
    ),
  );
  return enrichRecipeRows(snap.docs.map((d) => snapToRecipeRow(d)), userId);
}

export async function fetchRecipesByServings(
  servings: number,
  userId: string,
): Promise<Recipe[]> {
  if (!Number.isFinite(servings) || servings <= 0) return [];
  const snap = await getDocs(
    query(
      recipesCol(),
      where("servings", "==", Math.floor(servings)),
      orderBy("created_at", "desc"),
      limit(200),
    ),
  );
  return enrichRecipeRows(snap.docs.map((d) => snapToRecipeRow(d)), userId);
}

export async function fetchRecipesByTotalMinutes(
  totalMinutes: number,
  userId: string,
): Promise<Recipe[]> {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return [];
  const target = Math.floor(totalMinutes);
  const snap = await getDocs(
    query(recipesCol(), orderBy("created_at", "desc"), limit(300)),
  );
  const rows = snap.docs
    .map((d) => snapToRecipeRow(d))
    .filter((r) => r.prep_time + r.cook_time === target)
    .slice(0, 200);
  return enrichRecipeRows(rows, userId);
}

function scoreRecipe(row: RecipeRow, ql: string): number {
  const title = row.title.toLowerCase();
  const desc = (row.description ?? "").toLowerCase();
  const tags = row.tags.map((t) => t.toLowerCase());
  const ingredients = row.ingredients.join(" ").toLowerCase();
  const instructions = row.instructions.join(" ").toLowerCase();

  if (title.trim() === ql) return 400;
  if (title.startsWith(ql)) return 300;
  if (title.includes(ql)) return 200;
  if (tags.includes(ql)) return 150;
  if (tags.some((t) => t.includes(ql))) return 100;
  if (desc.includes(ql)) return 80;
  if (ingredients.includes(ql)) return 60;
  if (instructions.includes(ql)) return 40;
  return 0;
}

export async function searchRecipesByQuery(
  queryText: string,
  userId: string,
): Promise<Recipe[]> {
  const trimmed = queryText.trim();
  if (!trimmed) return [];
  const ql = trimmed.toLowerCase();

  const snap = await getDocs(
    query(recipesCol(), orderBy("created_at", "desc"), limit(300)),
  );
  const scored = snap.docs
    .map((d) => snapToRecipeRow(d))
    .map((row) => ({ row, score: scoreRecipe(row, ql) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.row.created_at.localeCompare(a.row.created_at))
    .slice(0, 200)
    .map((x) => x.row);

  if (scored.length === 0) {
    const fallback = snap.docs.map((d) => snapToRecipeRow(d)).slice(0, 50);
    return enrichRecipeRows(fallback, userId);
  }
  return enrichRecipeRows(scored, userId);
}

export async function fetchFeedRecipesPage(
  pageLimit: number,
  offset: number,
  viewerId: string,
): Promise<Recipe[]> {
  const safeLimit = Math.min(Math.max(1, Math.floor(pageLimit)), 50);
  const safeOffset = Math.max(0, Math.floor(offset));

  const snap = await getDocs(
    query(
      recipesCol(),
      orderBy("created_at", "desc"),
      limit(safeOffset + safeLimit),
    ),
  );
  const rows = snap.docs
    .map((d) => snapToRecipeRow(d))
    .slice(safeOffset, safeOffset + safeLimit);
  return enrichRecipeRows(rows, viewerId);
}

export async function createRecipeDoc(
  userId: string,
  data: Omit<RecipeRow, "id" | "user_id" | "created_at" | "updated_at"> & {
    image_url?: string | null;
  },
): Promise<RecipeRow> {
  const now = new Date().toISOString();
  const ref = doc(recipesCol());
  const payload = {
    user_id: userId,
    title: data.title,
    description: data.description,
    ingredients: data.ingredients,
    instructions: data.instructions,
    prep_time: data.prep_time,
    cook_time: data.cook_time,
    servings: data.servings,
    tags: data.tags,
    image_url: data.image_url ?? null,
    created_at: now,
    updated_at: now,
  };
  await setDoc(ref, payload);
  return { id: ref.id, ...payload };
}

export async function updateRecipeDoc(
  recipeId: string,
  userId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const ref = doc(recipesCol(), recipeId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data().user_id !== userId) {
    throw new Error("Recipe not found or not owned by you.");
  }
  await updateDoc(ref, {
    ...data,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteRecipeDoc(
  recipeId: string,
  userId: string,
): Promise<void> {
  const ref = doc(recipesCol(), recipeId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data().user_id !== userId) {
    throw new Error("Recipe not found or not owned by you.");
  }
  await deleteDoc(ref);
}

export async function setFavorite(
  userId: string,
  recipeId: string,
  liked: boolean,
): Promise<void> {
  const ref = doc(favoritesCol(), favoriteDocId(userId, recipeId));
  if (!liked) {
    await deleteDoc(ref);
    return;
  }
  await setDoc(ref, {
    user_id: userId,
    recipe_id: recipeId,
    created_at: new Date().toISOString(),
  });
}

export async function recordShare(
  userId: string,
  recipeId: string,
): Promise<"created" | "exists"> {
  const ref = doc(sharesCol(), shareDocId(userId, recipeId));
  const existing = await getDoc(ref);
  if (existing.exists()) return "exists";
  await setDoc(ref, {
    user_id: userId,
    recipe_id: recipeId,
    created_at: new Date().toISOString(),
  });
  return "created";
}

export async function createFavoriteNotification(input: {
  ownerId: string;
  actorId: string;
  recipeId: string;
}): Promise<void> {
  if (input.ownerId === input.actorId) return;
  await addDoc(notificationsCol(), {
    user_id: input.ownerId,
    actor_id: input.actorId,
    recipe_id: input.recipeId,
    type: "favorite",
    read: false,
    created_at: new Date().toISOString(),
  });
}

export async function deleteAllUserData(userId: string): Promise<void> {
  const db = getFirestoreDb();
  const batchLimit = 400;

  const ownedRecipes = await getDocs(
    query(recipesCol(), where("user_id", "==", userId)),
  );
  const favs = await getDocs(
    query(favoritesCol(), where("user_id", "==", userId)),
  );
  const shares = await getDocs(
    query(sharesCol(), where("user_id", "==", userId)),
  );
  const notes = await getDocs(
    query(notificationsCol(), where("user_id", "==", userId)),
  );

  const refs = [
    ...ownedRecipes.docs.map((d) => d.ref),
    ...favs.docs.map((d) => d.ref),
    ...shares.docs.map((d) => d.ref),
    ...notes.docs.map((d) => d.ref),
    doc(profilesCol(), userId),
  ];

  for (let i = 0; i < refs.length; i += batchLimit) {
    const batch = writeBatch(db);
    refs.slice(i, i + batchLimit).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

export {
  recipesCol,
  profilesCol,
  favoritesCol,
  sharesCol,
  notificationsCol,
  snapToRecipeRow,
};
