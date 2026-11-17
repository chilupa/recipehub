import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import { AppLoading } from "../../design-system";

/** Shown while auth session is resolving. */
const AuthLoadingScreen: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <AppLoading fullscreen message="Loading…" />
    </IonContent>
  </IonPage>
);

export default AuthLoadingScreen;
