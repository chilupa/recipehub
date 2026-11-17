import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";

import AppHeader from "../../../components/AppHeader";
import RecipeDetailSkeleton from "../../../components/RecipeDetailSkeleton";
import { AppButton } from "../../../design-system";

import "./RecipeDetail.css";

export const RecipeDetailLoadingPage: React.FC = () => (
  <IonPage>
    <AppHeader showBackButton />
    <IonContent className="ion-padding">
      <RecipeDetailSkeleton />
    </IonContent>
  </IonPage>
);

export const RecipeDetailNotFoundPage: React.FC = () => {
  const history = useHistory();
  return (
    <IonPage>
      <AppHeader title="Recipe Not Found" showBackButton />
      <IonContent className="ion-padding">
        <p className="text-body2">Recipe not found.</p>
        <AppButton
          fullWidth
          className="recipe-detail-not-found-btn"
          onClick={() => history.push("/recipes")}
        >
          Back to recipes
        </AppButton>
      </IonContent>
    </IonPage>
  );
};
