import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  IonButton,
  IonCard,
  IonContent,
  IonIcon,
  IonPage,
  IonSearchbar,
} from "@ionic/react";
import { shareSocial } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import DangerToast from "../components/DangerToast";
import FavoriteHeartButton from "../components/FavoriteHeartButton";
import NoData from "../components/NoData";
import {
  emptySearchNoResults,
  emptySearchPrompt,
} from "../lib/emptyStateMessages";
import SignInPromptAlert from "../components/SignInPromptAlert";
import { useAuth } from "../contexts/AuthContext";
import { useRecipes } from "../contexts/RecipeContext";
import { GUEST_VIEWER_ID } from "../lib/guestBrowse";
import { searchRecipesByQuery } from "../lib/recipeSupabase";
import type { Recipe } from "../types/Recipe";
import "./SearchRecipes.css";

const LOADING_CARD_COUNT = 14;

const formatFavorites = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

const SearchRecipes: React.FC = () => {
  const history = useHistory();
  const { user, isGuest } = useAuth();
  const { toggleFavorite, shareRecipe } = useRecipes();
  const viewerId = user?.id ?? GUEST_VIEWER_ID;
  const latestRequestRef = useRef(0);
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [results, setResults] = useState<Recipe[]>([]);
  const [searching, setSearching] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [signInAlertOpen, setSignInAlertOpen] = useState(false);

  const hasSubmittedSearch = submittedQuery.trim().length > 0;

  useEffect(() => {
    const q = submittedQuery.trim();
    if (!q) {
      latestRequestRef.current += 1;
      setResults([]);
      setSearching(false);
      return;
    }

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    setSearching(true);

    void (async () => {
      try {
        const list = await searchRecipesByQuery(q, viewerId);
        if (latestRequestRef.current !== requestId) return;
        setResults(list);
      } catch {
        if (latestRequestRef.current !== requestId) return;
        setResults([]);
        setToast({ show: true, message: "Could not search recipes." });
      } finally {
        if (latestRequestRef.current === requestId) {
          setSearching(false);
        }
      }
    })();
  }, [submittedQuery, viewerId]);

  const promptSignIn = () => setSignInAlertOpen(true);

  const submitSearch = () => {
    setSubmittedQuery(inputValue.trim());
  };

  const loadingCards = useMemo(
    () =>
      Array.from({ length: LOADING_CARD_COUNT }, (_, index) => (
        <IonCard
          className="search-recipes-card search-recipes-card--skeleton"
          key={index}
        >
          <div className="search-recipes-skeleton-line search-recipes-skeleton-line--title" />
          <div className="search-recipes-skeleton-line" />
          <div className="search-recipes-skeleton-line search-recipes-skeleton-line--short" />
        </IonCard>
      )),
    [],
  );

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
            onIonClear={() => {
              setInputValue("");
              setSubmittedQuery("");
            }}
            placeholder="What sounds good?"
            showClearButton="focus"
          />
        </div>

        {!hasSubmittedSearch ? (
          <div className="search-recipes-tab-empty">
            <NoData {...emptySearchPrompt} />
          </div>
        ) : searching ? (
          <div
            className="search-recipes-grid search-recipes-grid--loading"
            aria-busy="true"
            aria-label="Searching recipes"
          >
            {loadingCards}
          </div>
        ) : results.length === 0 ? (
          <div className="search-recipes-tab-empty">
            <NoData {...emptySearchNoResults(submittedQuery)} />
          </div>
        ) : (
          <div className="search-recipes-grid">
            {results.map((recipe) => {
              const description = (recipe.description ?? "").trim();
              return (
                <IonCard
                  key={recipe.id}
                  className="search-recipes-card"
                  button
                  routerLink={`/recipes/recipe/${recipe.id}`}
                >
                  <h3 className="search-recipes-title">{recipe.title}</h3>

                  {description ? (
                    <p className="search-recipes-description">{description}</p>
                  ) : null}

                  <div className="search-recipes-spacer" />

                  <div className="search-recipes-actions">
                    <FavoriteHeartButton
                      isLiked={recipe.isLiked}
                      size="small"
                      stopEventPropagation
                      onToggle={async () => {
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
                          setToast({
                            show: true,
                            message: "Could not update favorite.",
                          });
                        }
                      }}
                    >
                      {recipe.likes > 0 ? formatFavorites(recipe.likes) : null}
                    </FavoriteHeartButton>

                    <IonButton
                      fill="clear"
                      color="medium"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (isGuest) {
                          promptSignIn();
                          return;
                        }
                        void shareRecipe(recipe);
                      }}
                    >
                      <IonIcon icon={shareSocial} />
                    </IonButton>
                  </div>
                </IonCard>
              );
            })}
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
