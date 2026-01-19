import React from "react";
import {
  IonCard,
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonText,
} from "@ionic/react";
import {
  heart,
  heartOutline,
  share,
  time,
  people,
  ellipsisVertical,
} from "ionicons/icons";
import { Recipe } from "../types/Recipe";
import UserAvatar from "./UserAvatar";

interface RecipeCardProps {
  recipe: Recipe;
  onLike: (id: string) => void;
  onShare: (recipe: Recipe) => void;
  onMenuClick?: (event: Event, recipeId: string) => void;
  showMenu?: boolean;
}

const formatLikes = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
};

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onLike,
  onShare,
  onMenuClick,
  showMenu = false,
}) => {
  return (
    <IonCard
      button
      routerLink={`/recipe/${recipe.id}`}
      style={{ margin: "8px 0" }}
    >
      <div style={{ padding: "12px 16px 8px 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "8px",
          }}
        >
          <div>
            <h3
              style={{
                color: "var(--ion-color-dark)",
                margin: "0 0 4px 0",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              {recipe.title}
            </h3>
            <p
              style={{
                margin: "0",
                fontSize: "14px",
                color: "var(--ion-color-medium)",
                lineHeight: "1.3",
              }}
            >
              {recipe.description}
            </p>
          </div>
          {showMenu && onMenuClick && (
            <IonButton
              fill="clear"
              color="medium"
              size="small"
              id={`trigger-${recipe.id}`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onMenuClick(e.nativeEvent, recipe.id);
              }}
              style={{ margin: "0", minHeight: "32px" }}
            >
              <IonIcon icon={ellipsisVertical} />
            </IonButton>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "8px",
            overflow: "hidden",
          }}
        >
          <IonChip color="primary" style={{ height: "24px", fontSize: "12px" }}>
            <IonIcon icon={time} style={{ fontSize: "14px" }} />
            <IonLabel>{recipe.prepTime + recipe.cookTime + " "} min</IonLabel>
          </IonChip>
          <IonChip
            color="secondary"
            style={{ height: "24px", fontSize: "12px" }}
          >
            <IonIcon icon={people} style={{ fontSize: "14px" }} />
            <IonLabel>{recipe.servings}</IonLabel>
          </IonChip>
          {recipe.tags.slice(0, 1).map((tag, index) => (
            <IonChip
              key={index}
              color="tertiary"
              style={{
                height: "24px",
                fontSize: "12px",
                maxWidth: "100px",
              }}
            >
              <IonLabel
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {tag}
              </IonLabel>
            </IonChip>
          ))}
          {recipe.tags.length > 1 && (
            <IonChip color="light" style={{ height: "24px", fontSize: "12px" }}>
              <IonLabel>+{recipe.tags.length - 1}</IonLabel>
            </IonChip>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <UserAvatar color="tertiary" name={recipe.author} size={20} />
            <IonText
              color="dark"
              style={{
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "120px",
                }}
              >
                {recipe.author}
              </span>
              <span>•</span>
              <span>{formatTimeAgo(recipe.createdAt)}</span>
            </IonText>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <IonButton
              fill="clear"
              color={recipe.isLiked ? "danger" : "medium"}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onLike(recipe.id);
              }}
              style={{ margin: "0", minHeight: "32px" }}
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
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onShare(recipe);
              }}
              style={{ margin: '0', minHeight: '32px' }}
            >
              <IonIcon icon={share} />
            </IonButton> */}
          </div>
        </div>
      </div>
    </IonCard>
  );
};

export default RecipeCard;
