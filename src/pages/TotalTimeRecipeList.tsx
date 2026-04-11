import React, { useCallback, useEffect, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useRecipes } from "../contexts/RecipeContext";
import { fetchRecipesByTotalMinutes } from "../lib/recipeSupabase";
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

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";
const MOCK_RECIPES_KEY = "recipe-logger-recipes";

function readMockRecipesByTotalMinutes(totalMinutes: number): Recipe[] {
  try {
    const stored = localStorage.getItem(MOCK_RECIPES_KEY);
    const all = stored ? (JSON.parse(stored) as Recipe[]) : [];
    if (!Array.isArray(all)) return [];
    return all
      .filter((r) => {
        const t = (r.prepTime ?? 0) + (r.cookTime ?? 0);
        return t === totalMinutes;
      })
      .slice()
      .sort((a, b) =>
        (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
      );
  } catch {
    return [];
  }
}

const TotalTimeRecipeList: React.FC = () => {
  const { minutes: minutesParam } = useParams<{ minutes: string }>();
  const { user } = useAuth();
  const { toggleFavorite, shareRecipe, deleteRecipe } = useRecipes();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [deleteAlert, setDeleteAlert] = useState<DeleteRecipeAlertState>(
    emptyDeleteRecipeAlertState,
  );
  const [popoverOpen, setPopoverOpen] = useState(emptyRecipeMenuPopoverState);

  const totalMinutes = minutesParam ? parseInt(minutesParam, 10) : NaN;
  const minutesValid = Number.isFinite(totalMinutes) && totalMinutes > 0;

  const load = useCallback(async () => {
    if (!minutesValid) {
      setRecipes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (useMockData) {
        setRecipes(readMockRecipesByTotalMinutes(totalMinutes));
        return;
      }
      if (!user?.id) {
        setRecipes([]);
        return;
      }
      const list = await fetchRecipesByTotalMinutes(totalMinutes, user.id);
      setRecipes(list);
    } catch (e) {
      console.error(e);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [totalMinutes, minutesValid, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const timeTitle = minutesValid ? `${totalMinutes} min` : undefined;

  return (
    <IonPage>
      <AppHeader showBackButton title={timeTitle} />
      <IonContent fullscreen>
        {loading ? (
          <RecipeListLoadingBlock />
        ) : !minutesValid ? (
          <NoData
            title="Invalid time"
            description="This link doesn’t include a valid total time in minutes."
          />
        ) : recipes.length === 0 ? (
          <NoData
            title="No recipes for this time"
            description={`Nobody has published a recipe with ${totalMinutes} minutes total (prep + cook) yet.`}
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

export default TotalTimeRecipeList;
