import React, { useState, useRef } from "react";
import {
  IonContent,
  IonFooter,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  useIonViewWillEnter,
  useIonViewDidEnter,
} from "@ionic/react";
import { useRecipes } from "../contexts/RecipeContext";
import { useHistory } from "react-router-dom";
import RecipeForm, { type RecipeFormHandle } from "../components/RecipeForm";
import type { NewRecipe } from "../types/Recipe";

const AddRecipe: React.FC = () => {
  const { addRecipe } = useRecipes();
  const history = useHistory();
  const [formResetKey, setFormResetKey] = useState(0);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const formRef = useRef<RecipeFormHandle>(null);

  useIonViewWillEnter(() => {
    setFormResetKey((k) => k + 1);
  });

  useIonViewDidEnter(() => {
    void contentRef.current?.scrollToTop(0);
  });

  const handleSubmit = async (data: NewRecipe) => {
    await addRecipe(data);
    history.push("/recipes");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/recipes" text="Back" />
          </IonButtons>
          <IonTitle>Add Recipe</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef}>
        <RecipeForm
          ref={formRef}
          formResetKey={formResetKey}
          onSubmit={handleSubmit}
        />
      </IonContent>
      <IonFooter>
        <IonToolbar className="recipe-form-footer-toolbar">
          <IonButton
            expand="block"
            strong
            className="ion-margin"
            onClick={() => void formRef.current?.submit()}
          >
            Save recipe
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default AddRecipe;
