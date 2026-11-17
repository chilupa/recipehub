import React from "react";

import { AppInput, TextHeading } from "../../../design-system";
import {
  type FormState,
  formatOptionalNumber,
  parseOptionalNumber,
} from "../recipeFormModel";
import type { RecipeFormFieldErrors } from "../recipeFormValidation";
import { MAX_MINUTES, MAX_SERVINGS } from "../recipeFormValidation";

import "../RecipeForm.css";

type Props = {
  formData: FormState;
  errors: RecipeFormFieldErrors;
  clearFieldError: (field: keyof RecipeFormFieldErrors) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
};

const RecipeFormMetaRow: React.FC<Props> = ({
  formData,
  errors,
  clearFieldError,
  setFormData,
}) => (
  <section className="recipe-form-section">
    <TextHeading level={2} className="section-label">
      Time & servings
    </TextHeading>
    <p className="section-subtitle recipe-form-hint">
      All optional. Leave blank if you don’t know yet.
    </p>
    <div className="recipe-form-meta-row">
      <AppInput
        className="recipe-form-meta-field"
        label="Prep (min)"
        type="text"
        inputMode="numeric"
        autocomplete="off"
        autocorrect="off"
        spellcheck={false}
        enterkeyhint="done"
        name="recipehub-prep-minutes"
        value={formatOptionalNumber(formData.prepTime)}
        maxlength={String(MAX_MINUTES).length}
        errorText={errors.prepTime}
        onIonInput={(e) => {
          clearFieldError("prepTime");
          setFormData((prev) => ({
            ...prev,
            prepTime: parseOptionalNumber(e.detail.value),
          }));
        }}
      />
      <AppInput
        className="recipe-form-meta-field"
        label="Cook (min)"
        type="text"
        inputMode="numeric"
        autocomplete="off"
        autocorrect="off"
        spellcheck={false}
        enterkeyhint="done"
        name="recipehub-cook-minutes"
        value={formatOptionalNumber(formData.cookTime)}
        maxlength={String(MAX_MINUTES).length}
        errorText={errors.cookTime}
        onIonInput={(e) => {
          clearFieldError("cookTime");
          setFormData((prev) => ({
            ...prev,
            cookTime: parseOptionalNumber(e.detail.value),
          }));
        }}
      />
      <AppInput
        className="recipe-form-meta-field"
        label="Servings"
        type="text"
        inputMode="numeric"
        autocomplete="off"
        autocorrect="off"
        spellcheck={false}
        enterkeyhint="done"
        name="recipehub-servings"
        value={formatOptionalNumber(formData.servings)}
        maxlength={String(MAX_SERVINGS).length}
        errorText={errors.servings}
        onIonInput={(e) => {
          clearFieldError("servings");
          setFormData((prev) => ({
            ...prev,
            servings: parseOptionalNumber(e.detail.value),
          }));
        }}
      />
    </div>
  </section>
);

export default RecipeFormMetaRow;
