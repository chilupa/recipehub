import React, { useCallback } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchRecipesByTotalMinutes } from "../../lib/recipeSupabase";
import AppHeader from "../../components/AppHeader";
import NoData from "../../components/NoData";
import {
  emptyTotalTimeFilter,
  invalidTimeLink,
} from "../../lib/emptyStateMessages";
import RecipeFilterListBlock from "../../components/RecipeFilterListBlock";
import { useRecipeFilterListPage } from "../../hooks/useRecipeFilterListPage";

const TotalTimeRecipeList: React.FC = () => {
  const { minutes: minutesParam } = useParams<{ minutes: string }>();
  const { user } = useAuth();

  const totalMinutes = minutesParam ? parseInt(minutesParam, 10) : NaN;
  const minutesValid = Number.isFinite(totalMinutes) && totalMinutes > 0;

  const fetchRecipes = useCallback(async () => {
    if (!minutesValid) return [];
    if (!user?.id) return [];
    return fetchRecipesByTotalMinutes(totalMinutes, user.id);
  }, [totalMinutes, minutesValid, user?.id]);

  const listPage = useRecipeFilterListPage(fetchRecipes);

  const timeTitle = minutesValid ? `${totalMinutes} min` : undefined;

  return (
    <IonPage>
      <AppHeader showBackButton title={timeTitle} />
      <IonContent fullscreen>
        <RecipeFilterListBlock
          page={listPage}
          isEmpty={!minutesValid || listPage.recipes.length === 0}
          emptyView={
            !minutesValid ? (
              <NoData {...invalidTimeLink} />
            ) : (
              <NoData {...emptyTotalTimeFilter(totalMinutes)} />
            )
          }
          showMenuForRecipe={(recipe) => recipe.userId === listPage.user?.id}
        />
      </IonContent>
    </IonPage>
  );
};

export default TotalTimeRecipeList;
