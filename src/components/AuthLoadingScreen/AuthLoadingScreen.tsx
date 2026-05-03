import React from "react";
import { IonContent, IonPage, IonSpinner, IonText } from "@ionic/react";
import "./AuthLoadingScreen.css";

/** Shown while auth session is resolving. */
const AuthLoadingScreen: React.FC = () => (
  <IonPage>
    <IonContent fullscreen className="ion-padding">
      <IonText color="medium">
        <div className="auth-loading-screen__spinner-wrap">
          <IonSpinner name="crescent" />
        </div>
        <p className="auth-loading-screen__hint">Loading…</p>
      </IonText>
    </IonContent>
  </IonPage>
);

export default AuthLoadingScreen;
