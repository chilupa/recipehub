import React from "react";
import { IonButton, IonCard, IonIcon } from "@ionic/react";
import { shareSocial } from "ionicons/icons";
import FavoriteHeartButton from "./FavoriteHeartButton";
import { formatCompactFavoriteCount } from "../lib/recipeUi";
import type { Recipe } from "../types/Recipe";

type Props = {
  recipe: Recipe;
  isGuest: boolean;
  onSignInRequired: () => void;
  onToggleFavorite: (recipe: Recipe) => Promise<void>;
  onShare: (recipe: Recipe) => void;
};

const SearchRecipeResultCard: React.FC<Props> = ({
  recipe,
  isGuest,
  onSignInRequired,
  onToggleFavorite,
  onShare,
}) => {
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

      <div className="search-recipes-spacer" />

      <div className="search-recipes-actions">
        <FavoriteHeartButton
          isLiked={recipe.isLiked}
          size="small"
          stopEventPropagation
          onToggle={() => onToggleFavorite(recipe)}
        >
          {recipe.likes > 0 ? formatCompactFavoriteCount(recipe.likes) : null}
        </FavoriteHeartButton>

        <IonButton
          fill="clear"
          color="medium"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (isGuest) {
              onSignInRequired();
              return;
            }
            onShare(recipe);
          }}
        >
          <IonIcon icon={shareSocial} />
        </IonButton>
      </div>
    </IonCard>
  );
};

export default SearchRecipeResultCard;
