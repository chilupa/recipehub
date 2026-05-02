import React, { useState } from "react";
import "../components/ListPageShell.css";
import RecipeListLoadingBlock from "../components/RecipeListLoadingBlock";
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonToast,
} from "@ionic/react";
import { useRecipes } from "../contexts/RecipeContext";
import RecipeCard from "../components/RecipeCard";
import AppHeader from "../components/AppHeader";
import NoData from "../components/NoData";
import { emptyFavorites } from "../lib/emptyStateMessages";

const Favorites: React.FC = () => {
  const { favoriteRecipes, favoritesLoading, toggleFavorite, shareRecipe } =
    useRecipes();
  const [toast, setToast] = useState({ show: false, message: "" });

  return (
    <IonPage>
      <AppHeader title="RecipeHub" />
      <IonContent fullscreen className="page-ion-content--list-rhythm">
        {favoritesLoading ? (
          <div className="list-page-shell__state list-page-shell__state--loading">
            <RecipeListLoadingBlock message="Loading favorites…" />
          </div>
        ) : favoriteRecipes.length === 0 ? (
          <div className="list-page-shell__state list-page-shell__state--empty">
            <NoData {...emptyFavorites} />
          </div>
        ) : (
          <IonGrid className="ion-no-padding recipe-favorites-grid">
            <IonRow>
              {favoriteRecipes.map((recipe) => (
                <IonCol size="12" className="ion-no-padding" key={recipe.id}>
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
