import React, { useMemo } from "react";
import { IonCard } from "@ionic/react";

const LOADING_CARD_COUNT = 14;

const SearchRecipesLoadingGrid: React.FC = () => {
  const loadingCards = useMemo(
    () =>
      Array.from({ length: LOADING_CARD_COUNT }, (_, index) => (
        <IonCard
          className="search-recipes-card search-recipes-card--skeleton"
          key={index}
        >
          <div className="search-recipes-skeleton-line search-recipes-skeleton-line--title" />
          <div className="search-recipes-skeleton-line" />
          <div className="search-recipes-skeleton-line search-recipes-skeleton-line--short" />
        </IonCard>
      )),
    [],
  );

  return (
    <div
      className="search-recipes-grid search-recipes-grid--loading"
      aria-busy="true"
      aria-label="Searching recipes"
    >
      {loadingCards}
    </div>
  );
};

export default SearchRecipesLoadingGrid;
