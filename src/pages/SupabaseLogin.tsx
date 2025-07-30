import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonText,
  IonSpinner,
  IonItem,
  IonLabel,
  IonInput,
  IonToast,
} from "@ionic/react";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import AppHeader from "../components/AppHeader";

const SupabaseLogin: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, loading } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showToast, setShowToast] = useState({
    show: false,
    message: "",
    color: "danger",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setShowToast({
        show: true,
        message: "Please fill in all fields",
        color: "warning",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email.trim(), password);
        setShowToast({
          show: true,
          message: "Check your email to confirm your account",
          color: "success",
        });
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (error: any) {
      setShowToast({ show: true, message: error.message, color: "danger" });
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <IonPage>
        <AppHeader title="Loading..." />
        <IonContent className="ion-padding">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <AppHeader title="RecipeHub" showMenu={false} />
      <IonContent className="ion-padding">
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <div style={{ marginBottom: "40px" }}>
            <h1 style={{ fontSize: "48px", margin: "0" }}>👨‍🍳</h1>
            <IonText color="medium">
              <h2>{isSignUp ? "Join RecipeHub" : "Welcome to RecipeHub"}</h2>
              <p>Share your recipes with friends</p>
            </IonText>
          </div>

          <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <IonItem>
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value!)}
                placeholder="Enter your email"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value!)}
                placeholder="Enter your password"
              />
            </IonItem>

            <IonButton
              expand="block"
              onClick={handleSubmit}
              disabled={isLoading}
              style={{ margin: "20px 0" }}
            >
              {isLoading ? <IonSpinner /> : isSignUp ? "Sign Up" : "Sign In"}
            </IonButton>

            <IonButton fill="clear" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </IonButton>
          </div>
        </div>

        <IonToast
          isOpen={showToast.show}
          onDidDismiss={() => setShowToast({ ...showToast, show: false })}
          message={showToast.message}
          duration={3000}
          color={showToast.color}
        />
      </IonContent>
    </IonPage>
  );
};

export default SupabaseLogin;
