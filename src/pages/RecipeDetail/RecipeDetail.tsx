import React, { useEffect, useMemo, useState } from "react";
import { IonContent, IonIcon, IonPage, IonToast } from "@ionic/react";
import { cartOutline } from "ionicons/icons";
import { useHistory, useParams } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import SignInPromptAlert from "../../components/SignInPromptAlert";
import { useAuth } from "../../contexts/AuthContext";
import { useRecipes } from "../../contexts/RecipeContext";
import { useShoppingList } from "../../contexts/ShoppingListContext";
import RecipeDetailSummary from "./RecipeDetailSummary";
import RecipeSection from "./RecipeSection";
import {
  RecipeDetailLoadingPage,
  RecipeDetailNotFoundPage,
} from "./RecipeDetailFallbacks";
import "./RecipeDetail.css";

const RecipeDetail: React.FC = () => {
  const { user, isGuest } = useAuth();
  const history = useHistory();
  const { recipes, toggleFavorite, ensureRecipeLoaded, shareRecipe } =
    useRecipes();
  const { addFromRecipe } = useShoppingList();
  const { id } = useParams<{ id: string }>();
  const [toast, setToast] = useState({ show: false, message: "" });
  const [loadFailed, setLoadFailed] = useState(false);
  const [signInAlertOpen, setSignInAlertOpen] = useState(false);

  const promptSignIn = () => setSignInAlertOpen(true);

  const guardGuestNav = (fn: () => void) => {
    if (isGuest) {
      promptSignIn();
      return;
    }
    fn();
  };

  const recipe = useMemo(() => recipes.find((r) => r.id === id), [recipes, id]);

  useEffect(() => {
    if (!id) return;
    setLoadFailed(false);
    if (recipes.some((r) => r.id === id)) return;

    let cancelled = false;
    void ensureRecipeLoaded(id).then((ok) => {
      if (!cancelled && !ok) setLoadFailed(true);
    });

    return () => {
      cancelled = true;
    };
  }, [id, recipes, ensureRecipeLoaded]);

  if (!recipe) {
    if (!loadFailed) return <RecipeDetailLoadingPage />;
    return <RecipeDetailNotFoundPage />;
  }

  const totalMinutes = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  const goToTag = (tag: string) => {
    guardGuestNav(() =>
      history.push(`/recipes/tag/${encodeURIComponent(tag)}`),
    );
  };

  const goToTotalTime = () => {
    if (totalMinutes > 0) {
      guardGuestNav(() => history.push(`/recipes/total-time/${totalMinutes}`));
    }
  };

  const goToServings = () => {
    if (recipe.servings > 0) {
      guardGuestNav(() => history.push(`/recipes/servings/${recipe.servings}`));
    }
  };

  return (
    <IonPage>
      <AppHeader showBackButton />
      <IonContent className="ion-padding">
        <RecipeDetailSummary
          recipe={recipe}
          showEditButton={recipe.userId === user?.id}
          totalMinutes={totalMinutes}
          onShareClick={async () => {
            if (isGuest) {
              promptSignIn();
              return;
            }
            try {
              await shareRecipe(recipe);
            } catch {
              setToast({
                show: true,
                message: "Could not share recipe.",
              });
            }
          }}
          onFavoriteToggle={async () => {
            if (isGuest) {
              promptSignIn();
              return;
            }
            try {
              await toggleFavorite(recipe.id);
            } catch {
              setToast({
                show: true,
                message: "Could not update favorite.",
              });
            }
          }}
          onGoToTag={goToTag}
          onGoToTotalTime={goToTotalTime}
          onGoToServings={goToServings}
        />

        <RecipeSection
          title="Ingredients"
          items={recipe.ingredients}
          headerAction={
            <button
              type="button"
              className="recipe-detail-shop-inline"
              aria-label="Add ingredients to shopping list"
              onClick={() => {
                const n = addFromRecipe(recipe);
                if (n === 0) {
                  setToast({
                    show: true,
                    message:
                      "Those ingredients are already on your shopping list.",
                  });
                } else {
                  setToast({
                    show: true,
                    message: `Added ${n} ${n === 1 ? "item" : "items"} to your shopping list.`,
                  });
                }
              }}
            >
              <IonIcon icon={cartOutline} aria-hidden />
              <span className="recipe-detail-shop-inline-label">
                Add to list
              </span>
            </button>
          }
        />
        <RecipeSection
          title="Instructions"
          items={recipe.instructions}
          numbered
        />

        <IonToast
          isOpen={toast.show}
          onDidDismiss={() => setToast((t) => ({ ...t, show: false }))}
          message={toast.message}
          duration={2000}
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

export default RecipeDetail;
