import { useContext } from "react";
import { RecipeContext } from "./recipeContextTypes";

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipes must be used within RecipeProvider");
  }
  return context;
}
