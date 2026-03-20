import React, { useEffect } from "react";
import {
  IonList,
  IonItem,
  IonContent,
  IonPage,
  IonButton,
  IonText,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import {
  addCircleOutline,
  createOutline,
  heartOutline,
  sparkles,
  bookmarkOutline,
  shieldCheckmarkOutline,
  logoGoogle,
} from "ionicons/icons";

const Login: React.FC = () => {
  const { user, loginWithGoogle, isLoading, authError } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (user) {
      history.replace("/recipes");
    }
  }, [user, history]);

  return (
    <IonPage>
      <AppHeader />
      <IonContent
        className="ion-padding"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: "100%",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <IonText>
              <h2 style={{ margin: 0, color: "var(--ion-color-dark)" }}>
                Sign in
              </h2>
            </IonText>
            <p
              style={{
                margin: "8px 0 0",
                color: "var(--ion-color-medium)",
              }}
            >
              Save your recipes and favorite others.
            </p>
          </div>

          <IonButton
            expand="block"
            onClick={() => loginWithGoogle()}
            disabled={isLoading}
            style={{ maxWidth: 420, margin: "0 auto" }}
          >
            {isLoading ? (
              <IonSpinner name="crescent" />
            ) : (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <IonIcon icon={logoGoogle} />
                Continue with Google
              </span>
            )}
          </IonButton>

          <p
            style={{
              margin: "14px 0 0",
              color: "var(--ion-color-medium)",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            We’ll use Google only to create your account and sync favorites.
          </p>
          {authError && (
            <p
              style={{
                margin: "10px 0 0",
                color: "var(--ion-color-danger)",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              {authError}
            </p>
          )}

          <div style={{ marginTop: 18, textAlign: "left" }}>
            <p
              style={{
                margin: "0 0 10px",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--ion-color-dark)",
              }}
            >
              What you can do
            </p>
            <IonList lines="none" style={{ padding: 0, margin: 0 }}>
              <IonItem lines="none" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <IonIcon icon={addCircleOutline} slot="start" color="primary" />
                <IonText>
                  <p style={{ margin: 0, color: "var(--ion-color-medium)" }}>
                    Add recipes with ingredients, steps, and tags.
                  </p>
                </IonText>
              </IonItem>
              <IonItem lines="none" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <IonIcon icon={createOutline} slot="start" color="secondary" />
                <IonText>
                  <p style={{ margin: 0, color: "var(--ion-color-medium)" }}>
                    Edit anytime and keep everything up to date.
                  </p>
                </IonText>
              </IonItem>
              <IonItem lines="none" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <IonIcon icon={bookmarkOutline} slot="start" color="tertiary" />
                <IonText>
                  <p style={{ margin: 0, color: "var(--ion-color-medium)" }}>
                    Favorite other recipes and find them later.
                  </p>
                </IonText>
              </IonItem>
            
            </IonList>

           
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
