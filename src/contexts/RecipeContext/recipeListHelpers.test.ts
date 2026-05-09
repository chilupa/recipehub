import { describe, expect, it } from "vitest";
import type { Recipe } from "../../types/Recipe";
import {
  replaceRecipePreservingOrder,
  upsertRecipeSorted,
} from "./recipeListHelpers";

function makeRecipe(id: string, createdAt: string, likes = 0): Recipe {
  return {
    id,
    title: `Recipe ${id}`,
    description: "",
    ingredients: [],
    instructions: [],
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    tags: [],
    createdAt,
    updatedAt: createdAt,
    likes,
    isLiked: false,
    shareCount: 0,
    author: "Chef",
    userId: "u1",
  };
}

describe("replaceRecipePreservingOrder", () => {
  it("replaces in place without reordering", () => {
    const a = makeRecipe("a", "2025-01-02");
    const b = makeRecipe("b", "2025-01-03");
    const prev = [a, b];
    const updatedB = { ...b, likes: 5 };
    const next = replaceRecipePreservingOrder(prev, updatedB);
    expect(next.map((r) => r.id)).toEqual(["a", "b"]);
    expect(next[1]?.likes).toBe(5);
    expect(next).not.toBe(prev);
  });

  it("appends unknown id sorted by createdAt descending", () => {
    const newer = makeRecipe("a", "2025-01-02");
    const older = makeRecipe("c", "2025-01-01");
    const next = replaceRecipePreservingOrder([newer], older);
    expect(next.map((r) => r.id)).toEqual(["a", "c"]);
  });
});

describe("upsertRecipeSorted", () => {
  it("sorts by createdAt descending", () => {
    const old = makeRecipe("old", "2025-01-01");
    const newer = makeRecipe("new", "2025-02-01");
    const merged = upsertRecipeSorted([old], newer);
    expect(merged.map((r) => r.id)).toEqual(["new", "old"]);
  });
});
