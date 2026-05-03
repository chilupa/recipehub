import React from "react";
import { IonCard } from "@ionic/react";
import type { Recipe } from "../../types/Recipe";
import "./SearchRecipeResultCard.css";

type Props = {
  recipe: Recipe;
};

const SearchRecipeResultCard: React.FC<Props> = ({ recipe }) => {
  const description = (recipe.description ?? "").trim();

  return (
    <IonCard
      className="search-recipes-card"
      button
      routerLink={`/recipes/recipe/${recipe.id}`}
    >
      <h3 className="search-recipes-title">{recipe.title}</h3>

      {description ? (
        <p className="search-recipes-description">{description}</p>
      ) : null}
    </IonCard>
  );
};

export default SearchRecipeResultCard;
