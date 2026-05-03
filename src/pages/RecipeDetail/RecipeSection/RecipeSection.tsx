import React from "react";
import { IonItem, IonLabel, IonList } from "@ionic/react";
import "../RecipeDetail.css";

type RecipeSectionProps = {
  title: string;
  items: string[];
  numbered?: boolean;
  /** Optional control next to the section title (e.g. compact “add to list”). */
  headerAction?: React.ReactNode;
};

const RecipeSection: React.FC<RecipeSectionProps> = ({
  title,
  items,
  numbered = false,
  headerAction,
}) => {
  if (items.length === 0) return null;

  return (
    <section className="recipe-detail-section">
      <div className="recipe-detail-section-heading">
        <h2 className="recipe-detail-section-title">{title}</h2>
        {headerAction ? (
          <div className="recipe-detail-section-heading-action">{headerAction}</div>
        ) : null}
      </div>
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

export default RecipeSection;
