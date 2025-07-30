import React, { createContext, useContext, useState, useEffect } from 'react';
import { Recipe, NewRecipe } from '../types/Recipe';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface RecipeContextType {
  recipes: Recipe[];
  addRecipe: (recipe: NewRecipe) => Promise<void>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  shareRecipe: (recipe: Recipe) => Promise<void>;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSupabaseAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadRecipes();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user?.id)
        .single();
      
      if (data?.name) {
        setUserName(data.name);
      }
    } catch (error) {
      console.log('No profile found');
    }
  };

  const loadRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedRecipes = data?.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: recipe.prep_time,
        cookTime: recipe.cook_time,
        servings: recipe.servings,
        tags: recipe.tags,
        createdAt: recipe.created_at,
        updatedAt: recipe.updated_at,
        likes: recipe.likes || 0,
        isLiked: recipe.is_liked || false,
        author: recipe.author || userName || user?.email || 'You'
      })) || [];
      
      setRecipes(formattedRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const addRecipe = async (newRecipe: NewRecipe) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert([{
          title: newRecipe.title,
          description: newRecipe.description,
          ingredients: newRecipe.ingredients,
          instructions: newRecipe.instructions,
          prep_time: newRecipe.prepTime,
          cook_time: newRecipe.cookTime,
          servings: newRecipe.servings,
          tags: newRecipe.tags,
          user_id: user.id,
          author: userName || user.email || 'You',
          likes: 0,
          is_liked: false
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      const formattedRecipe: Recipe = {
        id: data.id,
        title: data.title,
        description: data.description,
        ingredients: data.ingredients,
        instructions: data.instructions,
        prepTime: data.prep_time,
        cookTime: data.cook_time,
        servings: data.servings,
        tags: data.tags,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        likes: data.likes,
        isLiked: data.is_liked,
        author: data.author
      };
      
      setRecipes(prev => [formattedRecipe, ...prev]);
    } catch (error) {
      console.error('Error adding recipe:', error);
    }
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('recipes')
        .update({
          title: updates.title,
          description: updates.description,
          ingredients: updates.ingredients,
          instructions: updates.instructions,
          prep_time: updates.prepTime,
          cook_time: updates.cookTime,
          servings: updates.servings,
          tags: updates.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setRecipes(prev => prev.map(recipe =>
        recipe.id === id
          ? { ...recipe, ...updates, updatedAt: new Date().toISOString() }
          : recipe
      ));
    } catch (error) {
      console.error('Error updating recipe:', error);
    }
  };

  const deleteRecipe = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const toggleLike = async (id: string) => {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe || !user) return;
    
    const newLikedState = !recipe.isLiked;
    const newLikeCount = newLikedState ? recipe.likes + 1 : recipe.likes - 1;
    
    try {
      const { error } = await supabase
        .from('recipes')
        .update({
          likes: newLikeCount,
          is_liked: newLikedState
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setRecipes(prev => prev.map(r =>
        r.id === id
          ? { ...r, isLiked: newLikedState, likes: newLikeCount }
          : r
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const shareRecipe = async (recipe: Recipe) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipe.description}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      const shareText = `${recipe.title}\n\n${recipe.description}\n\nIngredients:\n${recipe.ingredients.join('\n')}\n\nInstructions:\n${recipe.instructions.join('\n')}`;
      await navigator.clipboard.writeText(shareText);
      alert('Recipe copied to clipboard!');
    }
  };

  return (
    <RecipeContext.Provider value={{
      recipes,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      toggleLike,
      shareRecipe
    }}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
};