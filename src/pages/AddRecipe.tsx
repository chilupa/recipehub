import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
import { useRecipes } from "../contexts/RecipeContext";
import { useHistory } from "react-router-dom";
import RecipeForm from "../components/RecipeForm";
import type { NewRecipe } from "../types/Recipe";

const AddRecipe: React.FC = () => {
  const { addRecipe } = useRecipes();
  const history = useHistory();

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
      <IonContent fullscreen>
        <RecipeForm
          onSubmit={handleSubmit}
          submitLabel="Save Recipe"
        />
      </IonContent>
    </IonPage>
  );
};

export default AddRecipe;
