import {
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { useToast } from "../../contexts/ToastContext";
import RecipeFormListContent from "./RecipeFormListContent";
import {
  emptyFormState,
  toFormState,
  toSubmitPayload,
  RECIPE_FORM_ID,
  type FormState,
  type RecipeFormHandle,
  type RecipeFormProps,
} from "./recipeFormModel";
import { formatTagLabel } from "../../utils/formatTag";
import {
  firstFieldErrorKey,
  getTagInputError,
  validateRecipeForm,
  type RecipeFormFieldErrors,
} from "./recipeFormValidation";
import "./RecipeForm.css";
import { useCoverDisplayUrl } from "./useCoverDisplayUrl";
import {
  clearRecipeFormDraft,
  useRecipeFormDraft,
} from "./useRecipeFormDraft";
import { useRecipeFormTags } from "./useRecipeFormTags";

function scrollToFieldError(field: keyof RecipeFormFieldErrors) {
  const nameByField: Record<keyof RecipeFormFieldErrors, string> = {
    title: "recipe-title",
    description: "recipe-description",
    ingredientsText: "recipe-ingredients",
    instructionsText: "recipe-instructions",
    prepTime: "recipehub-prep-minutes",
    cookTime: "recipehub-cook-minutes",
    servings: "recipehub-servings",
    tag: "recipe-tag",
  };
  const name = nameByField[field];
  const el =
    document.getElementById(`app-input-${name}`) ??
    document.getElementById(`app-textarea-${name}`) ??
    document.querySelector(`[name="${name}"]`);
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
}

const RecipeForm = forwardRef<RecipeFormHandle, RecipeFormProps>(
  (
    {
      initialData,
      formResetKey = 0,
      draftKey,
      submitRequestKey = 0,
      onSubmit,
    },
    ref,
  ) => {
    const { showToast, showErrorToast } = useToast();
    const [formData, setFormData] = useState(() =>
      initialData ? toFormState(initialData) : emptyFormState(),
    );
    const [errors, setErrors] = useState<RecipeFormFieldErrors>({});
    const submitLockRef = useRef(false);
    const { coverDisplayUrl, onPickCover, onRemoveCover } =
      useCoverDisplayUrl(formData, setFormData);
    const { newTag, setNewTag, addTag, removeTag, handleTagInput } =
      useRecipeFormTags({ formData, setFormData, setErrors });

    const baseFormData = useMemo(
      () => (initialData ? toFormState(initialData) : emptyFormState()),
      [initialData],
    );
    const handleDraftRestored = useCallback(() => {
      showToast("Restored your unsaved draft.");
    }, [showToast]);
    useRecipeFormDraft({
      draftKey,
      baseFormData,
      formData,
      newTag,
      formResetKey,
      hasInitialData: Boolean(initialData),
      setFormData,
      setNewTag,
      onDraftRestored: handleDraftRestored,
    });

    const clearFieldError = useCallback((field: keyof RecipeFormFieldErrors) => {
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }, []);

    const commitPendingTag = useCallback(
      (data: FormState): FormState => {
        const trimmed = formatTagLabel(newTag);
        if (!trimmed) return data;
        if (getTagInputError(trimmed, data.tags)) {
          setNewTag("");
          return data;
        }
        setNewTag("");
        return { ...data, tags: [...data.tags, trimmed] };
      },
      [newTag, setNewTag],
    );

    const handleSubmit = useCallback(async () => {
      if (submitLockRef.current) return;
      submitLockRef.current = true;

      try {
        const dataToSave = commitPendingTag(formData);
        if (dataToSave !== formData) {
          setFormData(dataToSave);
        }

        const nextErrors = validateRecipeForm(dataToSave);
        setErrors(nextErrors);
        const firstError = firstFieldErrorKey(nextErrors);
        if (firstError) {
          showToast("Fix the highlighted fields, then try again.");
          scrollToFieldError(firstError);
          return;
        }
        try {
          await onSubmit(toSubmitPayload(dataToSave));
          clearRecipeFormDraft(draftKey);
        } catch {
          showErrorToast("Could not save recipe. Please try again.");
        }
      } finally {
        submitLockRef.current = false;
      }
    }, [
      commitPendingTag,
      draftKey,
      formData,
      onSubmit,
      showToast,
      showErrorToast,
    ]);

    const resetForm = useCallback(() => {
      setFormData(baseFormData);
      setNewTag("");
      setErrors({});
      clearRecipeFormDraft(draftKey);
    }, [baseFormData, draftKey, setNewTag]);

    useImperativeHandle(
      ref,
      () => ({
        submit: () => void handleSubmit(),
        reset: resetForm,
      }),
      [handleSubmit, resetForm],
    );

    const handleSubmitRef = useRef(handleSubmit);
    handleSubmitRef.current = handleSubmit;
    useEffect(() => {
      if (submitRequestKey < 1) return;
      void handleSubmitRef.current();
    }, [submitRequestKey]);

    return (
      <form
        id={RECIPE_FORM_ID}
        className="recipe-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <RecipeFormListContent
          formData={formData}
          errors={errors}
          setFormData={setFormData}
          clearFieldError={clearFieldError}
          newTag={newTag}
          onTagInput={handleTagInput}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          coverDisplayUrl={coverDisplayUrl}
          onPickCover={onPickCover}
          onRemoveCover={onRemoveCover}
        />
      </form>
    );
  },
);

RecipeForm.displayName = "RecipeForm";

export default RecipeForm;
