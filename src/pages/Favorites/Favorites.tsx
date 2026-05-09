import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import AppHeader from "../../components/AppHeader";
import NoData from "../../components/NoData";
import RecipeListLoadingBlock from "../../components/RecipeListLoadingBlock";
import { emptyFavorites } from "../../lib/emptyStateMessages";
import FavoritesRecipeGrid from "./FavoritesRecipeGrid";
import { useFavoritesList } from "./useFavoritesList";
import "./Favorites.css";

const Favorites: React.FC = () => {
  const {
    favoriteRecipes,
    favoritesLoading,
    skeletonRecipeId,
    onFavoritePress,
    shareRecipe,
  } = useFavoritesList();

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
          <FavoritesRecipeGrid
            recipes={favoriteRecipes}
            skeletonRecipeId={skeletonRecipeId}
            onFavorite={onFavoritePress}
            onShare={shareRecipe}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Favorites;
