import type { FormState } from "../components/RecipeForm/recipeFormModel";

const DRAFT_PREFIX = "recipehub-recipe-draft:";

export type RecipeDraftData = {
  formData: Omit<FormState, "coverFile">;
  newTag: string;
  updatedAt: number;
};

function draftStorageKey(draftKey: string): string {
  return `${DRAFT_PREFIX}${draftKey}`;
}

export function loadRecipeDraft(draftKey: string): RecipeDraftData | null {
  try {
    const raw = localStorage.getItem(draftStorageKey(draftKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RecipeDraftData;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.formData || typeof parsed.formData !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveRecipeDraft(
  draftKey: string,
  draft: Omit<RecipeDraftData, "updatedAt">,
): void {
  try {
    const payload: RecipeDraftData = {
      ...draft,
      updatedAt: Date.now(),
    };
    localStorage.setItem(draftStorageKey(draftKey), JSON.stringify(payload));
  } catch {
    /* quota/full storage */
  }
}

export function clearRecipeDraft(draftKey: string): void {
  try {
    localStorage.removeItem(draftStorageKey(draftKey));
  } catch {
    /* no-op */
  }
}
