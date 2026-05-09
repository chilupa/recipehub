import React, { useEffect, useMemo, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import SignInPromptAlert from "../../components/SignInPromptAlert";
import { useAuth } from "../../contexts/AuthContext";
import { useRecentlyViewed } from "../../contexts/RecentlyViewedContext";
import { useRecipes } from "../../contexts/RecipeContext";
import { useShoppingList } from "../../contexts/ShoppingListContext";
import { scaleRecipeIngredients } from "../../lib/scaleIngredientQuantities";
import RecipeDetailIngredientsPanel from "./RecipeDetailIngredientsPanel";
import RecipeDetailSummary from "./RecipeDetailSummary";
import RecipeSection from "./RecipeSection";
import {
  RecipeDetailLoadingPage,
  RecipeDetailNotFoundPage,
} from "./RecipeDetailFallbacks";
import "./RecipeDetail.css";
import { useToast } from "../../contexts/ToastContext";

const RecipeDetail: React.FC = () => {
  const { user, isGuest } = useAuth();
  const history = useHistory();
  const { recordRecipeView } = useRecentlyViewed();
  const { recipes, toggleFavorite, ensureRecipeLoaded, shareRecipe } =
    useRecipes();
  const { addFromRecipe } = useShoppingList();
  const { id } = useParams<{ id: string }>();
  const { showToast, showErrorToast } = useToast();
  const [loadFailed, setLoadFailed] = useState(false);
  const [signInAlertOpen, setSignInAlertOpen] = useState(false);
  const [scaledServings, setScaledServings] = useState(1);

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
    if (!recipe) return;
    setScaledServings(recipe.servings > 0 ? recipe.servings : 1);
  }, [recipe]);

  const displayIngredients = useMemo(() => {
    if (!recipe) return [];
    const factor =
      recipe.servings > 0 ? scaledServings / recipe.servings : 1;
    return scaleRecipeIngredients(recipe.ingredients, factor);
  }, [recipe, scaledServings]);

  useEffect(() => {
    if (!recipe?.id) return;
    recordRecipeView(recipe.id);
  }, [recipe?.id, recordRecipeView]);

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
              showErrorToast("Could not share recipe.");
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
              showErrorToast("Could not update favorite.");
            }
          }}
          onGoToTag={goToTag}
          onGoToTotalTime={goToTotalTime}
          onGoToServings={goToServings}
        />

        <RecipeDetailIngredientsPanel
          recipe={recipe}
          displayIngredients={displayIngredients}
          scaledServings={scaledServings}
          onScaledServingsChange={setScaledServings}
          addFromRecipe={addFromRecipe}
          onShoppingListNotify={showToast}
        />
        <RecipeSection
          title="Instructions"
          items={recipe.instructions}
          numbered
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
