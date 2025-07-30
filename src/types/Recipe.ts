export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  image?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked: boolean;
  author: string;
}

export interface NewRecipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  image?: string;
  tags: string[];
}