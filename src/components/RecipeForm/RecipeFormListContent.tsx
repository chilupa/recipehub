import React from "react";
import {
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonList,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import {
  type FormState,
  formatOptionalNumber,
  parseOptionalNumber,
} from "./recipeFormModel";
import RecipeFormBasics from "./RecipeFormBasics";
import RecipeFormTagsBlock from "./RecipeFormTagsBlock";
import RecipeFormCover from "../RecipeFormCover";
import "./RecipeForm.css";

type Props = {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
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
  setFormData,
  newTag,
  onTagInput,
  onAddTag,
  onRemoveTag,
  coverDisplayUrl,
  onPickCover,
  onRemoveCover,
}) => (
  <IonList className="recipe-form-list">
    <RecipeFormCover
      displayUrl={coverDisplayUrl}
      onPick={onPickCover}
      onRemove={onRemoveCover}
    />

    <RecipeFormBasics formData={formData} setFormData={setFormData} />

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
          All optional. Leave blank if you don’t know yet.
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

    <RecipeFormTagsBlock
      formData={formData}
      newTag={newTag}
      onTagInput={onTagInput}
      onAddTag={onAddTag}
      onRemoveTag={onRemoveTag}
    />

    <div className="recipe-form-scroll-pad" aria-hidden="true" />
  </IonList>
);

export default RecipeFormListContent;
