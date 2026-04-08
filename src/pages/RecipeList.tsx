import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  IonIcon,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useRecipes } from "../contexts/RecipeContext";
import { useAuth } from "../contexts/AuthContext";
import RecipeCard from "../components/RecipeCard";
import AppHeader from "../components/AppHeader";
import NoData from "../components/NoData";
import DangerToast from "../components/DangerToast";
import SignInPromptAlert from "../components/SignInPromptAlert";
import RecipeListSkeleton from "../components/RecipeListSkeleton";
import RecipeOwnerMenuPopover from "../components/RecipeOwnerMenuPopover";
import DeleteRecipeConfirmAlert from "../components/DeleteRecipeConfirmAlert";
import {
  emptyDeleteRecipeAlertState,
  emptyRecipeMenuPopoverState,
} from "../lib/recipeListOwnerState";
import type { DeleteRecipeAlertState } from "../lib/recipeListOwnerState";

const RecipeList: React.FC = () => {
  const { user, isGuest } = useAuth();
  const history = useHistory();
  const {
    recipes,
    recipesLoading,
    hasMoreRecipes,
    refreshRecipes,
    loadMoreRecipes,
    toggleFavorite,
    shareRecipe,
    deleteRecipe,
  } = useRecipes();
  const [toast, setToast] = useState({ show: false, message: "" });
  const [deleteAlert, setDeleteAlert] = useState<DeleteRecipeAlertState>(
    emptyDeleteRecipeAlertState,
  );
  const [popoverOpen, setPopoverOpen] = useState(emptyRecipeMenuPopoverState);
  const [signInAlertOpen, setSignInAlertOpen] = useState(false);

  const promptSignIn = () => setSignInAlertOpen(true);

  return (
    <IonPage>
      <AppHeader />
      <IonContent fullscreen>
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            await refreshRecipes();
            await (e.target as HTMLIonRefresherElement).complete();
          }}
        >
          <IonRefresherContent pullingText="Pull to refresh" />
        </IonRefresher>
        {recipesLoading ? (
          <RecipeListSkeleton />
        ) : recipes.length === 0 ? (
          <NoData
            title={isGuest ? "Nothing to show yet" : "No recipes yet!"}
            description={
              isGuest
                ? "There are no public recipes to preview right now, or your connection had trouble loading them."
                : "Tap the + button to add your first recipe."
            }
          />
        ) : (
          <div style={{ paddingBottom: "80px", paddingTop: 8 }}>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onFavorite={async (recipeId) => {
                  if (isGuest) {
                    promptSignIn();
                    return;
                  }
                  try {
                    await toggleFavorite(recipeId);
                  } catch {
                    setToast({ show: true, message: "Could not update favorite." });
                  }
                }}
                onShare={
                  isGuest
                    ? () => {
                        promptSignIn();
                        return Promise.resolve();
                      }
                    : shareRecipe
                }
                onMenuClick={(event, recipeId) =>
                  setPopoverOpen({ isOpen: true, event, recipeId })
                }
                showMenu={recipe.userId === user?.id}
              />
            ))}
            <IonInfiniteScroll
              threshold="120px"
              disabled={!hasMoreRecipes}
              onIonInfinite={async (e) => {
                await loadMoreRecipes();
                await (e.target as HTMLIonInfiniteScrollElement).complete();
              }}
            >
              <IonInfiniteScrollContent loadingText="Loading more recipes…" />
            </IonInfiniteScroll>
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
          onError={(message) => setToast({ show: true, message })}
        />

        <DangerToast
          isOpen={toast.show}
          message={toast.message}
          onDidDismiss={() => setToast((t) => ({ ...t, show: false }))}
        />

        {!isGuest ? (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton routerLink="/recipes/add" color="secondary">
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
        ) : null}

        <SignInPromptAlert
          isOpen={signInAlertOpen}
          onDismiss={() => setSignInAlertOpen(false)}
          onSignIn={() => history.push("/login")}
        />
      </IonContent>
    </IonPage>
  );
};

export default RecipeList;
