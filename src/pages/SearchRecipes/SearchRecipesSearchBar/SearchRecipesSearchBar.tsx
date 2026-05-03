import React from "react";
import { IonSearchbar } from "@ionic/react";
import "./SearchRecipesSearchBar.css";

type Props = {
  inputValue: string;
  onInput: (value: string) => void;
  onSubmitSearch: () => void;
  onClear: () => void;
};

const SearchRecipesSearchBar: React.FC<Props> = ({
  inputValue,
  onInput,
  onSubmitSearch,
  onClear,
}) => (
  <div className="search-recipes-input-wrap">
    <IonSearchbar
      value={inputValue}
      debounce={0}
      enterkeyhint="search"
      inputmode="search"
      onIonInput={(e) => onInput(e.detail.value ?? "")}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSubmitSearch();
        }
      }}
      onIonClear={onClear}
      placeholder="What sounds good?"
      showClearButton="focus"
    />
  </div>
);

export default SearchRecipesSearchBar;
