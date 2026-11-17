import type { Dispatch, SetStateAction } from "react";
import type { User } from "../AuthContext";
import type { Recipe } from "../../types/Recipe";
import {
  createRecipeDoc,
  deleteRecipeDoc,
  rowToRecipe,
  updateRecipeDoc,
} from "../../lib/recipeFirebase";
import {
  deleteRecipeCoverObject,
  uploadRecipeCover,
} from "../../lib/recipeImageStorage";
import type { RecipeSubmitPayload } from "../../components/RecipeForm/recipeFormModel";

export function useRecipeCrudMutations(
  user: User | null,
  setRecipes: Dispatch<SetStateAction<Recipe[]>>,
  setFavoriteRecipes: Dispatch<SetStateAction<Recipe[]>>,
  setRecipesTotalCount: Dispatch<SetStateAction<number | null>>,
) {
  const addRecipe = async (payload: RecipeSubmitPayload) => {
    if (!user) {
      throw new Error("Sign in to save a recipe.");
    }

    const { coverFile, removeCover: _removeCover, ...newRecipe } = payload;

    try {
      const row = await createRecipeDoc(user.id, {
        title: newRecipe.title.trim(),
        description: newRecipe.description.trim() || null,
        ingredients: newRecipe.ingredients,
        instructions: newRecipe.instructions,
        prep_time: newRecipe.prepTime ?? 0,
        cook_time: newRecipe.cookTime ?? 0,
        servings: newRecipe.servings ?? 0,
        tags: newRecipe.tags ?? [],
        image_url: newRecipe.image?.trim() || null,
      });

      let imageUrl = row.image_url?.trim() || undefined;
      if (coverFile) {
        imageUrl = await uploadRecipeCover(user.id, row.id, coverFile);
        await updateRecipeDoc(row.id, user.id, { image_url: imageUrl });
      }

      const recipe = rowToRecipe(
        { ...row, image_url: imageUrl ?? null },
        user.name ?? "Chef",
        0,
        false,
        0,
        user.avatarUrl,
      );
      setRecipes((prev) => [recipe, ...prev]);
      setRecipesTotalCount((c) => (c ?? 0) + 1);
    } catch (error) {
      console.error("Error adding recipe:", error);
      throw error;
    }
  };

  const updateRecipe = async (id: string, data: RecipeSubmitPayload) => {
    if (!user) {
      throw new Error("Sign in to update a recipe.");
    }

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

      await updateRecipeDoc(id, user.id, payload);
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
      await deleteRecipeDoc(id, user.id);
      await deleteRecipeCoverObject(user.id, id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setFavoriteRecipes((prev) => prev.filter((r) => r.id !== id));
      setRecipesTotalCount((c) => Math.max(0, (c ?? 1) - 1));
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  };

  return { addRecipe, updateRecipe, deleteRecipe };
}
