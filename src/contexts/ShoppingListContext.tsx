import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Recipe } from "../types/Recipe";
import { unsuppressProfileShoppingTabBadge } from "../utils/profileShoppingTabBadge";

const STORAGE_KEY = "recipehub-shopping-v1";

export type ShoppingLine = {
  id: string;
  text: string;
  checked: boolean;
  recipeId: string;
  recipeTitle: string;
};

type ShoppingListContextValue = {
  items: ShoppingLine[];
  addFromRecipe: (recipe: Recipe) => number;
  toggleLine: (id: string) => void;
  removeLine: (id: string) => void;
  clearChecked: () => void;
  clearAll: () => void;
  addCustomLine: (text: string) => void;
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function normKey(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function loadFromStorage(): ShoppingLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is ShoppingLine =>
        row != null &&
        typeof row === "object" &&
        typeof (row as ShoppingLine).id === "string" &&
        typeof (row as ShoppingLine).text === "string" &&
        typeof (row as ShoppingLine).checked === "boolean" &&
        typeof (row as ShoppingLine).recipeId === "string" &&
        typeof (row as ShoppingLine).recipeTitle === "string",
    );
  } catch {
    return [];
  }
}

const ShoppingListContext = createContext<ShoppingListContextValue | null>(
  null,
);

export const ShoppingListProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<ShoppingLine[]>(() => loadFromStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota */
    }
  }, [items]);

  const addFromRecipe = useCallback((recipe: Recipe): number => {
    const trimmed = recipe.ingredients
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (trimmed.length === 0) return 0;

    let added = 0;
    setItems((prev) => {
      const existing = new Set(
        prev
          .filter((l) => l.recipeId === recipe.id)
          .map((l) => normKey(l.text)),
      );
      const toAdd: ShoppingLine[] = [];
      for (const text of trimmed) {
        if (existing.has(normKey(text))) continue;
        existing.add(normKey(text));
        toAdd.push({
          id: newId(),
          text,
          checked: false,
          recipeId: recipe.id,
          recipeTitle: recipe.title,
        });
      }
      added = toAdd.length;
      if (toAdd.length === 0) return prev;
      return [...prev, ...toAdd];
    });
    if (added > 0) unsuppressProfileShoppingTabBadge();
    return added;
  }, []);

  const toggleLine = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((l) => (l.id === id ? { ...l, checked: !l.checked } : l)),
    );
  }, []);

  const removeLine = useCallback((id: string) => {
    setItems((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clearChecked = useCallback(() => {
    setItems((prev) => prev.filter((l) => !l.checked));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const addCustomLine = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    setItems((prev) => [
      ...prev,
      {
        id: newId(),
        text: t,
        checked: false,
        recipeId: "__custom",
        recipeTitle: "Other",
      },
    ]);
    unsuppressProfileShoppingTabBadge();
  }, []);

  const value = useMemo(
    () => ({
      items,
      addFromRecipe,
      toggleLine,
      removeLine,
      clearChecked,
      clearAll,
      addCustomLine,
    }),
    [
      items,
      addFromRecipe,
      toggleLine,
      removeLine,
      clearChecked,
      clearAll,
      addCustomLine,
    ],
  );

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
};

export function useShoppingList(): ShoppingListContextValue {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) {
    throw new Error("useShoppingList must be used within ShoppingListProvider");
  }
  return ctx;
}
