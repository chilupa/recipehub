import React from "react";
import { IonChip, IonIcon, IonLabel } from "@ionic/react";
import { remove } from "ionicons/icons";

import { AppButton, AppInput, TextHeading } from "../../../design-system";
import { capitalizeFirstLetter } from "../../../utils/capitalizeFirstLetter";
import type { FormState } from "../recipeFormModel";
import { MAX_TAGS, MAX_TAG_LENGTH } from "../recipeFormModel";

import "../RecipeForm.css";

type Props = {
  formData: FormState;
  newTag: string;
  tagError?: string;
  onTagInput: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
};

const RecipeFormTagsBlock: React.FC<Props> = ({
  formData,
  newTag,
  tagError,
  onTagInput,
  onAddTag,
  onRemoveTag,
}) => {
  const atMaxTags = formData.tags.length >= MAX_TAGS;
  const canAdd =
    Boolean(newTag.trim()) &&
    !atMaxTags &&
    newTag.trim().length <= MAX_TAG_LENGTH &&
    !tagError;

  return (
    <div className="recipe-form-section recipe-form-section--tags">
      <TextHeading level={2} className="section-label">
        Tags ({formData.tags.length}/{MAX_TAGS})
      </TextHeading>
      <p className="section-subtitle recipe-form-hint">
        Optional. Up to {MAX_TAGS} tags, {MAX_TAG_LENGTH} characters each.
      </p>
      <div className="recipe-form-tag-row">
        <AppInput
          className="recipe-form-tag-input"
          label="Add a tag"
          hideLabel
          placeholder="Add a tag"
          name="recipe-tag"
          value={newTag}
          disabled={atMaxTags}
          maxlength={MAX_TAG_LENGTH + 5}
          autocapitalize="sentences"
          errorText={tagError}
          onIonInput={(e) =>
            onTagInput(capitalizeFirstLetter(e.detail.value ?? ""))
          }
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (canAdd) onAddTag();
          }}
        />
        <AppButton
          type="button"
          disabled={!canAdd}
          onClick={onAddTag}
          className="recipe-form-tag-add"
        >
          Add
        </AppButton>
      </div>
      <div className="recipe-form-tags">
        {formData.tags.map((tag) => (
          <IonChip key={tag} color="primary">
            <IonLabel>{tag}</IonLabel>
            <IonIcon icon={remove} onClick={() => onRemoveTag(tag)} />
          </IonChip>
        ))}
      </div>
    </div>
  );
};

export default RecipeFormTagsBlock;
