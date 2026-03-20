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
import { useHistory, useParams } from "react-router-dom";
import RecipeForm from "../components/RecipeForm";
import type { NewRecipe } from "../types/Recipe";

const EditRecipe: React.FC = () => {
  const { recipes, updateRecipe } = useRecipes();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  const recipe = recipes.find((r) => r.id === id);

  const handleSubmit = async (data: NewRecipe) => {
    if (!id) return;
    await updateRecipe(id, data);
    history.push("/recipes");
  };

  const initialData: NewRecipe | undefined = recipe
    ? {
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        tags: recipe.tags ?? [],
      }
    : undefined;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/recipes" />
          </IonButtons>
          <IonTitle>Edit Recipe</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {recipe ? (
          <RecipeForm
            initialData={initialData}
            onSubmit={handleSubmit}
            submitLabel="Update Recipe"
          />
        ) : (
          <p style={{ padding: "16px", color: "var(--ion-color-medium)" }}>
            Recipe not found.
          </p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default EditRecipe;
