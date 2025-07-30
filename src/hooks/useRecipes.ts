import { useState, useEffect } from 'react';
import { Recipe, NewRecipe } from '../types/Recipe';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';

const STORAGE_KEY = 'recipe-logger-recipes';

const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Creamy Mushroom Risotto',
    description: 'Rich and creamy arborio rice with mixed mushrooms and fresh herbs',
    ingredients: ['1 1/2 cups arborio rice', '4 cups vegetable broth', '1 lb mixed mushrooms', '1/2 cup white wine', '1/2 cup parmesan cheese', '3 cloves garlic', '2 tbsp butter', 'Fresh thyme'],
    instructions: ['Sauté mushrooms until golden', 'Heat broth in separate pot', 'Toast rice with garlic', 'Add wine and stir until absorbed', 'Add broth gradually, stirring constantly', 'Finish with butter and parmesan'],
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    tags: ['vegetarian', 'risotto', 'mushrooms', 'creamy', 'italian'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    likes: 1247,
    isLiked: true,
    author: 'Chef Maria'
  },
  {
    id: '2',
    title: 'Spicy Paneer Tikka Masala',
    description: 'Tender paneer cubes in rich tomato-based curry with aromatic spices',
    ingredients: ['400g paneer', '2 tomatoes', '1 onion', '3 cloves garlic', '1 inch ginger', '2 tsp garam masala', '1 tsp turmeric', '1/2 cup cream', 'Basmati rice'],
    instructions: ['Marinate paneer in spices', 'Grill paneer until charred', 'Make tomato-onion base', 'Add spices and cook', 'Add grilled paneer and cream', 'Serve with rice and naan'],
    prepTime: 20,
    cookTime: 25,
    servings: 4,
    tags: ['vegetarian', 'indian', 'spicy', 'paneer', 'curry'],
    createdAt: '2024-01-14T18:45:00Z',
    updatedAt: '2024-01-14T18:45:00Z',
    likes: 892,
    isLiked: false,
    author: 'Spice Garden'
  },
  {
    id: '3',
    title: 'Classic Chocolate Chip Cookies',
    description: 'Soft, chewy cookies with the perfect balance of crispy edges and gooey centers',
    ingredients: ['2 1/4 cups flour', '1 cup butter', '3/4 cup brown sugar', '1/2 cup white sugar', '2 eggs', '2 tsp vanilla', '1 tsp baking soda', '2 cups chocolate chips'],
    instructions: ['Preheat oven to 375°F', 'Cream butter and sugars', 'Beat in eggs and vanilla', 'Mix in dry ingredients', 'Fold in chocolate chips', 'Drop on baking sheet', 'Bake 9-11 minutes'],
    prepTime: 15,
    cookTime: 11,
    servings: 24,
    tags: ['vegetarian', 'dessert', 'cookies', 'chocolate', 'baking'],
    createdAt: '2024-01-13T14:20:00Z',
    updatedAt: '2024-01-13T14:20:00Z',
    likes: 2156,
    isLiked: true,
    author: 'Sweet Treats Co'
  },
  {
    id: '4',
    title: 'Mediterranean Quinoa Bowl',
    description: 'Healthy and colorful bowl packed with fresh vegetables, quinoa, and tahini dressing',
    ingredients: ['1 cup quinoa', '1 cucumber', '2 tomatoes', '1/2 red onion', '1/2 cup olives', '1/4 cup feta cheese', '2 tbsp tahini', '1 lemon', 'Olive oil', 'Fresh herbs'],
    instructions: ['Cook quinoa according to package', 'Dice all vegetables', 'Make tahini dressing with lemon and olive oil', 'Combine quinoa and vegetables', 'Top with feta and olives', 'Drizzle with dressing'],
    prepTime: 20,
    cookTime: 15,
    servings: 3,
    tags: ['vegetarian', 'vegan', 'mediterranean', 'quinoa', 'fresh'],
    createdAt: '2024-01-12T12:15:00Z',
    updatedAt: '2024-01-12T12:15:00Z',
    likes: 634,
    isLiked: false,
    author: 'Healthy Eats'
  },
  {
    id: '5',
    title: 'Stuffed Bell Peppers',
    description: 'Colorful bell peppers stuffed with quinoa, black beans, and melted cheese',
    ingredients: ['4 bell peppers', '1 cup quinoa', '1 can black beans', '1 cup corn', '1 onion', '2 cloves garlic', '1 cup cheddar cheese', '1 tsp cumin', 'Cilantro'],
    instructions: ['Cut tops off peppers and remove seeds', 'Cook quinoa with vegetable broth', 'Sauté onion and garlic', 'Mix quinoa, beans, corn, and spices', 'Stuff peppers with mixture', 'Top with cheese and bake 30 minutes'],
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    tags: ['vegetarian', 'stuffed', 'peppers', 'quinoa', 'healthy'],
    createdAt: '2024-01-11T09:00:00Z',
    updatedAt: '2024-01-11T09:00:00Z',
    likes: 1789,
    isLiked: true,
    author: 'Garden Fresh'
  }
];

export const useRecipes = () => {
  const { user } = useSupabaseAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (user) {
      loadRecipes();
    }
  }, [user]);

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
        author: recipe.author || user?.email || 'You'
      })) || [];
      
      setRecipes(formattedRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const saveRecipes = (newRecipes: Recipe[]) => {
    setRecipes(newRecipes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecipes));
  };

  const addRecipe = async (newRecipe: NewRecipe) => {
    console.log('addRecipe called with:', newRecipe);
    console.log('user:', user);
    
    if (!user) {
      console.log('No user found, returning');
      return;
    }
    
    try {
      console.log('Attempting to insert recipe into database...');
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
          author: user.email || 'You',
          likes: 0,
          is_liked: false
        }])
        .select()
        .single();
      
      console.log('Database response:', { data, error });
      
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
      
      console.log('Formatted recipe:', formattedRecipe);
      console.log('Current recipes before update:', recipes);
      
      setRecipes(prevRecipes => [formattedRecipe, ...prevRecipes]);
      
      console.log('Recipe added successfully');
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
      
      setRecipes(prevRecipes => prevRecipes.map(recipe =>
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
      
      setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== id));
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
      
      setRecipes(prevRecipes => prevRecipes.map(r =>
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
      // Fallback: copy to clipboard
      const shareText = `${recipe.title}\n\n${recipe.description}\n\nIngredients:\n${recipe.ingredients.join('\n')}\n\nInstructions:\n${recipe.instructions.join('\n')}`;
      await navigator.clipboard.writeText(shareText);
      alert('Recipe copied to clipboard!');
    }
  };

  return {
    recipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleLike,
    shareRecipe
  };
};