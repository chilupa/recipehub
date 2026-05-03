import React, { useCallback } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchRecipesByServings } from "../../lib/recipeSupabase";
import AppHeader from "../../components/AppHeader";
import NoData from "../../components/NoData";
import {
  emptyServingsFilter,
  invalidServingsLink,
} from "../../lib/emptyStateMessages";
import RecipeFilterListBlock from "../../components/RecipeFilterListBlock";
import { useRecipeFilterListPage } from "../../hooks/useRecipeFilterListPage";

const ServingsRecipeList: React.FC = () => {
  const { servings: servingsParam } = useParams<{ servings: string }>();
  const { user } = useAuth();

  const servings = servingsParam ? parseInt(servingsParam, 10) : NaN;
  const servingsValid = Number.isFinite(servings) && servings > 0;

  const fetchRecipes = useCallback(async () => {
    if (!servingsValid) return [];
    if (!user?.id) return [];
    return fetchRecipesByServings(servings, user.id);
  }, [servings, servingsValid, user?.id]);

  const listPage = useRecipeFilterListPage(fetchRecipes);

  const servingsTitle = servingsValid
    ? `${servings} ${servings === 1 ? "serving" : "servings"}`
    : undefined;

  return (
    <IonPage>
      <AppHeader showBackButton title={servingsTitle} />
      <IonContent fullscreen>
        <RecipeFilterListBlock
          page={listPage}
          isEmpty={!servingsValid || listPage.recipes.length === 0}
          emptyView={
            !servingsValid ? (
              <NoData {...invalidServingsLink} />
            ) : (
              <NoData {...emptyServingsFilter(servings)} />
            )
          }
          showMenuForRecipe={(recipe) => recipe.userId === listPage.user?.id}
        />
      </IonContent>
    </IonPage>
  );
};

export default ServingsRecipeList;
