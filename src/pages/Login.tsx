import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  useIonRouter,
} from "@ionic/react";

import AppHeader from "../components/AppHeader";
import { useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  const { login } = useAuth();
  const ionRouter = useIonRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    if (!name.trim()) return;
    login(name.trim());
    ionRouter.push("/recipes", "root", "replace");
  };

  return (
    <IonPage>
      <AppHeader />
      <IonContent className="ion-padding">
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <IonText color="medium">
            <h2 style={{ color: "var(--ion-color-dark)" }}>
              Your personal recipe space
            </h2>
            <p style={{ color: "var(--ion-color-medium)" }}>
              Save and access your recipes anytime.
            </p>
          </IonText>
        </div>

        <IonItem>
          <IonLabel position="stacked">Your Name (for your recipes)</IonLabel>
          <IonInput
            value={name}
            onIonInput={(e) => setName(e.detail.value!)}
            placeholder="Enter your name"
          />
        </IonItem>

        {/* <IonItem>
          <IonLabel position="stacked">Email</IonLabel>
          <IonInput
            type="email"
            value={email}
            onIonInput={(e) => setEmail(e.detail.value!)}
            placeholder="Enter your email"
          />
        </IonItem> */}

        <IonButton
          expand="block"
          onClick={handleLogin}
          disabled={!name.trim()}
          style={{ margin: "20px 0" }}
        >
          Start Cooking
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;
