import React, { useMemo, useState } from "react";
import {
  IonContent,
  IonPage,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
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
import { emptyFeedGuest, emptyFeedSignedIn } from "../lib/emptyStateMessages";
import DangerToast from "../components/DangerToast";
import SignInPromptAlert from "../components/SignInPromptAlert";
import RecipeListSkeleton from "../components/RecipeListSkeleton";
import ListPageShell from "../components/ListPageShell";
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
  const visibleRecipes = useMemo(() => recipes, [recipes]);

  const emptyView = (
    <NoData {...(isGuest ? emptyFeedGuest : emptyFeedSignedIn)} />
  );

  return (
    <IonPage>
      <AppHeader />
      <IonContent fullscreen>
        <ListPageShell
          loading={recipesLoading}
          isEmpty={visibleRecipes.length === 0}
          onRefresh={refreshRecipes}
          loadingView={<RecipeListSkeleton />}
          emptyView={emptyView}
        >
            {visibleRecipes.map((recipe) => (
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
        </ListPageShell>

        <RecipeOwnerMenuPopover
          state={popoverOpen}
          recipes={visibleRecipes}
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
          afterDelete={refreshRecipes}
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
