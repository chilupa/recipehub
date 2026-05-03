import React from "react";
import { IonCol, IonGrid, IonRow } from "@ionic/react";
import RecipeCard from "../../../components/RecipeCard";
import type { Recipe } from "../../../types/Recipe";
type Props = {
  recipes: Recipe[];
  onFavorite: (recipeId: string) => Promise<void>;
  onShare: (recipe: Recipe) => void;
};

const FavoritesRecipeGrid: React.FC<Props> = ({
  recipes,
  onFavorite,
  onShare,
}) => (
  <IonGrid className="ion-no-padding recipe-favorites-grid">
    <IonRow>
      {recipes.map((recipe) => (
        <IonCol size="12" className="ion-no-padding" key={recipe.id}>
          <RecipeCard
            recipe={recipe}
            onFavorite={onFavorite}
            onShare={onShare}
            showMenu={false}
          />
        </IonCol>
      ))}
    </IonRow>
  </IonGrid>
);

export default FavoritesRecipeGrid;
