import React from "react";
import { IonText } from "@ionic/react";
import RecipeCard from "../RecipeCard";
import type { Recipe } from "../../types/Recipe";
import "./RecentlyViewedStrip.css";

type Props = {
  recipes: Recipe[];
  onFavorite: (recipeId: string) => Promise<void>;
  onShare: (recipe: Recipe) => void;
  onMenuClick?: (event: Event, recipeId: string) => void;
  showMenuForRecipeId?: (recipeId: string) => boolean;
};

const RecentlyViewedStrip: React.FC<Props> = ({
  recipes,
  onFavorite,
  onShare,
  onMenuClick,
  showMenuForRecipeId,
}) => {
  if (recipes.length === 0) return null;

  return (
    <section
      className="recently-viewed-strip"
      aria-label="Recently viewed recipes"
    >
      <IonText>
        <h2 className="recently-viewed-strip__title">Recently viewed</h2>
      </IonText>
      <div className="recently-viewed-strip__scroll" tabIndex={0}>
        {recipes.map((recipe) => (
          <div className="recently-viewed-strip__card" key={recipe.id}>
            <RecipeCard
              recipe={recipe}
              onFavorite={onFavorite}
              onShare={onShare}
              onMenuClick={onMenuClick}
              showMenu={showMenuForRecipeId?.(recipe.id) ?? false}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewedStrip;
