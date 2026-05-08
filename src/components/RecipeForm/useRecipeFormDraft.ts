import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { FormState } from "./recipeFormModel";
import {
  clearRecipeDraft,
  loadRecipeDraft,
  saveRecipeDraft,
} from "../../lib/recipeDraftStorage";

const DRAFT_SAVE_DEBOUNCE_MS = 700;

type Params = {
  draftKey?: string;
  baseFormData: FormState;
  formData: FormState;
  newTag: string;
  formResetKey: number;
  hasInitialData: boolean;
  setFormData: Dispatch<SetStateAction<FormState>>;
  setNewTag: Dispatch<SetStateAction<string>>;
  onDraftRestored: () => void;
};

function hasMeaningfulDraftContent(
  formData: Omit<FormState, "coverFile">,
  newTag: string,
): boolean {
  if (formData.title.trim()) return true;
  if (formData.description.trim()) return true;
  if (formData.ingredientsText.trim()) return true;
  if (formData.instructionsText.trim()) return true;
  if (formData.prepTime > 0) return true;
  if (formData.cookTime > 0) return true;
  if (formData.servings > 0) return true;
  if (formData.tags.length > 0) return true;
  if (formData.removeCover) return true;
  if (newTag.trim()) return true;
  return false;
}

function withoutCoverFile(formData: FormState): Omit<FormState, "coverFile"> {
  const { coverFile: _coverFile, ...rest } = formData;
  return rest;
}

export function useRecipeFormDraft({
  draftKey,
  baseFormData,
  formData,
  newTag,
  formResetKey,
  hasInitialData,
  setFormData,
  setNewTag,
  onDraftRestored,
}: Params) {
  useEffect(() => {
    if (!draftKey) {
      setFormData(baseFormData);
      return;
    }
    const draft = loadRecipeDraft(draftKey);
    if (draft) {
      if (!hasMeaningfulDraftContent(draft.formData, draft.newTag ?? "")) {
        clearRecipeDraft(draftKey);
        setFormData(baseFormData);
        setNewTag("");
        return;
      }
      setFormData({
        ...baseFormData,
        ...draft.formData,
        coverFile: null,
      });
      setNewTag(draft.newTag ?? "");
      onDraftRestored();
      return;
    }
    setFormData(baseFormData);
    setNewTag("");
  }, [baseFormData, draftKey, onDraftRestored, setFormData, setNewTag]);

  useEffect(() => {
    if (hasInitialData) return;
    if (formResetKey === 0) return;
    setFormData(baseFormData);
    setNewTag("");
    if (draftKey) clearRecipeDraft(draftKey);
  }, [baseFormData, draftKey, formResetKey, hasInitialData, setFormData, setNewTag]);

  useEffect(() => {
    if (!draftKey) return;
    const timeout = window.setTimeout(() => {
      const formWithoutCover = withoutCoverFile(formData);
      if (!hasMeaningfulDraftContent(formWithoutCover, newTag)) {
        clearRecipeDraft(draftKey);
        return;
      }
      saveRecipeDraft(draftKey, {
        formData: formWithoutCover,
        newTag,
      });
    }, DRAFT_SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [draftKey, formData, newTag]);
}

export function clearRecipeFormDraft(draftKey?: string) {
  if (!draftKey) return;
  clearRecipeDraft(draftKey);
}
