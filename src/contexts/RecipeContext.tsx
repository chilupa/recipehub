import React, { createContext, useContext, useState, useEffect } from "react";
import { Recipe, NewRecipe } from "../types/Recipe";
import { useAuth } from "./AuthContext";
import { mockRecipes } from "../mocks";

interface RecipeContextType {
  recipes: Recipe[];
  addRecipe: (recipe: NewRecipe) => Promise<void>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  shareRecipe: (recipe: Recipe) => Promise<void>;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (user) {
      loadRecipes();
    } else {
      setRecipes([]);
    }
  }, [user]);

  const loadRecipes = () => {
    try {
      const stored = localStorage.getItem("recipe-logger-recipes");
      const allRecipes = stored ? JSON.parse(stored) : [];
      // Filter recipes for current user
      const userRecipes = allRecipes.filter(
        (r: Recipe) => r.userId === user?.id,
      );
      setRecipes([...mockRecipes, ...userRecipes]);
    } catch (error) {
      console.error("Error loading recipes:", error);
      setRecipes([]);
    }
  };

  const addRecipe = async (newRecipe: NewRecipe) => {
    if (!user) return;

    try {
      const recipe: Recipe = {
        id: Date.now().toString(),
        title: newRecipe.title,
        description: newRecipe.description,
        ingredients: newRecipe.ingredients,
        instructions: newRecipe.instructions,
        prepTime: newRecipe.prepTime,
        cookTime: newRecipe.cookTime,
        servings: newRecipe.servings,
        tags: newRecipe.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        author: user.name || user.email || "You",
        userId: user.id,
      };

      const stored = localStorage.getItem("recipe-logger-recipes");
      const allRecipes = stored ? JSON.parse(stored) : [];
      allRecipes.push(recipe);
      localStorage.setItem("recipe-logger-recipes", JSON.stringify(allRecipes));

      setRecipes((prev) => [recipe, ...prev]);
    } catch (error) {
      console.error("Error adding recipe:", error);
    }
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    if (!user) return;

    try {
      const stored = localStorage.getItem("recipe-logger-recipes");
      const allRecipes = stored ? JSON.parse(stored) : [];

      const updatedRecipes = allRecipes.map((recipe: Recipe) =>
        recipe.id === id
          ? {
              ...recipe,
              ...updates,
              updatedAt: new Date().toISOString(),
              userId: user.id,
            }
          : recipe,
      );

      localStorage.setItem(
        "recipe-logger-recipes",
        JSON.stringify(updatedRecipes),
      );

      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === id
            ? { ...recipe, ...updates, updatedAt: new Date().toISOString() }
            : recipe,
        ),
      );
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  };

  const deleteRecipe = async (id: string) => {
    if (!user) return;

    try {
      const stored = localStorage.getItem("recipe-logger-recipes");
      const allRecipes = stored ? JSON.parse(stored) : [];

      const filteredRecipes = allRecipes.filter(
        (recipe: Recipe) => recipe.id !== id,
      );
      localStorage.setItem(
        "recipe-logger-recipes",
        JSON.stringify(filteredRecipes),
      );

      setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const toggleLike = async (id: string) => {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe || !user) return;

    const newLikedState = !recipe.isLiked;
    const newLikeCount = newLikedState ? recipe.likes + 1 : recipe.likes - 1;

    try {
      const stored = localStorage.getItem("recipe-logger-recipes");
      const allRecipes = stored ? JSON.parse(stored) : [];

      const updatedRecipes = allRecipes.map((r: Recipe) =>
        r.id === id ? { ...r, isLiked: newLikedState, likes: newLikeCount } : r,
      );

      localStorage.setItem(
        "recipe-logger-recipes",
        JSON.stringify(updatedRecipes),
      );

      setRecipes((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, isLiked: newLikedState, likes: newLikeCount }
            : r,
        ),
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const shareRecipe = async (recipe: Recipe) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipe.description}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      const shareText = `${recipe.title}\n\n${recipe.description}\n\nIngredients:\n${recipe.ingredients.join("\n")}\n\nInstructions:\n${recipe.instructions.join("\n")}`;
      await navigator.clipboard.writeText(shareText);
      alert("Recipe copied to clipboard!");
    }
  };

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        toggleLike,
        shareRecipe,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipes must be used within RecipeProvider");
  }
  return context;
};
