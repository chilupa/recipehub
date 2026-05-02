import React, { useCallback, useState } from "react";
import {
  IonContent,
  IonPage,
  IonSearchbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import DangerToast from "../components/DangerToast";
import NoData from "../components/NoData";
import SearchRecipeResultCard from "../components/SearchRecipeResultCard";
import SearchRecipesLoadingGrid from "../components/SearchRecipesLoadingGrid";
import SignInPromptAlert from "../components/SignInPromptAlert";
import { useAuth } from "../contexts/AuthContext";
import { useRecipes } from "../contexts/RecipeContext";
import { useSearchRecipesQuery } from "../hooks/useSearchRecipesQuery";
import {
  emptySearchNoResults,
  emptySearchPrompt,
} from "../lib/emptyStateMessages";
import { GUEST_VIEWER_ID } from "../lib/guestBrowse";
import type { Recipe } from "../types/Recipe";
import "./SearchRecipes.css";

const SearchRecipes: React.FC = () => {
  const history = useHistory();
  const { user, isGuest } = useAuth();
  const { toggleFavorite, shareRecipe } = useRecipes();
  const viewerId = user?.id ?? GUEST_VIEWER_ID;
  const [toast, setToast] = useState({ show: false, message: "" });
  const [signInAlertOpen, setSignInAlertOpen] = useState(false);

  const onSearchFailed = useCallback(() => {
    setToast({ show: true, message: "Could not search recipes." });
  }, []);

  const {
    inputValue,
    setInputValue,
    submittedQuery,
    results,
    setResults,
    searching,
    hasSubmittedSearch,
    submitSearch,
    clearQuery,
  } = useSearchRecipesQuery({ viewerId, onSearchFailed });

  const promptSignIn = () => setSignInAlertOpen(true);

  const handleToggleFavorite = async (recipe: Recipe) => {
    if (isGuest) {
      promptSignIn();
      return;
    }
    try {
      await toggleFavorite(recipe.id);
      setResults((prev) =>
        prev.map((item) =>
          item.id === recipe.id
            ? {
                ...item,
                isLiked: !item.isLiked,
                likes: item.isLiked
                  ? Math.max(0, item.likes - 1)
                  : item.likes + 1,
              }
            : item,
        ),
      );
    } catch {
      setToast({ show: true, message: "Could not update favorite." });
    }
  };

  return (
    <IonPage>
      <AppHeader title="Search" />
      <IonContent fullscreen className="search-recipes-content">
        <div className="search-recipes-input-wrap">
          <IonSearchbar
            value={inputValue}
            debounce={0}
            enterkeyhint="search"
            inputmode="search"
            onIonInput={(e) => setInputValue(e.detail.value ?? "")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitSearch();
              }
            }}
            onIonClear={clearQuery}
            placeholder="What sounds good?"
            showClearButton="focus"
          />
        </div>

        {!hasSubmittedSearch ? (
          <div className="search-recipes-tab-empty">
            <NoData {...emptySearchPrompt} />
          </div>
        ) : searching ? (
          <SearchRecipesLoadingGrid />
        ) : results.length === 0 ? (
          <div className="search-recipes-tab-empty">
            <NoData {...emptySearchNoResults(submittedQuery)} />
          </div>
        ) : (
          <div className="search-recipes-grid">
            {results.map((recipe) => (
              <SearchRecipeResultCard
                key={recipe.id}
                recipe={recipe}
                isGuest={isGuest}
                onSignInRequired={promptSignIn}
                onToggleFavorite={handleToggleFavorite}
                onShare={(r) => {
                  void shareRecipe(r);
                }}
              />
            ))}
          </div>
        )}

        <SignInPromptAlert
          isOpen={signInAlertOpen}
          onDismiss={() => setSignInAlertOpen(false)}
          onSignIn={() => history.push("/login")}
        />

        <DangerToast
          isOpen={toast.show}
          message={toast.message}
          onDidDismiss={() =>
            setToast((current) => ({ ...current, show: false }))
          }
        />
      </IonContent>
    </IonPage>
  );
};

export default SearchRecipes;
