import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonAlert,
  IonPopover,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonFab,
  IonFabButton
} from "@ionic/react";
import { create, trash, add } from "ionicons/icons";
import { useRecipes } from "../contexts/RecipeContext";
import RecipeCard from "../components/RecipeCard";
import AppHeader from "../components/AppHeader";

const RecipeList: React.FC = () => {
  const { recipes, toggleLike, shareRecipe, deleteRecipe } = useRecipes();
  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean;
    recipeId: string;
    recipeName: string;
  }>({ isOpen: false, recipeId: "", recipeName: "" });
  const [popoverOpen, setPopoverOpen] = useState<{
    isOpen: boolean;
    event: Event | undefined;
    recipeId: string;
  }>({ isOpen: false, event: undefined, recipeId: "" });


  return (
    <IonPage>
      <AppHeader />
      <IonContent fullscreen className="ion-padding">
        {recipes.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <IonText color="medium">
              <h2>No recipes yet!</h2>
              <p>Tap the + button to add your first recipe.</p>
            </IonText>
          </div>
        ) : (
          <IonGrid style={{ marginBottom: "40px" }}>
            <IonRow>
              {recipes.map((recipe) => (
                <IonCol size="12" sizeMd="6" key={recipe.id}>
                  <RecipeCard
                    recipe={recipe}
                    onLike={toggleLike}
                    onShare={shareRecipe}
                    onMenuClick={(event, recipeId) =>
                      setPopoverOpen({ isOpen: true, event, recipeId })
                    }
                    showMenu={true}
                  />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}

        <IonPopover
          isOpen={popoverOpen.isOpen}
          event={popoverOpen.event}
          onDidDismiss={() =>
            setPopoverOpen({ isOpen: false, event: undefined, recipeId: "" })
          }
        >
          <IonList>
            <IonItem
              button
              detail={false}
              routerLink={`/edit/${popoverOpen.recipeId}`}
              onClick={() =>
                setPopoverOpen({
                  isOpen: false,
                  event: undefined,
                  recipeId: "",
                })
              }
            >
              <IonIcon icon={create} slot="start" />
              <IonLabel>Edit</IonLabel>
            </IonItem>
            <IonItem
              button
              detail={false}
              color="danger"
              onClick={() => {
                const recipe = recipes.find(
                  (r) => r.id === popoverOpen.recipeId
                );
                setDeleteAlert({
                  isOpen: true,
                  recipeId: popoverOpen.recipeId,
                  recipeName: recipe?.title || "",
                });
                setPopoverOpen({
                  isOpen: false,
                  event: undefined,
                  recipeId: "",
                });
              }}
            >
              <IonIcon icon={trash} slot="start" />
              <IonLabel>Delete</IonLabel>
            </IonItem>
          </IonList>
        </IonPopover>

        <IonAlert
          isOpen={deleteAlert.isOpen}
          onDidDismiss={() =>
            setDeleteAlert({ isOpen: false, recipeId: "", recipeName: "" })
          }
          header="Delete Recipe"
          message={`Are you sure you want to delete "${deleteAlert.recipeName}"?`}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: "Delete",
              role: "destructive",
              handler: () => {
                deleteRecipe(deleteAlert.recipeId);
                setDeleteAlert({ isOpen: false, recipeId: "", recipeName: "" });
              },
            },
          ]}
        />

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink="/add">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default RecipeList;
