import React from "react";
import { IonContent, IonPage, IonSpinner, IonText } from "@ionic/react";

/** Shown while auth session is resolving. */
const AuthLoadingScreen: React.FC = () => (
  <IonPage>
    <IonContent fullscreen className="ion-padding">
      <IonText color="medium">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <IonSpinner name="crescent" />
        </div>
        <p style={{ textAlign: "center", marginTop: 12 }}>Loading…</p>
      </IonText>
    </IonContent>
  </IonPage>
);

export default AuthLoadingScreen;
