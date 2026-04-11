import React, { useCallback, useEffect, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useRecipes } from "../contexts/RecipeContext";
import { fetchRecipesByTag } from "../lib/recipeSupabase";
import {
  emptyDeleteRecipeAlertState,
  emptyRecipeMenuPopoverState,
} from "../lib/recipeListOwnerState";
import type { DeleteRecipeAlertState } from "../lib/recipeListOwnerState";
import RecipeCard from "../components/RecipeCard";
import AppHeader from "../components/AppHeader";
import NoData from "../components/NoData";
import DangerToast from "../components/DangerToast";
import RecipeListLoadingBlock from "../components/RecipeListLoadingBlock";
import RecipeOwnerMenuPopover from "../components/RecipeOwnerMenuPopover";
import DeleteRecipeConfirmAlert from "../components/DeleteRecipeConfirmAlert";
import type { Recipe } from "../types/Recipe";

function safeDecodeURIComponent(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";
const MOCK_RECIPES_KEY = "recipe-logger-recipes";

function readMockRecipesByTag(tag: string): Recipe[] {
  try {
    const stored = localStorage.getItem(MOCK_RECIPES_KEY);
    const all = stored ? (JSON.parse(stored) as Recipe[]) : [];
    if (!Array.isArray(all)) return [];
    const trimmed = tag.trim();
    return all
      .filter(
        (r) =>
          Array.isArray(r.tags) && r.tags.some((t) => String(t) === trimmed),
      )
      .slice()
      .sort((a, b) =>
        (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
      );
  } catch {
    return [];
  }
}

const TagRecipeList: React.FC = () => {
  const { tag: tagParam } = useParams<{ tag: string }>();
  const { user } = useAuth();
  const { toggleFavorite, shareRecipe, deleteRecipe } = useRecipes();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [deleteAlert, setDeleteAlert] = useState<DeleteRecipeAlertState>(
    emptyDeleteRecipeAlertState,
  );
  const [popoverOpen, setPopoverOpen] = useState(emptyRecipeMenuPopoverState);

  const tagLabel = tagParam ? safeDecodeURIComponent(tagParam) : "";

  const load = useCallback(async () => {
    const decoded = tagParam ? safeDecodeURIComponent(tagParam) : "";
    if (!decoded.trim()) {
      setRecipes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (useMockData) {
        setRecipes(readMockRecipesByTag(decoded));
        return;
      }
      if (!user?.id) {
        setRecipes([]);
        return;
      }
      const list = await fetchRecipesByTag(decoded, user.id);
      setRecipes(list);
    } catch (e) {
      console.error(e);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [tagParam, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const tagDisplay = tagLabel.trim();

  return (
    <IonPage>
      <AppHeader
        showBackButton
        title={tagDisplay ? tagDisplay : undefined}
      />
      <IonContent fullscreen>
        {loading ? (
          <RecipeListLoadingBlock />
        ) : !tagDisplay ? (
          <NoData
            title="Invalid tag"
            description="This link doesn’t include a valid tag."
          />
        ) : recipes.length === 0 ? (
          <NoData
            title="No recipes with this tag"
            description={`Nobody has tagged a recipe “${tagDisplay}” yet.`}
          />
        ) : (
          <div style={{ paddingBottom: "80px", paddingTop: 8 }}>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onFavorite={async (recipeId) => {
                  try {
                    await toggleFavorite(recipeId);
                  } catch {
                    setToast({
                      show: true,
                      message: "Could not update favorite.",
                    });
                  }
                }}
                onShare={shareRecipe}
                onMenuClick={(event, recipeId) =>
                  setPopoverOpen({ isOpen: true, event, recipeId })
                }
                showMenu={recipe.userId === user?.id}
              />
            ))}
          </div>
        )}

        <RecipeOwnerMenuPopover
          state={popoverOpen}
          recipes={recipes}
          onDismiss={() => setPopoverOpen(emptyRecipeMenuPopoverState)}
          onRequestDelete={(recipeId, displayName) =>
            setDeleteAlert({
              isOpen: true,
              recipeId,
              recipeName: displayName,
            })
          }
        />

        <DeleteRecipeConfirmAlert
          state={deleteAlert}
          onDismiss={() => setDeleteAlert(emptyDeleteRecipeAlertState)}
          deleteRecipe={deleteRecipe}
          afterDelete={load}
          onError={(message) => setToast({ show: true, message })}
        />

        <DangerToast
          isOpen={toast.show}
          message={toast.message}
          onDidDismiss={() => setToast((t) => ({ ...t, show: false }))}
        />
      </IonContent>
    </IonPage>
  );
};

export default TagRecipeList;
