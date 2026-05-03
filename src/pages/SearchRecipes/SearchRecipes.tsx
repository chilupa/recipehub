import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import AppHeader from "../../components/AppHeader";
import DangerToast from "../../components/DangerToast";
import NoData from "../../components/NoData";
import SearchRecipeResultCard from "../../components/SearchRecipeResultCard";
import SearchRecipesLoadingGrid from "../../components/SearchRecipesLoadingGrid";
import {
  emptySearchNoResults,
  emptySearchPrompt,
} from "../../lib/emptyStateMessages";
import SearchRecipesSearchBar from "./SearchRecipesSearchBar";
import { useSearchRecipesScreen } from "./useSearchRecipesScreen";
import "./SearchRecipes.css";

const SearchRecipes: React.FC = () => {
  const {
    inputValue,
    setInputValue,
    submittedQuery,
    results,
    searching,
    hasSubmittedSearch,
    submitSearch,
    clearQuery,
    toast,
    dismissToast,
  } = useSearchRecipesScreen();

  return (
    <IonPage>
      <AppHeader />
      <IonContent fullscreen className="search-recipes-content">
        <SearchRecipesSearchBar
          inputValue={inputValue}
          onInput={setInputValue}
          onSubmitSearch={submitSearch}
          onClear={clearQuery}
        />

        {!hasSubmittedSearch ? (
          <div className="search-recipes-tab-empty">
            <NoData {...emptySearchPrompt} />
          </div>
        ) : searching ? (
          <SearchRecipesLoadingGrid />
        ) : results.length === 0 ? (
          <div className="search-recipes-tab-empty">
            <NoData {...emptySearchNoResults(submittedQuery)} />
          </div>
        ) : (
          <div className="search-recipes-grid">
            {results.map((recipe) => (
              <SearchRecipeResultCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        <DangerToast
          isOpen={toast.show}
          message={toast.message}
          onDidDismiss={dismissToast}
        />
      </IonContent>
    </IonPage>
  );
};

export default SearchRecipes;
