import React, { useEffect, useRef, useState } from "react";
import { IonContent, IonPage, useIonViewDidEnter } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";

import { AppButton, AppHeader, AppLoading } from "../../../design-system";
import { useAuth } from "../../../contexts/AuthContext";
import { useRecipes } from "../../../contexts/RecipeContext";
import RecipeForm, {
  type RecipeFormHandle,
  type RecipeSubmitPayload,
} from "../../../components/RecipeForm";
import type { NewRecipe } from "../../../types/Recipe";

import "./EditRecipe.css";

const EditRecipe: React.FC = () => {
  const { recipes, updateRecipe, ensureRecipeLoaded } = useRecipes();
  const { user, isGuest } = useAuth();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [loadFailed, setLoadFailed] = useState(false);
  const [submitRequestKey, setSubmitRequestKey] = useState(0);
  const [saving, setSaving] = useState(false);
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

  const handleSubmit = async (data: RecipeSubmitPayload) => {
    if (!id) return;
    setSaving(true);
    try {
      await updateRecipe(id, data);
      history.push("/recipes");
    } finally {
      setSaving(false);
    }
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
        image: recipe.image,
      }
    : undefined;
  const draftScope = user?.id ?? (isGuest ? "guest" : "__signed_out__");

  return (
    <IonPage>
      <AppHeader
        title="Edit recipe"
        showBack
        backHref="/recipes"
        endActions={
          recipe ? (
            <AppButton
              variant="text"
              color="light"
              loading={saving}
              disabled={saving}
              aria-label={saving ? "Saving recipe" : "Save recipe"}
              onClick={() => {
                if (saving) return;
                setSubmitRequestKey((key) => key + 1);
              }}
            >
              Save
            </AppButton>
          ) : null
        }
      />
      <IonContent ref={contentRef}>
        {recipe ? (
          <RecipeForm
            ref={formRef}
            initialData={initialData}
            draftKey={`edit:${draftScope}:${id}`}
            submitRequestKey={submitRequestKey}
            onSubmit={handleSubmit}
          />
        ) : !loadFailed ? (
          <div className="ion-padding edit-recipe-loading">
            <AppLoading message="Loading recipe…" />
          </div>
        ) : (
          <p className="edit-recipe-not-found text-body2">Recipe not found.</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default EditRecipe;
