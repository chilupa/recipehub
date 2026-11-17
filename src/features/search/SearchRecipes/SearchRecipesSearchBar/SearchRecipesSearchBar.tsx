import React from "react";

import { AppSearchBar } from "../../../../design-system";

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
    <AppSearchBar
      value={inputValue}
      debounce={0}
      placeholder="What sounds good?"
      onChange={onInput}
      onSubmit={onSubmitSearch}
      onClear={onClear}
    />
  </div>
);

export default SearchRecipesSearchBar;
