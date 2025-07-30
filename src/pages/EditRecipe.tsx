import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonList,
  IonIcon,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
  IonToast,
  IonBackButton,
  IonButtons,
} from "@ionic/react";
import { add, remove, arrowBack } from "ionicons/icons";
import { useRecipes } from "../contexts/RecipeContext";
import { useHistory, useParams } from "react-router-dom";

const EditRecipe: React.FC = () => {
  const { recipes, updateRecipe } = useRecipes();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: [""],
    instructions: [""],
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    tags: [],
  });

  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      setFormData({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        tags: recipe.tags,
      });
    }
  }, [id, recipes]);

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      setShowToast(true);
      return;
    }

    const cleanedData = {
      ...formData,
      ingredients: formData.ingredients.filter((i) => i.trim()),
      instructions: formData.instructions.filter((i) => i.trim()),
    };

    updateRecipe(id, cleanedData);
    history.push("/recipes");
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ""],
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index: number, value: string) => {
    const updated = [...formData.ingredients];
    updated[index] = value;
    setFormData({ ...formData, ingredients: updated });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, ""],
    });
  };

  const removeInstruction = (index: number) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index),
    });
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...formData.instructions];
    updated[index] = value;
    setFormData({ ...formData, instructions: updated });
  };

  const addTag = () => {
    if (
      newTag.trim() &&
      !formData.tags.includes(newTag.trim()) &&
      formData.tags.length < 5
    ) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

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
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Recipe Title *</IonLabel>
            <IonInput
              value={formData.title}
              onIonInput={(e) =>
                setFormData({ ...formData, title: e.detail.value! })
              }
              placeholder="Enter recipe title"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Description *</IonLabel>
            <IonTextarea
              value={formData.description}
              onIonInput={(e) =>
                setFormData({ ...formData, description: e.detail.value! })
              }
              placeholder="Brief description of your recipe"
              rows={3}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Prep Time (minutes)</IonLabel>
            <IonInput
              type="number"
              value={formData.prepTime}
              onIonInput={(e) =>
                setFormData({
                  ...formData,
                  prepTime: parseInt(e.detail.value!) || 0,
                })
              }
              placeholder="15"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Cook Time (minutes)</IonLabel>
            <IonInput
              type="number"
              value={formData.cookTime}
              onIonInput={(e) =>
                setFormData({
                  ...formData,
                  cookTime: parseInt(e.detail.value!) || 0,
                })
              }
              placeholder="30"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Servings</IonLabel>
            <IonInput
              type="number"
              value={formData.servings}
              onIonInput={(e) =>
                setFormData({
                  ...formData,
                  servings: parseInt(e.detail.value!) || 1,
                })
              }
              placeholder="4"
            />
          </IonItem>

          <div style={{ margin: "20px 0" }}>
            <h3>Ingredients</h3>
            {formData.ingredients.map((ingredient, index) => (
              <IonItem key={index}>
                <IonInput
                  value={ingredient}
                  onIonInput={(e) => updateIngredient(index, e.detail.value!)}
                  placeholder={`Ingredient ${index + 1}`}
                />
                <IonButton
                  fill="clear"
                  color="danger"
                  onClick={() => removeIngredient(index)}
                  disabled={formData.ingredients.length === 1}
                >
                  <IonIcon icon={remove} />
                </IonButton>
              </IonItem>
            ))}
            <IonButton fill="clear" size="small" onClick={addIngredient}>
              <IonIcon icon={add} slot="start" />
              Add Ingredient
            </IonButton>
          </div>

          <div style={{ margin: "20px 0" }}>
            <h3>Instructions</h3>
            {formData.instructions.map((instruction, index) => (
              <IonItem key={index}>
                <IonTextarea
                  value={instruction}
                  onIonInput={(e) => updateInstruction(index, e.detail.value!)}
                  placeholder={`Step ${index + 1}`}
                  rows={2}
                />
                <IonButton
                  fill="clear"
                  color="danger"
                  onClick={() => removeInstruction(index)}
                  disabled={formData.instructions.length === 1}
                >
                  <IonIcon icon={remove} />
                </IonButton>
              </IonItem>
            ))}
            <IonButton fill="clear" size="small" onClick={addInstruction}>
              <IonIcon icon={add} slot="start" />
              Add Step
            </IonButton>
          </div>

          <div style={{ margin: "20px 0" }}>
            <h3>Tags ({formData.tags.length}/5)</h3>
            <IonItem>
              <IonInput
                value={newTag}
                onIonInput={(e) => setNewTag(e.detail.value!)}
                placeholder="Add a tag"
                disabled={formData.tags.length >= 5}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <IonButton onClick={addTag} disabled={formData.tags.length >= 5}>
                Add
              </IonButton>
            </IonItem>
            <div style={{ margin: "10px 0" }}>
              {formData.tags.map((tag) => (
                <IonChip key={tag} color="primary">
                  <IonLabel>{tag}</IonLabel>
                  <IonIcon icon={remove} onClick={() => removeTag(tag)} />
                </IonChip>
              ))}
            </div>
          </div>

          <IonButton
            expand="block"
            onClick={handleSubmit}
            style={{ margin: "20px 0" }}
          >
            Update Recipe
          </IonButton>
        </IonList>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Please fill in title and description"
          duration={2000}
          color="warning"
        />
      </IonContent>
    </IonPage>
  );
};

export default EditRecipe;
