import React from "react";

import { AppTextarea, TextHeading } from "../../design-system";
import { capitalizeLines } from "../../utils/capitalizeFirstLetter";
import RecipeFormCover from "../RecipeFormCover";
import RecipeFormBasics from "./RecipeFormBasics";
import RecipeFormMetaRow from "./RecipeFormMetaRow";
import RecipeFormTagsBlock from "./RecipeFormTagsBlock";
import type { FormState } from "./recipeFormModel";
import type { RecipeFormFieldErrors } from "./recipeFormValidation";

import "./RecipeForm.css";

type Props = {
  formData: FormState;
  errors: RecipeFormFieldErrors;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  clearFieldError: (field: keyof RecipeFormFieldErrors) => void;
  newTag: string;
  onTagInput: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  coverDisplayUrl: string | null;
  onPickCover: (file: File) => void;
  onRemoveCover: () => void;
};

const RecipeFormListContent: React.FC<Props> = ({
  formData,
  errors,
  setFormData,
  clearFieldError,
  newTag,
  onTagInput,
  onAddTag,
  onRemoveTag,
  coverDisplayUrl,
  onPickCover,
  onRemoveCover,
}) => (
  <div className="recipe-form-list">
    <RecipeFormCover
      displayUrl={coverDisplayUrl}
      onPick={onPickCover}
      onRemove={onRemoveCover}
    />

    <RecipeFormBasics
      formData={formData}
      errors={errors}
      onTitleChange={(title) => {
        clearFieldError("title");
        setFormData((prev) => ({ ...prev, title }));
      }}
      onDescriptionChange={(description) => {
        clearFieldError("description");
        setFormData((prev) => ({ ...prev, description }));
      }}
    />

    <section className="recipe-form-section">
      <TextHeading level={2} className="section-label">
        Ingredients
      </TextHeading>
      <p className="section-subtitle recipe-form-hint">
        One ingredient per line (wrapping is ok).
      </p>
      <AppTextarea
        label="Ingredients"
        hideLabel
        name="recipe-ingredients"
        value={formData.ingredientsText}
        placeholder={"2 cups flour\n1 tsp salt\n3 eggs"}
        rows={4}
        autoGrow
        errorText={errors.ingredientsText}
        autocapitalize="sentences"
        onIonInput={(e) => {
          clearFieldError("ingredientsText");
          setFormData((prev) => ({
            ...prev,
            ingredientsText: capitalizeLines(e.detail.value ?? ""),
          }));
        }}
      />
    </section>

    <section className="recipe-form-section">
      <TextHeading level={2} className="section-label">
        Instructions
      </TextHeading>
      <p className="section-subtitle recipe-form-hint">
        One step per line (wrapping is ok).
      </p>
      <AppTextarea
        label="Instructions"
        hideLabel
        name="recipe-instructions"
        value={formData.instructionsText}
        placeholder={
          "Preheat oven to 350°F\nMix dry ingredients\nBake 25 min"
        }
        rows={6}
        autoGrow
        errorText={errors.instructionsText}
        autocapitalize="sentences"
        onIonInput={(e) => {
          clearFieldError("instructionsText");
          setFormData((prev) => ({
            ...prev,
            instructionsText: capitalizeLines(e.detail.value ?? ""),
          }));
        }}
      />
    </section>

    <RecipeFormMetaRow
      formData={formData}
      errors={errors}
      clearFieldError={clearFieldError}
      setFormData={setFormData}
    />

    <RecipeFormTagsBlock
      formData={formData}
      newTag={newTag}
      tagError={errors.tag}
      onTagInput={onTagInput}
      onAddTag={onAddTag}
      onRemoveTag={onRemoveTag}
    />

    <div className="recipe-form-scroll-pad" aria-hidden="true" />
  </div>
);

export default RecipeFormListContent;
