import React, { useEffect, useMemo, useState } from "react";
import {
  IonAlert,
  IonButton,
  IonChip,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSpinner,
  IonText,
  IonToast,
} from "@ionic/react";
import { createOutline, people, shareOutline, time } from "ionicons/icons";
import { useHistory, useParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import FavoriteHeartButton from "../components/FavoriteHeartButton";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../contexts/AuthContext";
import { useRecipes } from "../contexts/RecipeContext";
import type { Recipe } from "../types/Recipe";
import { isShareWebHost } from "../lib/shareWeb";
import "./RecipeDetail.css";

const formatFavorites = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

type RecipeSectionProps = {
  title: string;
  items: string[];
  numbered?: boolean;
};

const RecipeSection: React.FC<RecipeSectionProps> = ({
  title,
  items,
  numbered = false,
}) => {
  if (items.length === 0) return null;

  return (
    <section className="recipe-detail-section">
      <h2 className="recipe-detail-section-title">{title}</h2>
      <IonList>
        {items.map((item, index) => (
          <IonItem key={`${title}-${index}-${item}`}>
            {numbered ? (
              <div className="recipe-detail-instruction-row">
                <div className="recipe-detail-step-number">{index + 1}</div>
                <IonLabel className="recipe-detail-multiline">{item}</IonLabel>
              </div>
            ) : (
              <IonLabel>{item}</IonLabel>
            )}
          </IonItem>
        ))}
      </IonList>
    </section>
  );
};

const RecipeDetail: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const { recipes, toggleFavorite, ensureRecipeLoaded, shareRecipe } =
    useRecipes();
  const { id } = useParams<{ id: string }>();
  const shareWebReadOnly = isShareWebHost();
  const [toast, setToast] = useState({ show: false, message: "" });
  const [loadFailed, setLoadFailed] = useState(false);
  const [signInAlertOpen, setSignInAlertOpen] = useState(false);

  const promptSignIn = () => setSignInAlertOpen(true);

  const guardSignedInNav = (fn: () => void) => {
    if (shareWebReadOnly) return;
    if (!user) {
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
    if (!loadFailed) {
      return (
        <IonPage>
          <AppHeader showBackButton />
          <IonContent className="ion-padding">
            <div className="recipe-detail-loading-wrap">
              <IonSpinner name="crescent" />
              <IonText color="medium">
                <p className="recipe-detail-loading-text">Loading recipe…</p>
              </IonText>
            </div>
          </IonContent>
        </IonPage>
      );
    }

    return (
      <IonPage>
        <AppHeader title="Recipe Not Found" showBackButton />
        <IonContent className="ion-padding">
          <IonText>Recipe not found.</IonText>
          <IonButton
            expand="block"
            className="recipe-detail-not-found-btn"
            routerLink="/recipes"
          >
            Back to recipes
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  const totalMinutes = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  const goToTag = (tag: string) => {
    guardSignedInNav(() =>
      history.push(`/recipes/tag/${encodeURIComponent(tag)}`),
    );
  };

  const goToTotalTime = () => {
    if (totalMinutes > 0) {
      guardSignedInNav(() =>
        history.push(`/recipes/total-time/${totalMinutes}`),
      );
    }
  };

  const goToServings = () => {
    if (recipe.servings > 0) {
      guardSignedInNav(() =>
        history.push(`/recipes/servings/${recipe.servings}`),
      );
    }
  };

  return (
    <IonPage>
      <AppHeader showBackButton={!shareWebReadOnly} showMenu={!shareWebReadOnly} />
      <IonContent className="ion-padding">
        <div className="recipe-detail-top">
          <div className="recipe-detail-header-row">
            <h1 className="recipe-detail-title">{recipe.title}</h1>
            {!shareWebReadOnly ? (
              <div className="recipe-detail-header-actions">
                <IonButton
                  fill="clear"
                  size="small"
                  className="recipe-detail-share-btn"
                  onClick={async () => {
                    if (!user) {
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
                >
                  <IonIcon icon={shareOutline} slot="icon-only" />
                </IonButton>
                {recipe.userId === user?.id && (
                  <IonButton
                    fill="clear"
                    size="small"
                    routerLink={`/recipes/edit/${recipe.id}`}
                    className="recipe-detail-edit-btn"
                  >
                    <IonIcon icon={createOutline} slot="icon-only" />
                  </IonButton>
                )}
              </div>
            ) : null}
          </div>

          {recipe.description ? (
            <p className="recipe-detail-description">{recipe.description}</p>
          ) : null}

          {!shareWebReadOnly ? (
            <IonText color="medium">
              <p className="recipe-detail-chip-hint">
                Tap chips to explore similar recipes
              </p>
            </IonText>
          ) : null}

          <div className="recipe-detail-meta-chips">
            {totalMinutes > 0 && (
              <IonChip
                color="primary"
                className={shareWebReadOnly ? undefined : "recipe-detail-chip-clickable"}
                onClick={shareWebReadOnly ? undefined : goToTotalTime}
                role={shareWebReadOnly ? undefined : "button"}
                tabIndex={shareWebReadOnly ? undefined : 0}
                onKeyDown={
                  shareWebReadOnly
                    ? undefined
                    : (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          goToTotalTime();
                        }
                      }
                }
              >
                <IonIcon icon={time} />
                <IonLabel>{totalMinutes} min</IonLabel>
              </IonChip>
            )}

            {recipe.servings > 0 && (
              <IonChip
                color="secondary"
                className={shareWebReadOnly ? undefined : "recipe-detail-chip-clickable"}
                onClick={shareWebReadOnly ? undefined : goToServings}
                role={shareWebReadOnly ? undefined : "button"}
                tabIndex={shareWebReadOnly ? undefined : 0}
                onKeyDown={
                  shareWebReadOnly
                    ? undefined
                    : (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          goToServings();
                        }
                      }
                }
              >
                <IonIcon icon={people} />
                <IonLabel>{recipe.servings} servings</IonLabel>
              </IonChip>
            )}
          </div>

          <div className="recipe-detail-tag-row">
            {recipe.tags.map((tag) => (
              <IonChip
                key={tag}
                color="tertiary"
                className={shareWebReadOnly ? undefined : "recipe-detail-chip-clickable"}
                onClick={shareWebReadOnly ? undefined : () => goToTag(tag)}
                role={shareWebReadOnly ? undefined : "button"}
                tabIndex={shareWebReadOnly ? undefined : 0}
                onKeyDown={
                  shareWebReadOnly
                    ? undefined
                    : (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          goToTag(tag);
                        }
                      }
                }
              >
                <IonLabel>{tag}</IonLabel>
              </IonChip>
            ))}
          </div>

          <div className="recipe-detail-author-row">
            <div className="recipe-detail-author-block">
              <UserAvatar color="tertiary" name={recipe.author} />
              <IonText color="medium">
                <p className="recipe-detail-author-name">{recipe.author}</p>
              </IonText>
            </div>

            {!shareWebReadOnly ? (
              <div className="recipe-detail-actions">
                <FavoriteHeartButton
                  isLiked={recipe.isLiked}
                  onToggle={async () => {
                    if (!user) {
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
                >
                  {recipe.likes > 0 && formatFavorites(recipe.likes)}
                </FavoriteHeartButton>
              </div>
            ) : null}
          </div>
        </div>

        <RecipeSection title="Ingredients" items={recipe.ingredients} />
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

        {!shareWebReadOnly ? (
          <IonAlert
            isOpen={signInAlertOpen}
            onDidDismiss={() => setSignInAlertOpen(false)}
            header="Keep going"
            message="It only takes a moment to sign in."
            buttons={[
              { text: "Cancel", role: "cancel" },
              {
                text: "Sign in",
                handler: () => {
                  history.push("/login");
                  return true;
                },
              },
            ]}
          />
        ) : null}
      </IonContent>
    </IonPage>
  );
};

export default RecipeDetail;
