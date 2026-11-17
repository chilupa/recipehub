import {
  MAX_TAG_LENGTH,
  MAX_TAGS,
  linesFromText,
  type FormState,
} from "./recipeFormModel";

export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 2000;
export const MAX_MINUTES = 24 * 60;
export const MAX_SERVINGS = 999;

export type RecipeFormFieldErrors = {
  title?: string;
  description?: string;
  ingredientsText?: string;
  instructionsText?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  tag?: string;
};

export function getTagInputError(
  newTag: string,
  tags: string[],
): string | undefined {
  const trimmed = newTag.trim();
  if (!trimmed) return undefined;
  if (tags.length >= MAX_TAGS) {
    return `You can add up to ${MAX_TAGS} tags.`;
  }
  if (trimmed.length > MAX_TAG_LENGTH) {
    return `Tag is too long (max ${MAX_TAG_LENGTH} characters).`;
  }
  if (tags.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())) {
    return "That tag is already added.";
  }
  return undefined;
}

export function validateRecipeForm(form: FormState): RecipeFormFieldErrors {
  const errors: RecipeFormFieldErrors = {};
  const title = form.title.trim();

  if (!title) {
    errors.title = "Enter a recipe title.";
  } else if (title.length > TITLE_MAX) {
    errors.title = `Title is too long (max ${TITLE_MAX} characters).`;
  }

  if (form.description.trim().length > DESCRIPTION_MAX) {
    errors.description = `Description is too long (max ${DESCRIPTION_MAX} characters).`;
  }

  if (linesFromText(form.ingredientsText).length === 0) {
    errors.ingredientsText = "Add at least one ingredient (one per line).";
  }

  if (linesFromText(form.instructionsText).length === 0) {
    errors.instructionsText = "Add at least one step (one per line).";
  }

  if (form.prepTime > MAX_MINUTES) {
    errors.prepTime = `Prep time max is ${MAX_MINUTES} minutes.`;
  }
  if (form.cookTime > MAX_MINUTES) {
    errors.cookTime = `Cook time max is ${MAX_MINUTES} minutes.`;
  }
  if (form.servings > MAX_SERVINGS) {
    errors.servings = `Servings max is ${MAX_SERVINGS}.`;
  }

  return errors;
}

export function firstFieldErrorKey(
  errors: RecipeFormFieldErrors,
): keyof RecipeFormFieldErrors | undefined {
  const order: (keyof RecipeFormFieldErrors)[] = [
    "title",
    "description",
    "ingredientsText",
    "instructionsText",
    "prepTime",
    "cookTime",
    "servings",
    "tag",
  ];
  return order.find((key) => Boolean(errors[key]));
}
