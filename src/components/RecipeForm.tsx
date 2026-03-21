import React, { useState, useEffect } from "react";
import {
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonList,
  IonIcon,
  IonChip,
  IonToast,
} from "@ionic/react";
import { add, remove } from "ionicons/icons";
import type { NewRecipe } from "../types/Recipe";

function emptyFormState(): FormState {
  return {
    title: "",
    description: "",
    ingredients: [""],
    instructions: [""],
    prepTime: 0,
    cookTime: 0,
    servings: 0,
    tags: [],
  };
}

type FormState = Omit<NewRecipe, "image"> & {
  ingredients: string[];
  instructions: string[];
};

function toFormState(data: NewRecipe): FormState {
  return {
    title: data.title ?? "",
    description: data.description ?? "",
    ingredients:
      data.ingredients?.length > 0 ? [...data.ingredients] : [""],
    instructions:
      data.instructions?.length > 0 ? [...data.instructions] : [""],
    prepTime: data.prepTime ?? 0,
    cookTime: data.cookTime ?? 0,
    servings: data.servings ?? 0,
    tags: data.tags ?? [],
  };
}

function toNewRecipe(form: FormState): NewRecipe {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    ingredients: form.ingredients.map((i) => i.trim()).filter(Boolean),
    instructions: form.instructions.map((i) => i.trim()).filter(Boolean),
    prepTime: form.prepTime ?? 0,
    cookTime: form.cookTime ?? 0,
    servings: form.servings ?? 0,
    tags: form.tags,
  };
}

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 20; // keeps tags readable on chips

export interface RecipeFormProps {
  /** Initial values (e.g. when editing). Omit for add mode. */
  initialData?: NewRecipe | null;
  /** Increment when re-opening Add Recipe so the form clears (Ionic caches pages). */
  formResetKey?: number;
  /** Called with cleaned form data on submit. */
  onSubmit: (data: NewRecipe) => void | Promise<void>;
  /** Label for the submit button. */
  submitLabel: string;
}

const RecipeForm: React.FC<RecipeFormProps> = ({
  initialData,
  formResetKey = 0,
  onSubmit,
  submitLabel,
}) => {
  const [formData, setFormData] = useState<FormState>(() =>
    initialData ? toFormState(initialData) : emptyFormState()
  );
  const [newTag, setNewTag] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [saving, setSaving] = useState(false);

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

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setToast({ show: true, message: "Please enter a title." });
      return;
    }
    setSaving(true);
    try {
      await onSubmit(toNewRecipe(formData));
    } catch {
      setToast({
        show: true,
        message: "Could not save recipe. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients:
        prev.ingredients.length === 1
          ? [""]
          : prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setFormData((prev) => {
      const next = [...prev.ingredients];
      next[index] = value;
      return { ...prev, ingredients: next };
    });
  };

  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      instructions:
        prev.instructions.length === 1
          ? [""]
          : prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData((prev) => {
      const next = [...prev.instructions];
      next[index] = value;
      return { ...prev, instructions: next };
    });
  };

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
      <IonList>
        <IonItem>
          <IonLabel position="stacked">Recipe Title *</IonLabel>
          <IonInput
            value={formData.title}
            onIonInput={(e) =>
              setFormData((prev) => ({ ...prev, title: e.detail.value ?? "" }))
            }
            placeholder="Enter recipe title"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Description</IonLabel>
          <IonTextarea
            value={formData.description}
            onIonInput={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.detail.value ?? "",
              }))
            }
            placeholder="Brief description of your recipe"
            rows={3}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Prep Time (minutes)</IonLabel>
          <IonInput
            type="number"
            value={formData.prepTime}
            onIonInput={(e) =>
              setFormData((prev) => ({
                ...prev,
                prepTime: parseInt(e.detail.value ?? "0", 10) || 0,
              }))
            }
            placeholder="15"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Cook Time (minutes)</IonLabel>
          <IonInput
            type="number"
            value={formData.cookTime}
            onIonInput={(e) =>
              setFormData((prev) => ({
                ...prev,
                cookTime: parseInt(e.detail.value ?? "0", 10) || 0,
              }))
            }
            placeholder="30"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Servings</IonLabel>
          <IonInput
            type="number"
            value={formData.servings}
            onIonInput={(e) =>
              setFormData((prev) => ({
                ...prev,
                servings: parseInt(e.detail.value ?? "0", 10) || 0,
              }))
            }
            placeholder="0"
            min={0}
          />
        </IonItem>

        <h3 style={{ marginLeft: "12px" }}>Ingredients</h3>
        <div style={{ margin: "20px 0" }}>
          {formData.ingredients.map((ingredient, index) => (
            <IonItem key={index}>
              <IonInput
                value={ingredient}
                onIonInput={(e) =>
                  updateIngredient(index, e.detail.value ?? "")
                }
                placeholder={`Ingredient ${index + 1}`}
              />
              <IonButton
                fill="clear"
                color="danger"
                onClick={() => removeIngredient(index)}
                disabled={formData.ingredients.length === 1}
              >
                <IonIcon icon={remove} />
              </IonButton>
            </IonItem>
          ))}
          <IonButton fill="clear" size="small" onClick={addIngredient}>
            <IonIcon icon={add} slot="start" />
            Add Ingredient
          </IonButton>
        </div>

        <h3 style={{ marginLeft: "12px" }}>Instructions</h3>
        <div style={{ margin: "20px 0" }}>
          {formData.instructions.map((instruction, index) => (
            <IonItem key={index}>
              <IonTextarea
                value={instruction}
                onIonInput={(e) =>
                  updateInstruction(index, e.detail.value ?? "")
                }
                placeholder={`Step ${index + 1}`}
                rows={2}
              />
              <IonButton
                fill="clear"
                color="danger"
                onClick={() => removeInstruction(index)}
                disabled={formData.instructions.length === 1}
              >
                <IonIcon icon={remove} />
              </IonButton>
            </IonItem>
          ))}
          <IonButton fill="clear" size="small" onClick={addInstruction}>
            <IonIcon icon={add} slot="start" />
            Add Step
          </IonButton>
        </div>

        <h3 style={{ marginLeft: "12px" }}>
          Tags ({formData.tags.length}/{MAX_TAGS})
        </h3>
        <div style={{ margin: "20px 0" }}>
          <IonItem>
            <IonInput
              value={newTag}
              onIonInput={(e) => handleTagInput(e.detail.value ?? "")}
              placeholder={`Add a tag`}
              disabled={formData.tags.length >= MAX_TAGS}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                addTag();
              }}
            />
            <IonButton
              onClick={addTag}
              disabled={
                !newTag.trim() ||
                formData.tags.length >= MAX_TAGS ||
                newTag.trim().length > MAX_TAG_LENGTH
              }
            >
              Add
            </IonButton>
          </IonItem>
          <div style={{ margin: "10px 0" }}>
            {formData.tags.map((tag) => (
              <IonChip key={tag} color="primary">
                <IonLabel>{tag}</IonLabel>
                <IonIcon icon={remove} onClick={() => removeTag(tag)} />
              </IonChip>
            ))}
          </div>
        </div>

        <IonButton
          expand="block"
          onClick={handleSubmit}
          style={{ padding: "12px" }}
          disabled={!formData.title.trim() || saving}
        >
          {saving ? "Saving…" : submitLabel}
        </IonButton>
      </IonList>

      <IonToast
        isOpen={toast.show}
        onDidDismiss={() => setToast((t) => ({ ...t, show: false }))}
        message={toast.message}
        duration={2000}
        color="warning"
      />
    </>
  );
};

export default RecipeForm;
