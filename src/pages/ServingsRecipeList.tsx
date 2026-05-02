import React, { useCallback, useEffect, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useRecipes } from "../contexts/RecipeContext";
import { fetchRecipesByServings } from "../lib/recipeSupabase";
import {
  emptyDeleteRecipeAlertState,
  emptyRecipeMenuPopoverState,
} from "../lib/recipeListOwnerState";
import type { DeleteRecipeAlertState } from "../lib/recipeListOwnerState";
import RecipeCard from "../components/RecipeCard";
import AppHeader from "../components/AppHeader";
import NoData from "../components/NoData";
import {
  emptyServingsFilter,
  invalidServingsLink,
} from "../lib/emptyStateMessages";
import DangerToast from "../components/DangerToast";
import RecipeListLoadingBlock from "../components/RecipeListLoadingBlock";
import ListPageShell from "../components/ListPageShell";
import RecipeOwnerMenuPopover from "../components/RecipeOwnerMenuPopover";
import DeleteRecipeConfirmAlert from "../components/DeleteRecipeConfirmAlert";
import type { Recipe } from "../types/Recipe";

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";
const MOCK_RECIPES_KEY = "recipe-logger-recipes";

function readMockRecipesByServings(servings: number): Recipe[] {
  try {
    const stored = localStorage.getItem(MOCK_RECIPES_KEY);
    const all = stored ? (JSON.parse(stored) as Recipe[]) : [];
    if (!Array.isArray(all)) return [];
    return all
      .filter((r) => Number(r.servings) === servings)
      .slice()
      .sort((a, b) =>
        (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
      );
  } catch {
    return [];
  }
}

const ServingsRecipeList: React.FC = () => {
  const { servings: servingsParam } = useParams<{ servings: string }>();
  const { user } = useAuth();
  const { toggleFavorite, shareRecipe, deleteRecipe } = useRecipes();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [deleteAlert, setDeleteAlert] = useState<DeleteRecipeAlertState>(
    emptyDeleteRecipeAlertState,
  );
  const [popoverOpen, setPopoverOpen] = useState(emptyRecipeMenuPopoverState);

  const servings = servingsParam ? parseInt(servingsParam, 10) : NaN;
  const servingsValid = Number.isFinite(servings) && servings > 0;

  const load = useCallback(async () => {
    if (!servingsValid) {
      setRecipes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (useMockData) {
        setRecipes(readMockRecipesByServings(servings));
        return;
      }
      if (!user?.id) {
        setRecipes([]);
        return;
      }
      const list = await fetchRecipesByServings(servings, user.id);
      setRecipes(list);
    } catch (e) {
      console.error(e);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [servings, servingsValid, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const servingsTitle = servingsValid
    ? `${servings} ${servings === 1 ? "serving" : "servings"}`
    : undefined;

  return (
    <IonPage>
      <AppHeader showBackButton title={servingsTitle} />
      <IonContent fullscreen>
        <ListPageShell
          loading={loading}
          isEmpty={!servingsValid || recipes.length === 0}
          loadingView={<RecipeListLoadingBlock />}
          emptyView={
            !servingsValid ? (
              <NoData {...invalidServingsLink} />
            ) : (
              <NoData {...emptyServingsFilter(servings)} />
            )
          }
        >
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
        </ListPageShell>

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

export default ServingsRecipeList;
