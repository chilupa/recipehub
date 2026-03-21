import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonText,
  IonList,
  IonItem,
  IonInput,
  IonToast,
  IonSpinner,
} from "@ionic/react";
import { time, people, createOutline, add, close } from "ionicons/icons";
import { useRecipes } from "../contexts/RecipeContext";
import { useAuth } from "../contexts/AuthContext";
import { useParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import FavoriteHeartButton from "../components/FavoriteHeartButton";
import UserAvatar from "../components/UserAvatar";

const MAX_TAGS = 5;
const formatFavorites = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

const RecipeDetail: React.FC = () => {
  const { user } = useAuth();
  const { recipes, toggleFavorite, updateRecipe, ensureRecipeLoaded } =
    useRecipes();
  const { id } = useParams<{ id: string }>();
  const [newTag, setNewTag] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [loadFailed, setLoadFailed] = useState(false);

  const recipe = recipes.find((r) => r.id === id);
  const tags = recipe?.tags ?? [];

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

  const handleAddTag = async () => {
    if (!recipe || !id) return;
    const tag = newTag.trim();
    if (!tag) return;
    if (tags.includes(tag)) {
      setToast({ show: true, message: "Tag already added" });
      return;
    }
    if (tags.length >= MAX_TAGS) {
      setToast({ show: true, message: `Max ${MAX_TAGS} tags` });
      return;
    }
    try {
      await updateRecipe(id, { tags: [...tags, tag] });
    } catch {
      setToast({ show: true, message: "Could not add tag." });
      return;
    }
    setNewTag("");
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!recipe || !id) return;
    try {
      await updateRecipe(id, {
        tags: tags.filter((t) => t !== tagToRemove),
      });
    } catch {
      setToast({ show: true, message: "Could not remove tag." });
    }
  };

  if (!recipe) {
    if (!loadFailed) {
      return (
        <IonPage>
          <AppHeader showBackButton={true} />
          <IonContent className="ion-padding">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 48,
              }}
            >
              <IonSpinner name="crescent" />
              <IonText color="medium">
                <p style={{ marginTop: 12 }}>Loading recipe…</p>
              </IonText>
            </div>
          </IonContent>
        </IonPage>
      );
    }
    return (
      <IonPage>
        <AppHeader title="Recipe Not Found" showBackButton={true} />
        <IonContent className="ion-padding">
          <IonText>Recipe not found.</IonText>
        </IonContent>
      </IonPage>
    );
  }

  const totalMinutes = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <IonPage>
      <AppHeader showBackButton={true} />
      <IonContent className="ion-padding">
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <h1
              style={{
                margin: "0 0 8px 0",
                fontSize: "24px",
                flex: 1,
                minWidth: 0,
              }}
            >
              {recipe.title}
            </h1>
            {recipe.userId === user?.id && (
              <IonButton
                fill="clear"
                size="small"
                routerLink={`/recipes/edit/${recipe.id}`}
                style={{ margin: "-8px -8px 0 0", minHeight: "36px" }}
              >
                <IonIcon icon={createOutline} slot="icon-only" />
              </IonButton>
            )}
          </div>
          {recipe.description ? (
            <p style={{ color: "var(--ion-color-medium)", margin: "0 0 12px 0" }}>
              {recipe.description}
            </p>
          ) : null}

          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            <IonChip color="primary">
              <IonIcon icon={time} />
              <IonLabel>{totalMinutes} min</IonLabel>
            </IonChip>
            <IonChip color="secondary">
              <IonIcon icon={people} />
              <IonLabel>{recipe.servings} servings</IonLabel>
            </IonChip>
          </div>

       
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
              {tags.map((tag) => (
                <IonChip key={tag} color="tertiary">
                  <IonLabel>{tag}</IonLabel>
                </IonChip>
              ))}
            </div>


          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <UserAvatar color="tertiary" name={recipe.author} />
              <IonText color="medium">
                <p style={{ margin: 0 }}>{recipe.author}</p>
              </IonText>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FavoriteHeartButton
                isLiked={recipe.isLiked}
                onToggle={async () => {
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
          </div>
        </div>

        {recipe.ingredients.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ margin: "0 0 12px 0", fontSize: "20px" }}>
              Ingredients
            </h2>
            <IonList>
              {recipe.ingredients.map((ingredient, index) => (
                <IonItem key={index}>
                  <IonLabel>{ingredient}</IonLabel>
                </IonItem>
              ))}
            </IonList>
          </div>
        )}

        {recipe.instructions.length > 0 && (
          <div>
            <h2 style={{ margin: "0 0 12px 0", fontSize: "20px" }}>
              Instructions
            </h2>
            <IonList>
              {recipe.instructions.map((instruction, index) => (
                <IonItem key={index} >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        minWidth: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "var(--ion-color-secondary)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "bold",
                        marginTop: "2px",
                      }}
                    >
                      {index + 1}
                    </div>
                    <IonLabel style={{ whiteSpace: "normal" }}>
                      {instruction}
                    </IonLabel>
                  </div>
                </IonItem>
              ))}
            </IonList>
          </div>
        )}

        <IonToast
          isOpen={toast.show}
          onDidDismiss={() => setToast((t) => ({ ...t, show: false }))}
          message={toast.message}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default RecipeDetail;
