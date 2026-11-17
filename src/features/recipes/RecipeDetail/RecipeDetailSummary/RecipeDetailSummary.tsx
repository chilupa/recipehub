import React from "react";
import { IonChip, IonIcon, IonLabel } from "@ionic/react";
import { people, time } from "ionicons/icons";
import { useHistory } from "react-router-dom";

import FavoriteHeartButton from "../../../../components/FavoriteHeartButton";
import UserAvatar from "../../../../components/UserAvatar";
import { AppButton, AppIcon, TextHeading } from "../../../../design-system";
import type { Recipe } from "../../../../types/Recipe";
import { formatTagLabel } from "../../../../utils/formatTag";
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
}) => {
  const history = useHistory();

  return (
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
        <TextHeading level={1} className="recipe-detail-title">
          {recipe.title}
        </TextHeading>
        {showEditButton ? (
          <div className="recipe-detail-header-actions">
            <AppButton
              variant="text"
              aria-label="Edit recipe"
              className="recipe-detail-edit-btn"
              onClick={() => history.push(`/recipes/edit/${recipe.id}`)}
            >
              <AppIcon name="createOutline" size="md" />
            </AppButton>
          </div>
        ) : null}
      </div>

      {recipe.description ? (
        <p className="recipe-detail-description">{recipe.description}</p>
      ) : null}

      <p className="recipe-detail-chip-hint">Tap to explore similar recipes</p>

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
            <IonLabel>
              {totalMinutes} {totalMinutes === 1 ? "Min" : "Mins"}
            </IonLabel>
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
            <IonLabel>
              {recipe.servings}{" "}
              {recipe.servings === 1 ? "Serving" : "Servings"}
            </IonLabel>
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
            <IonLabel>{formatTagLabel(tag)}</IonLabel>
          </IonChip>
        ))}
      </div>

      <div className="recipe-detail-author-row">
        <div className="recipe-detail-author-block">
          <UserAvatar
            name={recipe.author}
            src={recipe.authorAvatarUrl}
            size={20}
            color="primary"
          />
          <p className="recipe-detail-author-name">{recipe.author}</p>
        </div>

        <div className="recipe-detail-actions">
          <div className="recipe-detail-share-wrap">
            <AppButton
              variant="text"
              className="recipe-detail-share-btn"
              onClick={onShareClick}
              aria-label="Share recipe"
            >
              <AppIcon name="shareOutline" size="md" />
            </AppButton>
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
};

export default RecipeDetailSummary;
