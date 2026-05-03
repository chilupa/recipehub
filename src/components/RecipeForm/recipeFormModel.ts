import type { NewRecipe } from "../../types/Recipe";

export type FormState = {
  title: string;
  description: string;
  /** One ingredient per line */
  ingredientsText: string;
  /** One step per line */
  instructionsText: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: string[];
};

export function emptyFormState(): FormState {
  return {
    title: "",
    description: "",
    ingredientsText: "",
    instructionsText: "",
    prepTime: 0,
    cookTime: 0,
    servings: 0,
    tags: [],
  };
}

export function toFormState(data: NewRecipe): FormState {
  const ing = data.ingredients?.filter(Boolean) ?? [];
  const steps = data.instructions?.filter(Boolean) ?? [];
  return {
    title: data.title ?? "",
    description: data.description ?? "",
    ingredientsText: ing.length > 0 ? ing.join("\n") : "",
    instructionsText: steps.length > 0 ? steps.join("\n") : "",
    prepTime: data.prepTime ?? 0,
    cookTime: data.cookTime ?? 0,
    servings: data.servings ?? 0,
    tags: data.tags ?? [],
  };
}

export function linesFromText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Show empty field when value is 0 (avoid confusing “0” in the UI). */
export function formatOptionalNumber(n: number): string {
  return n === 0 ? "" : String(n);
}

/**
 * Parses optional minute/serving fields. Strips non-digits so pasted text like
 * "15 min" doesn’t become NaN, and empty/whitespace stays 0 (saved as 0 in DB).
 */
export function parseOptionalNumber(
  value: string | number | null | undefined,
): number {
  if (value === "" || value === null || value === undefined) return 0;
  if (typeof value === "number") {
    if (Number.isNaN(value)) return 0;
    return Math.max(0, Math.floor(value));
  }
  const s = String(value).replace(/\D/g, "");
  if (s === "") return 0;
  const n = parseInt(s, 10);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

export function toNewRecipe(form: FormState): NewRecipe {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    ingredients: linesFromText(form.ingredientsText),
    instructions: linesFromText(form.instructionsText),
    prepTime: form.prepTime ?? 0,
    cookTime: form.cookTime ?? 0,
    servings: form.servings ?? 0,
    tags: form.tags,
  };
}

export const MAX_TAGS = 5;
export const MAX_TAG_LENGTH = 20;

export type RecipeFormHandle = {
  submit: () => void | Promise<void>;
};

export interface RecipeFormProps {
  initialData?: NewRecipe | null;
  formResetKey?: number;
  onSubmit: (data: NewRecipe) => void | Promise<void>;
}
