import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonAlert,
  IonPopover,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonFab,
  IonFabButton,
  IonToast,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { create, trash, add } from "ionicons/icons";
import { useRecipes } from "../contexts/RecipeContext";
import { useAuth } from "../contexts/AuthContext";
import RecipeCard from "../components/RecipeCard";
import AppHeader from "../components/AppHeader";
import NoData from "../components/NoData";

const RecipeList: React.FC = () => {
  const { user } = useAuth();
  const { recipes, recipesLoading, toggleFavorite, shareRecipe, deleteRecipe } =
    useRecipes();
  const [toast, setToast] = useState({ show: false, message: "" });
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
      <IonContent fullscreen>
        {recipesLoading ? (
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
              <p style={{ marginTop: 12, textAlign: "center" }}>
                Loading recipes…
              </p>
            </IonText>
          </div>
        ) : recipes.length === 0 ? (
          <NoData
            title="No recipes yet!"
            description="Tap the + button to add your first recipe."
          />
        ) : (
          <div style={{ paddingBottom: "80px" }}>
            {recipes.map((recipe) => (
              <div key={recipe.id} style={{ marginBottom: "12px" }}>
                <RecipeCard
                  recipe={recipe}
                  onFavorite={async (recipeId) => {
                    try {
                      await toggleFavorite(recipeId);
                    } catch {
                      setToast({ show: true, message: "Could not update favorite." });
                    }
                  }}
                  onShare={shareRecipe}
                  onMenuClick={(event, recipeId) =>
                    setPopoverOpen({ isOpen: true, event, recipeId })
                  }
                  showMenu={recipe.userId === user?.id}
                />
              </div>
            ))}
          </div>
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
              routerLink={`/recipes/edit/${popoverOpen.recipeId}`}
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
                  (r) => r.id === popoverOpen.recipeId,
                );
                const name = recipe?.title?.trim() || "this recipe";
                const shortName =
                  name.length > 50 ? `${name.slice(0, 47)}…` : name;
                setDeleteAlert({
                  isOpen: true,
                  recipeId: popoverOpen.recipeId,
                  recipeName: shortName,
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
          message={`Are you sure you want to delete "${deleteAlert.recipeName || "this recipe"}"?`}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: "Delete",
              role: "destructive",
              handler: async () => {
                try {
                  await deleteRecipe(deleteAlert.recipeId);
                } catch {
                  setToast({ show: true, message: "Could not delete recipe." });
                } finally {
                  setDeleteAlert({
                    isOpen: false,
                    recipeId: "",
                    recipeName: "",
                  });
                }
              },
            },
          ]}
        />

        <IonToast
          isOpen={toast.show}
          onDidDismiss={() => setToast((t) => ({ ...t, show: false }))}
          message={toast.message}
          duration={2500}
          color="danger"
        />

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink="/recipes/add" color="secondary">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default RecipeList;
