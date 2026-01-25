import React, { useState } from "react";
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
} from "@ionic/react";
import { add, remove } from "ionicons/icons";
import { useRecipes } from "../contexts/RecipeContext";
import { useHistory } from "react-router-dom";

const AddRecipe: React.FC = () => {
  const { addRecipe } = useRecipes();
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: [""],
    instructions: [""],
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    tags: [] as string[],
  });
  const [servingsInput, setServingsInput] = useState("1");

  const [newTag, setNewTag] = useState("");

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      ingredients: [""],
      instructions: [""],
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      tags: [] as string[],
    });
    setNewTag("");
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      setShowToast(true);
      return;
    }

    const cleanedData = {
      ...formData,
      ingredients: formData.ingredients.filter((i) => i.trim()),
      instructions: formData.instructions.filter((i) => i.trim()),
    };

    await addRecipe(cleanedData);
    resetForm();
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
          <IonTitle>Add Recipe</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
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
            <IonLabel position="stacked">Description</IonLabel>
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
                  prepTime: parseInt(e.detail.value!),
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
                  cookTime: parseInt(e.detail.value!),
                })
              }
              placeholder="30"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Servings</IonLabel>
            <IonInput
              type="number"
              value={servingsInput}
              onIonInput={(e) => setServingsInput(e.detail.value!)}
              onIonBlur={() => {
                const value = parseInt(servingsInput);
                const finalValue = value < 1 ? 1 : value;
                setFormData({ ...formData, servings: finalValue });
                setServingsInput(finalValue.toString());
              }}
              placeholder="1"
              min="1"
            />
          </IonItem>

          <h3 style={{ marginLeft: "12px" }}>Ingredients</h3>
          <div style={{ margin: "20px 0" }}>
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
          <h3 style={{ marginLeft: "12px" }}>Instructions</h3>
          <div style={{ margin: "20px 0" }}>
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

          <h3 style={{ marginLeft: "12px" }}>
            Tags ({formData.tags.length}/5)
          </h3>
          <div style={{ margin: "20px 0" }}>
            <IonItem>
              <IonInput
                value={newTag}
                onIonInput={(e) => {
                  const inputValue = e.detail.value!;
                  // Check if last character is comma or space
                  if (inputValue && [",", " "].includes(inputValue.slice(-1))) {
                    const tag = inputValue.slice(0, -1).trim();
                    if (
                      tag &&
                      !formData.tags.includes(tag) &&
                      formData.tags.length < 5
                    ) {
                      setFormData({
                        ...formData,
                        tags: [...formData.tags, tag],
                      });
                    }
                    setNewTag("");
                  } else {
                    setNewTag(inputValue);
                  }
                }}
                placeholder="Add a tag"
                disabled={formData.tags.length >= 5}
                // No Enter key handling; only add tag on comma or space
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
            style={{ padding: "12px" }}
            disabled={!formData.title.trim()}
          >
            Save Recipe
          </IonButton>
        </IonList>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Please fill in title."
          duration={2000}
          color="warning"
        />
      </IonContent>
    </IonPage>
  );
};

export default AddRecipe;
