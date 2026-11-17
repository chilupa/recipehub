import { useEffect, useRef } from "react";
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

function draftSnapshot(
  formData: Omit<FormState, "coverFile">,
  newTag: string,
): string {
  return JSON.stringify({
    title: formData.title,
    description: formData.description,
    ingredientsText: formData.ingredientsText,
    instructionsText: formData.instructionsText,
    prepTime: formData.prepTime,
    cookTime: formData.cookTime,
    servings: formData.servings,
    tags: formData.tags,
    removeCover: formData.removeCover,
    existingImageUrl: formData.existingImageUrl,
    newTag,
  });
}

function isSameAsBase(
  formData: Omit<FormState, "coverFile">,
  newTag: string,
  baseFormData: FormState,
): boolean {
  return (
    draftSnapshot(formData, newTag) ===
    draftSnapshot(withoutCoverFile(baseFormData), "")
  );
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
  const hydratedKeyRef = useRef<string | null>(null);
  const onDraftRestoredRef = useRef(onDraftRestored);
  onDraftRestoredRef.current = onDraftRestored;

  useEffect(() => {
    if (!draftKey) {
      setFormData(baseFormData);
      hydratedKeyRef.current = null;
      return;
    }

    // Only hydrate once per draft key so remounts/HMR don’t re-toast.
    if (hydratedKeyRef.current === draftKey) return;
    hydratedKeyRef.current = draftKey;

    const draft = loadRecipeDraft(draftKey);
    if (draft) {
      if (!hasMeaningfulDraftContent(draft.formData, draft.newTag ?? "")) {
        clearRecipeDraft(draftKey);
        setFormData(baseFormData);
        setNewTag("");
        return;
      }

      // Stale edit autosave that matches the loaded recipe is not a real draft.
      if (isSameAsBase(draft.formData, draft.newTag ?? "", baseFormData)) {
        clearRecipeDraft(draftKey);
        setFormData(baseFormData);
        setNewTag("");
        return;
      }

      setFormData({
        ...baseFormData,
        ...draft.formData,
        coverFile: null,
        existingImageUrl:
          draft.formData.existingImageUrl ?? baseFormData.existingImageUrl,
      });
      setNewTag(draft.newTag ?? "");
      onDraftRestoredRef.current();
      return;
    }

    setFormData(baseFormData);
    setNewTag("");
  }, [baseFormData, draftKey, setFormData, setNewTag]);

  useEffect(() => {
    if (hasInitialData) return;
    if (formResetKey === 0) return;
    setFormData(baseFormData);
    setNewTag("");
    if (draftKey) clearRecipeDraft(draftKey);
  }, [baseFormData, draftKey, formResetKey, hasInitialData, setFormData, setNewTag]);

  useEffect(() => {
    if (!draftKey) return;
    // Wait until this key has been hydrated so we don’t overwrite a real draft
    // with the pristine base form on first paint.
    if (hydratedKeyRef.current !== draftKey) return;

    const timeout = window.setTimeout(() => {
      const formWithoutCover = withoutCoverFile(formData);
      // Don’t keep a draft that is identical to the starting recipe/empty form.
      if (
        !hasMeaningfulDraftContent(formWithoutCover, newTag) ||
        isSameAsBase(formWithoutCover, newTag, baseFormData)
      ) {
        clearRecipeDraft(draftKey);
        return;
      }
      saveRecipeDraft(draftKey, {
        formData: formWithoutCover,
        newTag,
      });
    }, DRAFT_SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [baseFormData, draftKey, formData, newTag]);
}

export function clearRecipeFormDraft(draftKey?: string) {
  if (!draftKey) return;
  clearRecipeDraft(draftKey);
}
