import type { Dispatch, RefObject, SetStateAction } from "react";
import type { User } from "../AuthContext";
import type { Recipe } from "../../types/Recipe";
import { devLog, devWarn } from "../../lib/devLog";
import { supabase } from "../../lib/supabase";
import { fetchRecipeById } from "../../lib/recipeSupabase";
import { playFavoriteToggleHaptics } from "../../lib/playFavoriteToggleHaptics";
import { replaceRecipePreservingOrder } from "./recipeListHelpers";
import { appDownloadUrl, getRecipeShareUrl } from "./recipeShare";

export function useRecipeSocialMutations(
  user: User | null,
  setRecipes: Dispatch<SetStateAction<Recipe[]>>,
  setFavoriteRecipes: Dispatch<SetStateAction<Recipe[]>>,
  recipesRef: RefObject<Recipe[]>,
  loadFavorites: (options?: { withSpinner?: boolean }) => Promise<void>,
) {
  const toggleFavorite = async (id: string) => {
    if (!user) return;

    let recipe = recipesRef.current.find((r) => r.id === id);
    if (!recipe) {
      recipe = (await fetchRecipeById(id, user.id)) ?? undefined;
    }
    if (!recipe) {
      devWarn("toggleFavorite: recipe not found", id);
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
            devWarn("Could not create favorite notification:", notifyErr);
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
    const recipeDescription =
      recipe.description?.trim() || "Open this recipe in RecipeHub.";
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
        devLog("Error sharing:", error);
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
      devWarn("Could not record share:", error);
      return;
    }

    const prevCount = recipe.shareCount ?? 0;
    const bumped: Recipe = { ...recipe, shareCount: prevCount + 1 };
    setRecipes((prev) => replaceRecipePreservingOrder(prev, bumped));
    setFavoriteRecipes((prev) =>
      prev.map((r) => (r.id === recipe.id ? bumped : r)),
    );
  };

  return { toggleFavorite, shareRecipe };
}
