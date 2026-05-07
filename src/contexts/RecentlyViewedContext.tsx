import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { loadRecentlyViewedIds, saveRecentlyViewedIds } from "../lib/recentlyViewedStorage";
import { shoppingScopeId } from "../lib/shoppingListStorage";
import { useAuth } from "./AuthContext";

const MAX_RECENT_IDS = 25;

type RecentlyViewedContextValue = {
  recentRecipeIds: string[];
  recordRecipeView: (recipeId: string) => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(
  null,
);

export const RecentlyViewedProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, isGuest, isLoading } = useAuth();
  const scopeId = useMemo(
    () => shoppingScopeId(user?.id, isGuest),
    [user?.id, isGuest],
  );

  const [recentRecipeIds, setRecentRecipeIds] = useState<string[]>([]);

  useLayoutEffect(() => {
    if (isLoading) return;
    setRecentRecipeIds(loadRecentlyViewedIds(scopeId));
  }, [scopeId, isLoading]);

  const recordRecipeView = useCallback(
    (recipeId: string) => {
      const id = recipeId.trim();
      if (!id) return;
      setRecentRecipeIds((prev) => {
        const next = [id, ...prev.filter((x) => x !== id)].slice(
          0,
          MAX_RECENT_IDS,
        );
        saveRecentlyViewedIds(scopeId, next);
        return next;
      });
    },
    [scopeId],
  );

  const value = useMemo(
    () => ({ recentRecipeIds, recordRecipeView }),
    [recentRecipeIds, recordRecipeView],
  );

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export function useRecentlyViewed(): RecentlyViewedContextValue {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) {
    throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  }
  return ctx;
}
