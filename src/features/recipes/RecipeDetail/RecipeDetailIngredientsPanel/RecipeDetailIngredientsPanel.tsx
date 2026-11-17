import React from "react";

import RecipeServingsScaler from "../../../../components/RecipeServingsScaler";
import { AppIcon } from "../../../../design-system";
import type { Recipe } from "../../../../types/Recipe";
import RecipeSection from "../RecipeSection";

import "../RecipeDetail.css";

type Props = {
  recipe: Recipe;
  displayIngredients: string[];
  scaledServings: number;
  onScaledServingsChange: (n: number) => void;
  addFromRecipe: (
    recipe: Recipe,
    opts?: { ingredientLines?: string[] },
  ) => number;
  onShoppingListNotify: (message: string) => void;
};

const RecipeDetailIngredientsPanel: React.FC<Props> = ({
  recipe,
  displayIngredients,
  scaledServings,
  onScaledServingsChange,
  addFromRecipe,
  onShoppingListNotify,
}) => (
  <>
    {recipe.servings > 0 ? (
      <RecipeServingsScaler
        scaledServings={scaledServings}
        onScaledServingsChange={onScaledServingsChange}
      />
    ) : null}

    <RecipeSection
      title="Ingredients"
      items={displayIngredients}
      headerAction={
        <button
          type="button"
          className="recipe-detail-shop-inline"
          aria-label="Add ingredients to shopping list"
          onClick={() => {
            const n = addFromRecipe(recipe, {
              ingredientLines: displayIngredients,
            });
            if (n === 0) {
              onShoppingListNotify(
                "Those ingredients are already on your shopping list.",
              );
            } else {
              onShoppingListNotify(
                `Added ${n} ${n === 1 ? "item" : "items"} to your shopping list.`,
              );
            }
          }}
        >
          <AppIcon name="cartOutline" size="sm" />
          <span className="recipe-detail-shop-inline-label">Add to list</span>
        </button>
      }
    />
  </>
);

export default RecipeDetailIngredientsPanel;
