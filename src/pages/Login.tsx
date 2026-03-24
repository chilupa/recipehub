import React, { useEffect } from "react";
import {
  IonCard,
  IonCardContent,
  IonContent,
  IonPage,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import { useAuth } from "../contexts/AuthContext";
import { useHistory, useLocation } from "react-router-dom";
import { logoGoogle } from "ionicons/icons";
import "./Login.css";

const sanitizeRedirectPath = (value: string | null): string => {
  if (!value) return "/recipes";
  // Only allow in-app relative paths.
  if (!value.startsWith("/") || value.startsWith("//")) return "/recipes";
  if (value.startsWith("/login")) return "/recipes";
  return value;
};

const Login: React.FC = () => {
  const { user, loginWithGoogle, isLoading, authError } = useAuth();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const redirect = new URLSearchParams(location.search).get("redirect");
      history.replace(sanitizeRedirectPath(redirect));
    }
  }, [user, history, location.search]);

  return (
    <IonPage className="login-page">
      <IonContent fullscreen className="login-content">
        <div className="login-scroll">
          <IonCard className="login-card">
            <IonCardContent>
              <header className="login-hero">
                <h1 style={{ color: "var(--ion-color-primary)", fontWeight: 600 }} className="login-title">RecipeHub</h1>
                <p style={{marginTop: 8}} className="login-subtitle">
                  Create, save, and edit your recipes, favorite others’ dishes,
                  and keep everything in sync across your devices.
                </p>
              </header>

              <div className="login-signin-block">
                <button
                  type="button"
                  className="login-google-btn"
                  onClick={() => loginWithGoogle()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <IonSpinner
                      name="crescent"
                      className="login-google-spinner"
                    />
                  ) : (
                    <>
                      <IonIcon icon={logoGoogle} className="login-google-icon" />
                      <span className="login-google-label">
                        Continue with Google
                      </span>
                    </>
                  )}
                </button>
                <p style={{marginTop: 8}} className="login-privacy">
                  We only use Google to identify you and sync your data - no ads,
                  no extra permissions.
                </p>
              </div>

              {authError ? (
                <p className="login-error">{authError}</p>
              ) : null}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
