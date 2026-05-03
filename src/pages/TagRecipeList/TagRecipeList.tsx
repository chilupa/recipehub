import React, { useCallback } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchRecipesByTag } from "../../lib/recipeSupabase";
import AppHeader from "../../components/AppHeader";
import NoData from "../../components/NoData";
import {
  emptyTagFilter,
  invalidTagLink,
} from "../../lib/emptyStateMessages";
import RecipeFilterListBlock from "../../components/RecipeFilterListBlock";
import { useRecipeFilterListPage } from "../../hooks/useRecipeFilterListPage";
import { safeDecodeURIComponent } from "./tagRecipeListUtils";
import "../shared/recipeFilterListRoutes.css";

const TagRecipeList: React.FC = () => {
  const { tag: tagParam } = useParams<{ tag: string }>();
  const { user } = useAuth();

  const fetchRecipes = useCallback(async () => {
    const decoded = tagParam ? safeDecodeURIComponent(tagParam) : "";
    if (!decoded.trim()) return [];
    if (!user?.id) return [];
    return fetchRecipesByTag(decoded, user.id);
  }, [tagParam, user?.id]);

  const listPage = useRecipeFilterListPage(fetchRecipes);

  const tagLabel = tagParam ? safeDecodeURIComponent(tagParam) : "";
  const tagDisplay = tagLabel.trim();

  return (
    <IonPage>
      <AppHeader
        showBackButton
        title={tagDisplay ? tagDisplay : undefined}
      />
      <IonContent fullscreen>
        <RecipeFilterListBlock
          page={listPage}
          isEmpty={!tagDisplay || listPage.recipes.length === 0}
          emptyView={
            !tagDisplay ? (
              <NoData {...invalidTagLink} />
            ) : (
              <NoData {...emptyTagFilter(tagDisplay)} />
            )
          }
          showMenuForRecipe={(recipe) => recipe.userId === listPage.user?.id}
          beforeList={
            tagDisplay ? (
              <p className="tag-recipe-list-desc">Tagged recipes.</p>
            ) : null
          }
        />
      </IonContent>
    </IonPage>
  );
};

export default TagRecipeList;
