import React from "react";

import { TextHeading } from "../../../../design-system";

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
        <TextHeading level={2} className="recipe-detail-section-title">
          {title}
        </TextHeading>
        {headerAction ? (
          <div className="recipe-detail-section-heading-action">
            {headerAction}
          </div>
        ) : null}
      </div>
      <ol
        className={
          numbered
            ? "recipe-detail-list recipe-detail-list--steps"
            : "recipe-detail-list recipe-detail-list--ingredients"
        }
      >
        {items.map((item, index) => (
          <li
            key={`${title}-${index}-${item}`}
            className="recipe-detail-list__item"
          >
            <span className="recipe-detail-list__index" aria-hidden="true">
              {index + 1}
            </span>
            <span className="recipe-detail-list__text">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default RecipeSection;
