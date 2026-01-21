import React from "react";
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
} from "@ionic/react";
import { useRecipes } from "../contexts/RecipeContext";
import RecipeCard from "../components/RecipeCard";
import AppHeader from "../components/AppHeader";
import NoData from "../components/NoData";

const Favorites: React.FC = () => {
  const { recipes, toggleLike, shareRecipe } = useRecipes();
  const favoriteRecipes = recipes.filter((recipe) => recipe.isLiked);

  return (
    <IonPage>
      <AppHeader title="RecipeHub" />
      <IonContent fullscreen>
        {favoriteRecipes.length === 0 ? (
          <NoData
            title="No favorites yet!"
            description="Like some recipes to see them here."
          />
        ) : (
          <IonGrid className="ion-no-padding">
            <IonRow>
              {favoriteRecipes.map((recipe) => (
                <IonCol size="12" key={recipe.id}>
                  <RecipeCard
                    recipe={recipe}
                    onLike={toggleLike}
                    onShare={shareRecipe}
                    showMenu={false}
                  />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Favorites;
