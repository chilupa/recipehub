import { useCallback, useState } from "react";

import { formatTagLabel } from "../../utils/formatTag";
import type { FormState } from "./recipeFormModel";
import {
  getTagInputError,
  type RecipeFormFieldErrors,
} from "./recipeFormValidation";

type Args = {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  setErrors: React.Dispatch<React.SetStateAction<RecipeFormFieldErrors>>;
};

export function useRecipeFormTags({
  formData,
  setFormData,
  setErrors,
}: Args) {
  const [newTag, setNewTag] = useState("");

  const clearTagError = useCallback(() => {
    setErrors((prev) => {
      if (!prev.tag) return prev;
      const next = { ...prev };
      delete next.tag;
      return next;
    });
  }, [setErrors]);

  const addTag = useCallback(() => {
    const tag = formatTagLabel(newTag);
    const tagError = getTagInputError(tag, formData.tags);
    if (!tag) {
      setErrors((prev) => ({ ...prev, tag: "Type a tag first." }));
      return;
    }
    if (tagError) {
      setErrors((prev) => ({ ...prev, tag: tagError }));
      return;
    }

    setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    setNewTag("");
    clearTagError();
  }, [clearTagError, formData.tags, newTag, setErrors, setFormData]);

  const removeTag = useCallback(
    (tag: string) => {
      setFormData((prev) => ({
        ...prev,
        tags: prev.tags.filter((t) => t !== tag),
      }));
      clearTagError();
    },
    [clearTagError, setFormData],
  );

  const handleTagInput = useCallback(
    (value: string) => {
      if (value && [",", " "].includes(value.slice(-1))) {
        const tag = formatTagLabel(value.slice(0, -1));
        if (!tag) {
          setNewTag("");
          clearTagError();
          return;
        }

        const tagError = getTagInputError(tag, formData.tags);
        if (tagError) {
          setNewTag(tag);
          setErrors((prev) => ({ ...prev, tag: tagError }));
          return;
        }

        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
        setNewTag("");
        clearTagError();
        return;
      }

      setNewTag(value);
      const liveError = getTagInputError(value, formData.tags);
      setErrors((prev) => {
        if (!liveError) {
          if (!prev.tag) return prev;
          const next = { ...prev };
          delete next.tag;
          return next;
        }
        return { ...prev, tag: liveError };
      });
    },
    [clearTagError, formData.tags, setErrors, setFormData],
  );

  return {
    newTag,
    setNewTag,
    addTag,
    removeTag,
    handleTagInput,
  };
}
