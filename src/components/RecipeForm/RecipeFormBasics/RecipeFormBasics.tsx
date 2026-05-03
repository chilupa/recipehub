import React from "react";
import { IonItem, IonLabel, IonInput, IonTextarea } from "@ionic/react";
import type { FormState } from "../recipeFormModel";
import "../RecipeForm.css";

type Props = {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
};

const RecipeFormBasics: React.FC<Props> = ({ formData, setFormData }) => (
  <>
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
  </>
);

export default RecipeFormBasics;
