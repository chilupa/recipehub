import React, { useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import DeleteRecipeConfirmAlert from "../../components/DeleteRecipeConfirmAlert";
import NoData from "../../components/NoData";
import RecentlyViewedStrip from "../../components/RecentlyViewedStrip";
import RecipeOwnerMenuPopover from "../../components/RecipeOwnerMenuPopover";
import SearchRecipeResultCard from "../../components/SearchRecipeResultCard";
import SearchRecipesLoadingGrid from "../../components/SearchRecipesLoadingGrid";
import SignInPromptAlert from "../../components/SignInPromptAlert";
import { useAuth } from "../../contexts/AuthContext";
import { useRecentlyViewed } from "../../contexts/RecentlyViewedContext";
import { useRecipes } from "../../contexts/RecipeContext";
import { useResolvedRecentRecipes } from "../../hooks/useResolvedRecentRecipes";
import {
  emptySearchNoResults,
  emptySearchPrompt,
} from "../../lib/emptyStateMessages";
import {
  emptyDeleteRecipeAlertState,
  emptyRecipeMenuPopoverState,
} from "../../lib/recipeListOwnerState";
import type { DeleteRecipeAlertState } from "../../lib/recipeListOwnerState";
import SearchRecipesSearchBar from "./SearchRecipesSearchBar";
import { useSearchRecipesScreen } from "./useSearchRecipesScreen";
import "./SearchRecipes.css";

const SearchRecipes: React.FC = () => {
  const history = useHistory();
  const { user, isGuest } = useAuth();
  const { recentRecipeIds } = useRecentlyViewed();
  const {
    recipes,
    toggleFavorite,
    shareRecipe,
    deleteRecipe,
    ensureRecipeLoaded,
    refreshRecipes,
  } = useRecipes();
  const recentRecipes = useResolvedRecentRecipes(
    recentRecipeIds,
    recipes,
    ensureRecipeLoaded,
  );

  const [popoverOpen, setPopoverOpen] = useState(emptyRecipeMenuPopoverState);
  const [deleteAlert, setDeleteAlert] = useState<DeleteRecipeAlertState>(
    emptyDeleteRecipeAlertState,
  );
  const [signInAlertOpen, setSignInAlertOpen] = useState(false);

  const promptSignIn = () => setSignInAlertOpen(true);

  const {
    inputValue,
    setInputValue,
    submittedQuery,
    results,
    searching,
    hasSubmittedSearch,
    submitSearch,
    clearQuery,
    showErrorToast,
  } = useSearchRecipesScreen();

  return (
    <IonPage>
      <AppHeader />
      <IonContent fullscreen className="search-recipes-content">
        <SearchRecipesSearchBar
          inputValue={inputValue}
          onInput={setInputValue}
          onSubmitSearch={submitSearch}
          onClear={clearQuery}
        />

        {!hasSubmittedSearch ? (
          <div className="search-recipes-idle-prompt">
            <NoData {...emptySearchPrompt} />
          </div>
        ) : null}

        {recentRecipes.length > 0 ? (
          <div className="search-recipes-recent">
            <RecentlyViewedStrip
              recipes={recentRecipes}
              onFavorite={async (recipeId) => {
                if (isGuest) {
                  promptSignIn();
                  return;
                }
                try {
                  await toggleFavorite(recipeId);
                } catch {
                  showErrorToast("Could not update favorite.");
                }
              }}
              onShare={
                isGuest
                  ? () => promptSignIn()
                  : (recipe) => {
                      void shareRecipe(recipe);
                    }
              }
              onMenuClick={(event, recipeId) =>
                setPopoverOpen({ isOpen: true, event, recipeId })
              }
              showMenuForRecipeId={(recipeId) => {
                const r = recipes.find((x) => x.id === recipeId);
                return r != null && r.userId === user?.id;
              }}
            />
          </div>
        ) : null}

        {hasSubmittedSearch ? (
          searching ? (
            <SearchRecipesLoadingGrid />
          ) : results.length === 0 ? (
            <div className="search-recipes-tab-empty">
              <NoData {...emptySearchNoResults(submittedQuery)} />
            </div>
          ) : (
            <div className="search-recipes-grid">
              {results.map((recipe) => (
                <SearchRecipeResultCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )
        ) : null}

        <RecipeOwnerMenuPopover
          state={popoverOpen}
          recipes={recentRecipes}
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
          onError={(message) => showErrorToast(message)}
        />

        <SignInPromptAlert
          isOpen={signInAlertOpen}
          onDismiss={() => setSignInAlertOpen(false)}
          onSignIn={() => history.push("/login")}
        />
      </IonContent>
    </IonPage>
  );
};

export default SearchRecipes;
