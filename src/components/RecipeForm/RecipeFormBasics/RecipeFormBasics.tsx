import React from "react";

import { AppInput, AppTextarea } from "../../../design-system";
import { capitalizeFirstLetter } from "../../../utils/capitalizeFirstLetter";
import type { FormState } from "../recipeFormModel";
import type { RecipeFormFieldErrors } from "../recipeFormValidation";
import { DESCRIPTION_MAX, TITLE_MAX } from "../recipeFormValidation";

import "../RecipeForm.css";

type Props = {
  formData: FormState;
  errors: RecipeFormFieldErrors;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

const RecipeFormBasics: React.FC<Props> = ({
  formData,
  errors,
  onTitleChange,
  onDescriptionChange,
}) => (
  <div className="recipe-form-fields">
    <AppInput
      label="Recipe title"
      name="recipe-title"
      value={formData.title}
      placeholder="Enter recipe title"
      maxlength={TITLE_MAX}
      autocapitalize="sentences"
      errorText={errors.title}
      onIonInput={(e) =>
        onTitleChange(capitalizeFirstLetter(e.detail.value ?? ""))
      }
    />
    <AppTextarea
      label="Description"
      name="recipe-description"
      value={formData.description}
      placeholder="Brief description of your recipe"
      rows={3}
      autoGrow
      maxlength={DESCRIPTION_MAX}
      autocapitalize="sentences"
      errorText={errors.description}
      helperText={
        formData.description.length > DESCRIPTION_MAX - 40
          ? `${formData.description.length}/${DESCRIPTION_MAX}`
          : undefined
      }
      onIonInput={(e) =>
        onDescriptionChange(capitalizeFirstLetter(e.detail.value ?? ""))
      }
    />
  </div>
);

export default RecipeFormBasics;
