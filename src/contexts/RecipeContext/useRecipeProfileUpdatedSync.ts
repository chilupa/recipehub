import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { Recipe } from "../../types/Recipe";

export function useRecipeProfileUpdatedSync(
  setRecipes: Dispatch<SetStateAction<Recipe[]>>,
  setFavoriteRecipes: Dispatch<SetStateAction<Recipe[]>>,
) {
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
  }, [setRecipes, setFavoriteRecipes]);
}
