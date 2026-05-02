import { useEffect, useRef, useState } from "react";
import { searchRecipesByQuery } from "../lib/recipeSupabase";
import type { Recipe } from "../types/Recipe";

type Options = {
  viewerId: string;
  onSearchFailed?: () => void;
};

export function useSearchRecipesQuery({ viewerId, onSearchFailed }: Options) {
  const latestRequestRef = useRef(0);
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [results, setResults] = useState<Recipe[]>([]);
  const [searching, setSearching] = useState(false);

  const hasSubmittedSearch = submittedQuery.trim().length > 0;

  useEffect(() => {
    const q = submittedQuery.trim();
    if (!q) {
      latestRequestRef.current += 1;
      setResults([]);
      setSearching(false);
      return;
    }

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    setSearching(true);

    void (async () => {
      try {
        const list = await searchRecipesByQuery(q, viewerId);
        if (latestRequestRef.current !== requestId) return;
        setResults(list);
      } catch {
        if (latestRequestRef.current !== requestId) return;
        setResults([]);
        onSearchFailed?.();
      } finally {
        if (latestRequestRef.current === requestId) {
          setSearching(false);
        }
      }
    })();
  }, [submittedQuery, viewerId, onSearchFailed]);

  const submitSearch = () => {
    setSubmittedQuery(inputValue.trim());
  };

  const clearQuery = () => {
    setInputValue("");
    setSubmittedQuery("");
  };

  return {
    inputValue,
    setInputValue,
    submittedQuery,
    results,
    setResults,
    searching,
    hasSubmittedSearch,
    submitSearch,
    clearQuery,
  };
}
