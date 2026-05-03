import React from "react";
import { IonCard, IonSkeletonText } from "@ionic/react";
import "../RecipeCard/RecipeCard.css";
import "./RecipeCardSkeleton.css";

const RecipeCardSkeleton: React.FC = () => (
  <IonCard className="recipe-card recipe-card-skeleton">
    <div className="recipe-card__body">
      <div className="recipe-card-skeleton-head">
        <div className="recipe-card-skeleton-head__text">
          <IonSkeletonText
            animated
            className="recipe-card-skeleton__sk recipe-card-skeleton__sk--title-wide"
          />
          <IonSkeletonText
            animated
            className="recipe-card-skeleton__sk recipe-card-skeleton__sk--title-narrow"
          />
          <IonSkeletonText
            animated
            className="recipe-card-skeleton__sk recipe-card-skeleton__sk--desc-full"
          />
          <IonSkeletonText
            animated
            className="recipe-card-skeleton__sk recipe-card-skeleton__sk--desc-short"
          />
        </div>
        <IonSkeletonText
          animated
          className="recipe-card-skeleton__sk recipe-card-skeleton__sk--menu"
        />
      </div>
      <div className="recipe-card-skeleton-chips">
        <IonSkeletonText
          animated
          className="recipe-card-skeleton__sk recipe-card-skeleton__sk--chip-1"
        />
        <IonSkeletonText
          animated
          className="recipe-card-skeleton__sk recipe-card-skeleton__sk--chip-2"
        />
        <IonSkeletonText
          animated
          className="recipe-card-skeleton__sk recipe-card-skeleton__sk--chip-3"
        />
      </div>
      <div className="recipe-card-skeleton-footer">
        <div className="recipe-card-skeleton-footer__byline">
          <IonSkeletonText
            animated
            className="recipe-card-skeleton__sk recipe-card-skeleton__sk--avatar"
          />
          <IonSkeletonText
            animated
            className="recipe-card-skeleton__sk recipe-card-skeleton__sk--author"
          />
        </div>
        <IonSkeletonText
          animated
          className="recipe-card-skeleton__sk recipe-card-skeleton__sk--action"
        />
      </div>
    </div>
  </IonCard>
);

export default RecipeCardSkeleton;
