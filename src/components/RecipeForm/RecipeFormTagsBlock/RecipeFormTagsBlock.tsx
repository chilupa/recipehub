import React from "react";
import { IonItem, IonLabel, IonInput, IonButton, IonIcon, IonChip } from "@ionic/react";
import { remove } from "ionicons/icons";
import type { FormState } from "../recipeFormModel";
import { MAX_TAGS, MAX_TAG_LENGTH } from "../recipeFormModel";
import "../RecipeForm.css";

type Props = {
  formData: FormState;
  newTag: string;
  onTagInput: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
};

const RecipeFormTagsBlock: React.FC<Props> = ({
  formData,
  newTag,
  onTagInput,
  onAddTag,
  onRemoveTag,
}) => (
  <div className="recipe-form-section recipe-form-section--tags">
    <h3 className="recipe-form-section-title">
      Tags ({formData.tags.length}/{MAX_TAGS})
    </h3>
    <IonItem>
      <IonInput
        value={newTag}
        onIonInput={(e) => onTagInput(e.detail.value ?? "")}
        placeholder="Add a tag"
        disabled={formData.tags.length >= MAX_TAGS}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          onAddTag();
        }}
      />
      <IonButton
        slot="end"
        onClick={onAddTag}
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
          <IonIcon icon={remove} onClick={() => onRemoveTag(tag)} />
        </IonChip>
      ))}
    </div>
  </div>
);

export default RecipeFormTagsBlock;
