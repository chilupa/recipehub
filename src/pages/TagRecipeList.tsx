import React, { useCallback, useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonAlert,
  IonPopover,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonToast,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { create, trash } from "ionicons/icons";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useRecipes } from "../contexts/RecipeContext";
import { fetchRecipesByTag } from "../lib/recipeSupabase";
import RecipeCard from "../components/RecipeCard";
import AppHeader from "../components/AppHeader";
import NoData from "../components/NoData";
import type { Recipe } from "../types/Recipe";

function safeDecodeURIComponent(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";
const MOCK_RECIPES_KEY = "recipe-logger-recipes";

function readMockRecipesByTag(tag: string): Recipe[] {
  try {
    const stored = localStorage.getItem(MOCK_RECIPES_KEY);
    const all = stored ? (JSON.parse(stored) as Recipe[]) : [];
    if (!Array.isArray(all)) return [];
    const trimmed = tag.trim();
    return all
      .filter(
        (r) =>
          Array.isArray(r.tags) && r.tags.some((t) => String(t) === trimmed),
      )
      .slice()
      .sort((a, b) =>
        (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
      );
  } catch {
    return [];
  }
}

const TagRecipeList: React.FC = () => {
  const { tag: tagParam } = useParams<{ tag: string }>();
  const { user } = useAuth();
  const { toggleFavorite, shareRecipe, deleteRecipe } = useRecipes();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
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

  const tagLabel = tagParam ? safeDecodeURIComponent(tagParam) : "";

  const load = useCallback(async () => {
    const decoded = tagParam ? safeDecodeURIComponent(tagParam) : "";
    if (!decoded.trim()) {
      setRecipes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (useMockData) {
        setRecipes(readMockRecipesByTag(decoded));
        return;
      }
      if (!user?.id) {
        setRecipes([]);
        return;
      }
      const list = await fetchRecipesByTag(decoded, user.id);
      setRecipes(list);
    } catch (e) {
      console.error(e);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [tagParam, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const tagDisplay = tagLabel.trim();

  const pageIntro =
    tagDisplay ? (
      <div
        className="ion-padding"
        style={{
          paddingTop: 20,
          paddingBottom: 4,
        }}
      >
        <IonText color="medium">
          <p
            style={{
              margin: 0,
              fontSize: "0.8125rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Recipes for this tag
          </p>
        </IonText>
        <h3
          style={{
            margin: "10px 0 0",
            fontWeight: 700,
            lineHeight: 1.25,
            color: "var(--ion-color-primary)",
          }}
        >
          {tagDisplay}
        </h3>
        {!loading && recipes.length > 0 ? (
          <IonText color="medium">
            <p style={{ margin: "8px 0 0", fontSize: "0.9375rem" }}>
              {recipes.length === 1
                ? "1 recipe"
                : `${recipes.length} recipes`}
            </p>
          </IonText>
        ) : null}
      </div>
    ) : null;

  return (
    <IonPage>
      <AppHeader showBackButton />
      <IonContent fullscreen>
        {loading ? (
          <>
            {pageIntro}
            <div
              className="ion-padding"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 24,
              }}
            >
              <IonSpinner name="crescent" />
              <IonText color="medium">
                <p style={{ marginTop: 12, textAlign: "center" }}>
                  Loading recipes…
                </p>
              </IonText>
            </div>
          </>
        ) : !tagDisplay ? (
          <NoData
            title="Invalid tag"
            description="This link doesn’t include a valid tag."
          />
        ) : recipes.length === 0 ? (
          <>
            {pageIntro}
            <NoData
              title="No recipes with this tag"
              description={`Nobody has tagged a recipe “${tagDisplay}” yet.`}
            />
          </>
        ) : (
          <div style={{ paddingBottom: "80px" }}>
            {pageIntro}
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onFavorite={async (recipeId) => {
                  try {
                    await toggleFavorite(recipeId);
                  } catch {
                    setToast({
                      show: true,
                      message: "Could not update favorite.",
                    });
                  }
                }}
                onShare={shareRecipe}
                onMenuClick={(event, recipeId) =>
                  setPopoverOpen({ isOpen: true, event, recipeId })
                }
                showMenu={recipe.userId === user?.id}
              />
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
            { text: "Cancel", role: "cancel" },
            {
              text: "Delete",
              role: "destructive",
              handler: async () => {
                try {
                  await deleteRecipe(deleteAlert.recipeId);
                  await load();
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
      </IonContent>
    </IonPage>
  );
};

export default TagRecipeList;
