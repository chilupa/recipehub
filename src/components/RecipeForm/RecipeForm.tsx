import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { IonToast } from "@ionic/react";
import RecipeFormListContent from "./RecipeFormListContent";
import {
  emptyFormState,
  toFormState,
  linesFromText,
  toNewRecipe,
  MAX_TAGS,
  MAX_TAG_LENGTH,
  type RecipeFormHandle,
  type RecipeFormProps,
} from "./recipeFormModel";
import "./RecipeForm.css";

const RecipeForm = forwardRef<RecipeFormHandle, RecipeFormProps>(
  ({ initialData, formResetKey = 0, onSubmit }, ref) => {
    const [formData, setFormData] = useState(() =>
      initialData ? toFormState(initialData) : emptyFormState(),
    );
    const [newTag, setNewTag] = useState("");
    const [toast, setToast] = useState({ show: false, message: "" });

    useEffect(() => {
      if (initialData) {
        setFormData(toFormState(initialData));
      }
    }, [initialData]);

    useEffect(() => {
      if (initialData) return;
      if (formResetKey === 0) return;
      setFormData(emptyFormState());
      setNewTag("");
    }, [formResetKey, initialData]);

    const handleSubmit = useCallback(async () => {
      if (!formData.title.trim()) {
        setToast({ show: true, message: "Please enter a title." });
        return;
      }
      const ing = linesFromText(formData.ingredientsText);
      const steps = linesFromText(formData.instructionsText);
      if (ing.length === 0) {
        setToast({
          show: true,
          message: "Add ingredients (one per line).",
        });
        return;
      }
      if (steps.length === 0) {
        setToast({
          show: true,
          message: "Add steps (one per line).",
        });
        return;
      }
      try {
        await onSubmit(toNewRecipe(formData));
      } catch {
        setToast({
          show: true,
          message: "Could not save recipe. Please try again.",
        });
      }
    }, [formData, onSubmit]);

    useImperativeHandle(ref, () => ({ submit: () => void handleSubmit() }), [
      handleSubmit,
    ]);

    const addTag = () => {
      const tag = newTag.trim();
      if (!tag) {
        setToast({ show: true, message: "Type a tag first." });
        return;
      }
      if (tag.length > MAX_TAG_LENGTH) {
        setToast({
          show: true,
          message: `Tag is too long (max ${MAX_TAG_LENGTH} characters).`,
        });
        return;
      }
      if (formData.tags.length >= MAX_TAGS) {
        setToast({ show: true, message: `Max ${MAX_TAGS} tags.` });
        return;
      }
      if (formData.tags.includes(tag)) {
        setToast({ show: true, message: "Tag already added." });
        return;
      }

      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setNewTag("");
    };

    const removeTag = (tag: string) => {
      setFormData((prev) => ({
        ...prev,
        tags: prev.tags.filter((t) => t !== tag),
      }));
    };

    const handleTagInput = (value: string) => {
      if (value && [",", " "].includes(value.slice(-1))) {
        const tag = value.slice(0, -1).trim();
        if (!tag) {
          setNewTag("");
          return;
        }

        if (tag.length > MAX_TAG_LENGTH) {
          setToast({
            show: true,
            message: `Tag is too long (max ${MAX_TAG_LENGTH} characters).`,
          });
          setNewTag("");
          return;
        }

        if (formData.tags.length >= MAX_TAGS) {
          setToast({ show: true, message: `Max ${MAX_TAGS} tags.` });
          setNewTag("");
          return;
        }

        if (formData.tags.includes(tag)) {
          setToast({ show: true, message: "Tag already added." });
          setNewTag("");
          return;
        }

        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
        setNewTag("");
        return;
      }
      setNewTag(value);
    };

    return (
      <>
        <RecipeFormListContent
          formData={formData}
          setFormData={setFormData}
          newTag={newTag}
          onTagInput={handleTagInput}
          onAddTag={addTag}
          onRemoveTag={removeTag}
        />

        <IonToast
          isOpen={toast.show}
          onDidDismiss={() => setToast((t) => ({ ...t, show: false }))}
          message={toast.message}
          duration={2000}
          color="warning"
        />
      </>
    );
  },
);

RecipeForm.displayName = "RecipeForm";

export default RecipeForm;
