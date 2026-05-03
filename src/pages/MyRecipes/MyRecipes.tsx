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
import { supabase } from "../../lib/supabase";
import AppHeader from "../../components/AppHeader";
import NoData from "../../components/NoData";
import { emptyMyRecipes } from "../../lib/emptyStateMessages";
import RecipeFilterListBlock from "../../components/RecipeFilterListBlock";
import { useRecipeFilterListPage } from "../../hooks/useRecipeFilterListPage";

const MyRecipes: React.FC = () => {
  const { user } = useAuth();

  const fetchRecipes = useCallback(async () => {
    if (!user?.id) return [];
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUserId = sessionData.session?.user?.id;
    if (!sessionUserId) return [];
    return fetchRecipesOwnedByUser(sessionUserId, sessionUserId);
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
