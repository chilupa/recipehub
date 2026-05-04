import React from "react";
import { IonButton, IonChip, IonIcon, IonLabel, IonText } from "@ionic/react";
import { people, shareOutline, createOutline, time } from "ionicons/icons";
import FavoriteHeartButton from "../../../components/FavoriteHeartButton";
import UserAvatar from "../../../components/UserAvatar";
import type { Recipe } from "../../../types/Recipe";
import { formatFavorites } from "../recipeDetailFormat";
import "../RecipeDetail.css";

type Props = {
  recipe: Recipe;
  showEditButton: boolean;
  totalMinutes: number;
  onShareClick: () => void;
  onFavoriteToggle: () => void;
  onGoToTag: (tag: string) => void;
  onGoToTotalTime: () => void;
  onGoToServings: () => void;
};

const RecipeDetailSummary: React.FC<Props> = ({
  recipe,
  showEditButton,
  totalMinutes,
  onShareClick,
  onFavoriteToggle,
  onGoToTag,
  onGoToTotalTime,
  onGoToServings,
}) => (
  <div className="recipe-detail-top">
    {recipe.image ? (
      <div className="recipe-detail-hero">
        <img
          className="recipe-detail-hero-img"
          src={recipe.image}
          alt=""
          decoding="async"
        />
      </div>
    ) : null}

    <div className="recipe-detail-header-row">
      <h1 className="recipe-detail-title">{recipe.title}</h1>
      {showEditButton ? (
        <div className="recipe-detail-header-actions">
          <IonButton
            fill="clear"
            size="small"
            routerLink={`/recipes/edit/${recipe.id}`}
            className="recipe-detail-edit-btn"
          >
            <IonIcon icon={createOutline} slot="icon-only" />
          </IonButton>
        </div>
      ) : null}
    </div>

    {recipe.description ? (
      <p className="recipe-detail-description">{recipe.description}</p>
    ) : null}

    <IonText color="medium">
      <p className="recipe-detail-chip-hint">Tap to explore similar recipes</p>
    </IonText>

    <div
      className="recipe-detail-chips-scroll"
      role="region"
      aria-label="Recipe tags and quick facts"
    >
      {totalMinutes > 0 && (
        <IonChip
          color="primary"
          className="recipe-detail-chip-clickable recipe-detail-chip-scroll-item"
          onClick={onGoToTotalTime}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onGoToTotalTime();
            }
          }}
        >
          <IonIcon icon={time} />
          <IonLabel>{totalMinutes} min</IonLabel>
        </IonChip>
      )}

      {recipe.servings > 0 && (
        <IonChip
          color="secondary"
          className="recipe-detail-chip-clickable recipe-detail-chip-scroll-item"
          onClick={onGoToServings}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onGoToServings();
            }
          }}
        >
          <IonIcon icon={people} />
          <IonLabel>{recipe.servings} servings</IonLabel>
        </IonChip>
      )}

      {recipe.tags.map((tag) => (
        <IonChip
          key={tag}
          color="tertiary"
          className="recipe-detail-chip-clickable recipe-detail-chip-scroll-item"
          onClick={() => onGoToTag(tag)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onGoToTag(tag);
            }
          }}
        >
          <IonLabel>{tag}</IonLabel>
        </IonChip>
      ))}
    </div>

    <div className="recipe-detail-author-row">
      <div className="recipe-detail-author-block">
        <UserAvatar name={recipe.author} size={20} color="primary" />
        <IonText color="medium">
          <p className="recipe-detail-author-name">{recipe.author}</p>
        </IonText>
      </div>

      <div className="recipe-detail-actions">
        <div className="recipe-detail-share-wrap">
          <IonButton
            fill="clear"
            size="small"
            className="recipe-detail-share-btn"
            onClick={onShareClick}
            aria-label="Share recipe"
          >
            <IonIcon icon={shareOutline} slot="icon-only" />
          </IonButton>
          {recipe.shareCount > 0 ? (
            <span className="recipe-detail-share-count">
              {formatFavorites(recipe.shareCount)}
            </span>
          ) : null}
        </div>
        <FavoriteHeartButton
          isLiked={recipe.isLiked}
          onToggle={onFavoriteToggle}
        >
          {recipe.likes > 0 && formatFavorites(recipe.likes)}
        </FavoriteHeartButton>
      </div>
    </div>
  </div>
);

export default RecipeDetailSummary;
