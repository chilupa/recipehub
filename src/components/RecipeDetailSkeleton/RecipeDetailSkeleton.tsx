import React from "react";
import {
  IonItem,
  IonList,
  IonSkeletonText,
} from "@ionic/react";
import "../../pages/RecipeDetail/RecipeDetail.css";
import "./RecipeDetailSkeleton.css";

const RecipeDetailSkeleton: React.FC = () => (
  <div aria-busy="true" aria-label="Loading recipe">
    <div className="recipe-detail-top">
      <div className="recipe-detail-header-row">
        <div className="recipe-detail-skeleton__header-text">
          <IonSkeletonText
            animated
            className="recipe-detail-skeleton__st recipe-detail-skeleton__st--title-1"
          />
          <IonSkeletonText
            animated
            className="recipe-detail-skeleton__st recipe-detail-skeleton__st--title-2"
          />
        </div>
        <div className="recipe-detail-skeleton__header-actions">
          <IonSkeletonText
            animated
            className="recipe-detail-skeleton__st recipe-detail-skeleton__st--header-icon"
          />
          <IonSkeletonText
            animated
            className="recipe-detail-skeleton__st recipe-detail-skeleton__st--header-icon"
          />
        </div>
      </div>

      <IonSkeletonText
        animated
        className="recipe-detail-skeleton__st recipe-detail-skeleton__st--line-full"
      />
      <IonSkeletonText
        animated
        className="recipe-detail-skeleton__st recipe-detail-skeleton__st--line-88"
      />

      <IonSkeletonText
        animated
        className="recipe-detail-skeleton__st recipe-detail-skeleton__st--line-200"
      />

      <div className="recipe-detail-chips-scroll recipe-detail-skeleton__chips">
        <IonSkeletonText
          animated
          className="recipe-detail-skeleton__st recipe-detail-skeleton__st--chip"
        />
        <IonSkeletonText
          animated
          className="recipe-detail-skeleton__st recipe-detail-skeleton__st--chip"
        />
        <IonSkeletonText
          animated
          className="recipe-detail-skeleton__st recipe-detail-skeleton__st--chip"
        />
        <IonSkeletonText
          animated
          className="recipe-detail-skeleton__st recipe-detail-skeleton__st--chip"
        />
        <IonSkeletonText
          animated
          className="recipe-detail-skeleton__st recipe-detail-skeleton__st--chip"
        />
      </div>

      <div className="recipe-detail-author-row">
        <div className="recipe-detail-author-block">
          <IonSkeletonText
            animated
            className="recipe-detail-skeleton__st recipe-detail-skeleton__st--avatar"
          />
          <IonSkeletonText
            animated
            className="recipe-detail-skeleton__st recipe-detail-skeleton__st--author-line"
          />
        </div>
        <IonSkeletonText
          animated
          className="recipe-detail-skeleton__st recipe-detail-skeleton__st--action-btn"
        />
      </div>
    </div>

    <section className="recipe-detail-section">
      <IonSkeletonText
        animated
        className="recipe-detail-skeleton__st recipe-detail-skeleton__st--section-h recipe-detail-skeleton__section-title"
      />
      <IonList lines="full">
        {[1, 2, 3, 4, 5].map((i) => (
          <IonItem key={i} className="recipe-detail-skeleton__ing-item">
            <IonSkeletonText
              animated
              className="recipe-detail-skeleton__st recipe-detail-skeleton__st--ing-line"
            />
          </IonItem>
        ))}
      </IonList>
    </section>

    <section className="recipe-detail-section">
      <IonSkeletonText
        animated
        className="recipe-detail-skeleton__st recipe-detail-skeleton__st--section-h-wide recipe-detail-skeleton__section-title"
      />
      <IonList lines="full">
        {[1, 2, 3].map((i) => (
          <IonItem key={i}>
            <div className="recipe-detail-instruction-row recipe-detail-skeleton__instr-row">
              <IonSkeletonText
                animated
                className="recipe-detail-skeleton__st recipe-detail-skeleton__st--step-num"
              />
              <IonSkeletonText
                animated
                className="recipe-detail-skeleton__st recipe-detail-skeleton__st--step-text"
              />
            </div>
          </IonItem>
        ))}
      </IonList>
    </section>
  </div>
);

export default RecipeDetailSkeleton;
