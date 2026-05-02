import React from "react";
import {
  IonCard,
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonText,
} from "@ionic/react";
import { time, people, ellipsisVertical } from "ionicons/icons";
import { Recipe } from "../types/Recipe";
import UserAvatar from "./UserAvatar";
import FavoriteHeartButton from "./FavoriteHeartButton";
import "./RecipeCard.css";

interface RecipeCardProps {
  recipe: Recipe;
  onFavorite: (id: string) => Promise<void>;
  onShare: (recipe: Recipe) => void;
  onMenuClick?: (event: Event, recipeId: string) => void;
  showMenu?: boolean;
}

const formatFavorites = (count: number): string => {
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
  onFavorite,
  onShare: _onShare,
  onMenuClick,
  showMenu = false,
}) => {
  const totalMinutes = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);
  const titleId = `recipe-card-title-${recipe.id}`;
  const createdAtDate = new Date(recipe.createdAt);
  const createdAtTooltip = Number.isNaN(createdAtDate.getTime())
    ? undefined
    : createdAtDate.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });

  return (
    <IonCard
      className="recipe-card"
      button
      routerLink={`/recipes/recipe/${recipe.id}`}
      aria-labelledby={titleId}
    >
      <div className="recipe-card__body">
        <div className="recipe-card__head">
          <div className="recipe-card__text">
            <h4 id={titleId} className="recipe-card__title">
              {recipe.title}
            </h4>
            {recipe.description ? (
              <p className="recipe-card__description">{recipe.description}</p>
            ) : null}
          </div>
          {showMenu && onMenuClick && (
            <IonButton
              className="recipe-card__menu-btn"
              fill="clear"
              color="medium"
              size="small"
              id={`trigger-${recipe.id}`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onMenuClick(e.nativeEvent, recipe.id);
              }}
            >
              <IonIcon icon={ellipsisVertical} />
            </IonButton>
          )}
        </div>

        <div className="recipe-card__chips">
          {totalMinutes > 0 && (
            <IonChip
              className="recipe-card__chip"
              color="primary"
              aria-label={`${totalMinutes} minutes total`}
            >
              <IonIcon className="recipe-card__chip-icon" icon={time} />
              <IonLabel>{totalMinutes} min</IonLabel>
            </IonChip>
          )}
          {recipe.servings > 0 && (
            <IonChip
              className="recipe-card__chip"
              color="secondary"
              aria-label={
                recipe.servings === 1
                  ? "1 serving"
                  : `${recipe.servings} servings`
              }
            >
              <IonIcon className="recipe-card__chip-icon" icon={people} />
              <IonLabel>{recipe.servings}</IonLabel>
            </IonChip>
          )}
          {recipe.tags.slice(0, 1).map((tag, index) => (
            <IonChip
              key={index}
              className="recipe-card__chip recipe-card__chip--tag"
              color="tertiary"
              aria-label={`Tag: ${tag}`}
            >
              <IonLabel className="recipe-card__chip-label--ellipsis">
                {tag}
              </IonLabel>
            </IonChip>
          ))}
          {recipe.tags.length > 1 && (
            <IonChip
              className="recipe-card__chip"
              color="light"
              title={`${recipe.tags.length - 1} more tags`}
              aria-label={`${recipe.tags.length - 1} more tags`}
            >
              <IonLabel>+{recipe.tags.length - 1}</IonLabel>
            </IonChip>
          )}
        </div>

        <div className="recipe-card__footer">
          <div className="recipe-card__byline">
            <UserAvatar name={recipe.author} size={20} color="primary" />
            <IonText color="dark" className="recipe-card__byline-text">
              <span className="recipe-card__author">{recipe.author}</span>
              <span className="recipe-card__byline-sep" aria-hidden="true">
                •
              </span>
              <time
                className="recipe-card__age"
                dateTime={recipe.createdAt}
                title={createdAtTooltip}
              >
                {formatTimeAgo(recipe.createdAt)}
              </time>
            </IonText>
          </div>
          <div className="recipe-card__actions">
            <FavoriteHeartButton
              isLiked={recipe.isLiked}
              size="small"
              stopEventPropagation
              className="recipe-card__favorite"
              onToggle={() => onFavorite(recipe.id).catch(() => {})}
            >
              {recipe.likes > 0 && formatFavorites(recipe.likes)}
            </FavoriteHeartButton>
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
