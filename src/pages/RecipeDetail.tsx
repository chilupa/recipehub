import React from "react";
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
} from "@ionic/react";
import { heart, heartOutline, share, time, people } from "ionicons/icons";
import { useRecipes } from "../contexts/RecipeContext";
import { useParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import UserAvatar from "../components/UserAvatar";

const formatLikes = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

const RecipeDetail: React.FC = () => {
  const { recipes, toggleLike, shareRecipe } = useRecipes();
  const { id } = useParams<{ id: string }>();

  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <IonPage>
        <AppHeader title="Recipe Not Found" showBackButton={true} />
        <IonContent className="ion-padding">
          <IonText>Recipe not found.</IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <AppHeader showBackButton={true} />
      <IonContent className="ion-padding">
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "24px" }}>
            {recipe.title}
          </h1>
          <p style={{ color: "var(--ion-color-medium)" }}>
            {recipe.description}
          </p>

          <div
            style={{
              display: "flex",
              gap: "2px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            <IonChip color="primary">
              <IonIcon icon={time} />
              <IonLabel>{recipe.prepTime + recipe.cookTime + " "} min</IonLabel>
            </IonChip>
            <IonChip color="secondary">
              <IonIcon icon={people} />
              <IonLabel>{recipe.servings} servings</IonLabel>
            </IonChip>
            {recipe.tags.map((tag, index) => (
              <IonChip key={index} color="tertiary">
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
                <p>{recipe.author}</p>
              </IonText>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <IonButton
                fill="clear"
                color={recipe.isLiked ? "danger" : "medium"}
                onClick={() => toggleLike(recipe.id)}
              >
                <IonIcon
                  icon={recipe.isLiked ? heart : heartOutline}
                  slot="start"
                />
                {recipe.likes > 0 && formatLikes(recipe.likes)}
              </IonButton>
              {/* <IonButton
                fill="clear"
                color="medium"
                onClick={() => shareRecipe(recipe)}
              >
                <IonIcon icon={share} slot="start" />
                Share
              </IonButton> */}
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
                <IonItem key={index}>
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
      </IonContent>
    </IonPage>
  );
};

export default RecipeDetail;
