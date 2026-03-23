import React, { useEffect, useState, useRef } from "react";
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
  IonSpinner,
  IonText,
  useIonViewDidEnter,
} from "@ionic/react";
import { useRecipes } from "../contexts/RecipeContext";
import { useHistory, useParams } from "react-router-dom";
import RecipeForm, { type RecipeFormHandle } from "../components/RecipeForm";
import type { NewRecipe } from "../types/Recipe";

const EditRecipe: React.FC = () => {
  const { recipes, updateRecipe, ensureRecipeLoaded } = useRecipes();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [loadFailed, setLoadFailed] = useState(false);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const formRef = useRef<RecipeFormHandle>(null);

  const recipe = recipes.find((r) => r.id === id);

  useIonViewDidEnter(() => {
    void contentRef.current?.scrollToTop(0);
  });

  useEffect(() => {
    if (!id) return;
    setLoadFailed(false);
    if (recipes.some((r) => r.id === id)) return;
    let cancelled = false;
    void ensureRecipeLoaded(id).then((ok) => {
      if (!cancelled && !ok) setLoadFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [id, recipes, ensureRecipeLoaded]);

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
      <IonContent ref={contentRef}>
        {recipe ? (
          <RecipeForm
            ref={formRef}
            initialData={initialData}
            onSubmit={handleSubmit}
          />
        ) : !loadFailed ? (
          <div
            className="ion-padding"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 48,
            }}
          >
            <IonSpinner name="crescent" />
            <IonText color="medium">
              <p style={{ marginTop: 12 }}>Loading recipe…</p>
            </IonText>
          </div>
        ) : (
          <p style={{ padding: "16px", color: "var(--ion-color-medium)" }}>
            Recipe not found.
          </p>
        )}
      </IonContent>
      {recipe ? (
        <IonFooter>
          <IonToolbar className="recipe-form-footer-toolbar">
            <IonButton
              expand="block"
              strong
              className="ion-margin"
              onClick={() => void formRef.current?.submit()}
            >
              Update recipe
            </IonButton>
          </IonToolbar>
        </IonFooter>
      ) : null}
    </IonPage>
  );
};

export default EditRecipe;
