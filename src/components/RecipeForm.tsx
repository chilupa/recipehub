import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
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
  IonText,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { remove } from "ionicons/icons";
import type { NewRecipe } from "../types/Recipe";
import "./RecipeForm.css";

type FormState = {
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

function emptyFormState(): FormState {
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

function toFormState(data: NewRecipe): FormState {
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

function linesFromText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Show empty field when value is 0 (avoid confusing “0” in the UI). */
function formatOptionalNumber(n: number): string {
  return n === 0 ? "" : String(n);
}

/**
 * Parses optional minute/serving fields. Strips non-digits so pasted text like
 * "15 min" doesn’t become NaN, and empty/whitespace stays 0 (saved as 0 in DB).
 */
function parseOptionalNumber(value: string | number | null | undefined): number {
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

function toNewRecipe(form: FormState): NewRecipe {
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

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 20;

export type RecipeFormHandle = {
  submit: () => void | Promise<void>;
};

export interface RecipeFormProps {
  initialData?: NewRecipe | null;
  formResetKey?: number;
  onSubmit: (data: NewRecipe) => void | Promise<void>;
}

const RecipeForm = forwardRef<RecipeFormHandle, RecipeFormProps>(
  ({ initialData, formResetKey = 0, onSubmit }, ref) => {
    const [formData, setFormData] = useState<FormState>(() =>
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
        <IonList className="recipe-form-list">
          <IonItem>
            <IonLabel position="stacked">Recipe Title *</IonLabel>
            <IonInput
              value={formData.title}
              onIonInput={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.detail.value ?? "",
                }))
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
              autoGrow
            />
          </IonItem>

          <div className="recipe-form-section">
            <h3 className="recipe-form-section-title">Ingredients</h3>
            <IonText color="medium">
              <p className="recipe-form-hint ion-padding-horizontal">
                One ingredient per line (wrapping is ok).
              </p>
            </IonText>
            <IonItem lines="none">
              <IonTextarea
                value={formData.ingredientsText}
                onIonInput={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ingredientsText: e.detail.value ?? "",
                  }))
                }
                placeholder={"2 cups flour\n1 tsp salt\n3 eggs"}
                rows={4}
                autoGrow
              />
            </IonItem>
          </div>

          <div className="recipe-form-section">
            <h3 className="recipe-form-section-title">Instructions</h3>
            <IonText color="medium">
              <p className="recipe-form-hint ion-padding-horizontal">
                One step per line (wrapping is ok).
              </p>
            </IonText>
            <IonItem lines="none">
              <IonTextarea
                value={formData.instructionsText}
                onIonInput={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instructionsText: e.detail.value ?? "",
                  }))
                }
                placeholder={
                  "Preheat oven to 350°F\nMix dry ingredients\nBake 25 min"
                }
                rows={6}
                autoGrow
              />
            </IonItem>
          </div>

          <div className="recipe-form-section">
            <h3 className="recipe-form-section-title">Time & servings</h3>
            <IonText color="medium">
              <p className="recipe-form-hint ion-padding-horizontal">
                All optional—leave blank if you don’t know yet.
              </p>
            </IonText>
            <IonGrid className="recipe-form-meta-grid ion-no-padding">
              <IonRow className="recipe-form-meta-row">
                <IonCol size="4">
                  <IonItem lines="none" className="recipe-form-meta-item">
                    <IonLabel position="stacked">Prep (min)</IonLabel>
                    <IonInput
                      type="text"
                      inputMode="numeric"
                      autocomplete="off"
                      autocorrect="off"
                      spellcheck={false}
                      enterKeyHint="done"
                      name="recipehub-prep-minutes"
                      value={formatOptionalNumber(formData.prepTime)}
                      onIonInput={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          prepTime: parseOptionalNumber(e.detail.value),
                        }))
                      }
                    />
                  </IonItem>
                </IonCol>
                <IonCol size="4">
                  <IonItem lines="none" className="recipe-form-meta-item">
                    <IonLabel position="stacked">Cook (min)</IonLabel>
                    <IonInput
                      type="text"
                      inputMode="numeric"
                      autocomplete="off"
                      autocorrect="off"
                      spellcheck={false}
                      enterKeyHint="done"
                      name="recipehub-cook-minutes"
                      value={formatOptionalNumber(formData.cookTime)}
                      onIonInput={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          cookTime: parseOptionalNumber(e.detail.value),
                        }))
                      }
                    />
                  </IonItem>
                </IonCol>
                <IonCol size="4">
                  <IonItem lines="none" className="recipe-form-meta-item">
                    <IonLabel position="stacked">Servings</IonLabel>
                    <IonInput
                      type="text"
                      inputMode="numeric"
                      autocomplete="off"
                      autocorrect="off"
                      spellcheck={false}
                      enterKeyHint="done"
                      name="recipehub-servings"
                      value={formatOptionalNumber(formData.servings)}
                      onIonInput={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servings: parseOptionalNumber(e.detail.value),
                        }))
                      }
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>

          <div className="recipe-form-section recipe-form-section--tags">
            <h3 className="recipe-form-section-title">
              Tags ({formData.tags.length}/{MAX_TAGS})
            </h3>
            <IonItem>
              <IonInput
                value={newTag}
                onIonInput={(e) => handleTagInput(e.detail.value ?? "")}
                placeholder="Add a tag"
                disabled={formData.tags.length >= MAX_TAGS}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  addTag();
                }}
              />
              <IonButton
                slot="end"
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
            <div className="ion-padding-horizontal recipe-form-tags">
              {formData.tags.map((tag) => (
                <IonChip key={tag} color="primary">
                  <IonLabel>{tag}</IonLabel>
                  <IonIcon icon={remove} onClick={() => removeTag(tag)} />
                </IonChip>
              ))}
            </div>
          </div>

          <div className="recipe-form-scroll-pad" aria-hidden="true" />
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
  },
);

RecipeForm.displayName = "RecipeForm";

export default RecipeForm;
