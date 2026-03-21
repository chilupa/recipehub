import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonToast,
  IonSpinner,
} from "@ionic/react";
import { useRecipes } from "../contexts/RecipeContext";
import RecipeCard from "../components/RecipeCard";
import AppHeader from "../components/AppHeader";
import NoData from "../components/NoData";

const Favorites: React.FC = () => {
  const { favoriteRecipes, favoritesLoading, toggleFavorite, shareRecipe } =
    useRecipes();
  const [toast, setToast] = useState({ show: false, message: "" });

  return (
    <IonPage>
      <AppHeader title="RecipeHub" />
      <IonContent fullscreen>
        {favoritesLoading ? (
          <div
            className="ion-padding"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 48,
            }}
          >
            <IonSpinner name="crescent" />
            <IonText color="medium">
              <p style={{ marginTop: 12, textAlign: "center" }}>
                Loading favorites…
              </p>
            </IonText>
          </div>
        ) : favoriteRecipes.length === 0 ? (
          <NoData
            title="No favorites yet!"
            description="Save some recipes to see them here."
          />
        ) : (
          <IonGrid className="ion-no-padding">
            <IonRow>
              {favoriteRecipes.map((recipe) => (
                <IonCol size="12" key={recipe.id}>
                  <RecipeCard
                    recipe={recipe}
                    onFavorite={async (recipeId) => {
                      try {
                        await toggleFavorite(recipeId);
                      } catch {
                        setToast({ show: true, message: "Could not update favorite." });
                      }
                    }}
                    onShare={shareRecipe}
                    showMenu={false}
                  />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}
      </IonContent>

      <IonToast
        isOpen={toast.show}
        onDidDismiss={() => setToast((t) => ({ ...t, show: false }))}
        message={toast.message}
        duration={2500}
        color="danger"
      />
    </IonPage>
  );
};

export default Favorites;
