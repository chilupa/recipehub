import React from "react";
import { IonCol, IonGrid, IonRow } from "@ionic/react";
import RecipeCard from "../../../components/RecipeCard";
import RecipeCardSkeleton from "../../../components/RecipeCardSkeleton";
import type { Recipe } from "../../../types/Recipe";

type Props = {
  recipes: Recipe[];
  skeletonRecipeId: string | null;
  onFavorite: (recipeId: string) => Promise<void>;
  onShare: (recipe: Recipe) => void;
};

const FavoritesRecipeGrid: React.FC<Props> = ({
  recipes,
  skeletonRecipeId,
  onFavorite,
  onShare,
}) => (
  <IonGrid className="ion-no-padding recipe-favorites-grid">
    <IonRow>
      {recipes.map((recipe) => (
        <IonCol size="12" className="ion-no-padding" key={recipe.id}>
          {skeletonRecipeId === recipe.id ? (
            <RecipeCardSkeleton withMedia={Boolean(recipe.image)} />
          ) : (
            <RecipeCard
              recipe={recipe}
              onFavorite={onFavorite}
              onShare={onShare}
              showMenu={false}
            />
          )}
        </IonCol>
      ))}
    </IonRow>
  </IonGrid>
);

export default FavoritesRecipeGrid;
