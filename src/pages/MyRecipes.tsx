import React, { useCallback, useEffect, useState } from "react";
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonPage,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { useAuth } from "../contexts/AuthContext";
import { useRecipes } from "../contexts/RecipeContext";
import { fetchRecipesOwnedByUser } from "../lib/recipeSupabase";
import { supabase } from "../lib/supabase";
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
import ListPageShell from "../components/ListPageShell";
import RecipeOwnerMenuPopover from "../components/RecipeOwnerMenuPopover";
import DeleteRecipeConfirmAlert from "../components/DeleteRecipeConfirmAlert";
import type { Recipe } from "../types/Recipe";

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";
const MOCK_RECIPES_KEY = "recipe-logger-recipes";

function readMockMyRecipes(userId: string): Recipe[] {
  try {
    const stored = localStorage.getItem(MOCK_RECIPES_KEY);
    const all = stored ? (JSON.parse(stored) as Recipe[]) : [];
    if (!Array.isArray(all)) return [];
    return all
      .filter((r) => r.userId === userId)
      .slice()
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  } catch {
    return [];
  }
}

const MyRecipes: React.FC = () => {
  const { user } = useAuth();
  const { toggleFavorite, shareRecipe, deleteRecipe } = useRecipes();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [deleteAlert, setDeleteAlert] = useState<DeleteRecipeAlertState>(
    emptyDeleteRecipeAlertState,
  );
  const [popoverOpen, setPopoverOpen] = useState(emptyRecipeMenuPopoverState);

  const load = useCallback(async () => {
    if (!user?.id) {
      setRecipes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (useMockData) {
        setRecipes(readMockMyRecipes(user.id));
        return;
      }
      // Ensure persisted session is applied on the client before RLS-scoped queries.
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUserId = sessionData.session?.user?.id;
      if (!sessionUserId) {
        setRecipes([]);
        return;
      }
      const list = await fetchRecipesOwnedByUser(sessionUserId, sessionUserId);
      setRecipes(list);
    } catch (e) {
      console.error(e);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <IonPage>
      <AppHeader />
      <IonContent fullscreen>
        <ListPageShell
          loading={loading}
          isEmpty={recipes.length === 0}
          onRefresh={load}
          loadingView={<RecipeListLoadingBlock />}
          emptyView={
            <NoData
              title="No recipes yet"
              description="Tap the + button to create your first recipe. It will show up here."
            />
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
                showMenu
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
