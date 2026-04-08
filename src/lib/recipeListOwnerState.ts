export type RecipeMenuPopoverState = {
  isOpen: boolean;
  event: Event | undefined;
  recipeId: string;
};

export const emptyRecipeMenuPopoverState: RecipeMenuPopoverState = {
  isOpen: false,
  event: undefined,
  recipeId: "",
};

export type DeleteRecipeAlertState = {
  isOpen: boolean;
  recipeId: string;
  recipeName: string;
};

export const emptyDeleteRecipeAlertState: DeleteRecipeAlertState = {
  isOpen: false,
  recipeId: "",
  recipeName: "",
};
