import React from "react";
import {
  IonButton,
  IonContent,
  IonPage,
  IonText,
} from "@ionic/react";
import AppHeader from "../../components/AppHeader";
import RecipeDetailSkeleton from "../../components/RecipeDetailSkeleton";
import "./RecipeDetail.css";

export const RecipeDetailLoadingPage: React.FC = () => (
  <IonPage>
    <AppHeader showBackButton />
    <IonContent className="ion-padding">
      <RecipeDetailSkeleton />
    </IonContent>
  </IonPage>
);

export const RecipeDetailNotFoundPage: React.FC = () => (
  <IonPage>
    <AppHeader title="Recipe Not Found" showBackButton />
    <IonContent className="ion-padding">
      <IonText>Recipe not found.</IonText>
      <IonButton
        expand="block"
        className="recipe-detail-not-found-btn"
        routerLink="/recipes"
      >
        Back to recipes
      </IonButton>
    </IonContent>
  </IonPage>
);
