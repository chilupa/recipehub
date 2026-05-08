import React, { useCallback } from "react";
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonPage,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { useAuth } from "../../contexts/AuthContext";
import { fetchRecipesOwnedByUser } from "../../lib/recipeSupabase";
import AppHeader from "../../components/AppHeader";
import NoData from "../../components/NoData";
import { emptyMyRecipes } from "../../lib/emptyStateMessages";
import RecipeFilterListBlock from "../../components/RecipeFilterListBlock";
import { useRecipeFilterListPage } from "../../hooks/useRecipeFilterListPage";

const MyRecipes: React.FC = () => {
  const { user } = useAuth();

  const fetchRecipes = useCallback(async () => {
    if (!user?.id) return [];
    return fetchRecipesOwnedByUser(user.id, user.id);
  }, [user?.id]);

  const listPage = useRecipeFilterListPage(fetchRecipes);

  return (
    <IonPage>
      <AppHeader />
      <IonContent fullscreen>
        <RecipeFilterListBlock
          page={listPage}
          isEmpty={listPage.recipes.length === 0}
          emptyView={<NoData {...emptyMyRecipes} />}
          onRefresh={listPage.load}
          showMenuForRecipe={() => true}
        />

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink="/recipes/add" color="secondary">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default MyRecipes;
