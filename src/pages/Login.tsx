import React, { useEffect } from "react";
import {
  IonCard,
  IonCardContent,
  IonContent,
  IonPage,
  IonText,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import {
  addCircleOutline,
  createOutline,
  bookmarkOutline,
  logoGoogle,
  restaurantOutline,
  leafOutline,
  heartOutline,
} from "ionicons/icons";
import "./Login.css";

const Login: React.FC = () => {
  const { user, loginWithGoogle, isLoading, authError } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (user) {
      history.replace("/recipes");
    }
  }, [user, history]);

  return (
    <IonPage className="login-page">
      <IonContent fullscreen className="login-content">
        <div className="login-scroll">
          <IonCard className="login-card">
            <IonCardContent>
              <header className="login-hero">
                <p className="login-eyebrow">Welcome</p>
                <div className="login-hero-strip" aria-hidden="true">
                  <div className="login-hero-icon-wrap">
                    <IonIcon icon={restaurantOutline} />
                  </div>
                  <div className="login-hero-dot" />
                  <div className="login-hero-icon-wrap">
                    <IonIcon icon={leafOutline} />
                  </div>
                  <div className="login-hero-dot" />
                  <div className="login-hero-icon-wrap">
                    <IonIcon icon={heartOutline} />
                  </div>
                </div>
                <h1 style={{fontWeight: 600}} className="login-title">RecipeHub</h1>
                <p style={{ marginTop: 8 }}  className="login-subtitle">
                  Your cozy spot to save recipes, tweak them over time, and keep
                  the ones you love close at hand.
                </p>

                <div className="login-perks-panel">
                <p className="login-perks-title" style={{ marginBottom: 8 }}>What you’ll find inside</p>
                <div className="login-perk">
                  <IonIcon icon={addCircleOutline} color="primary" />
                  <IonText>
                    <p>
                      <strong>Add</strong> dishes with ingredients, steps, and
                      tags.
                    </p>
                  </IonText>
                </div>
                <div className="login-perk">
                  <IonIcon icon={createOutline} color="secondary" />
                  <IonText>
                    <p>
                      <strong>Edit</strong> anytime—your notebook grows with you.
                    </p>
                  </IonText>
                </div>
                <div className="login-perk">
                  <IonIcon icon={heartOutline} color="tertiary" />
                  <IonText>
                    <p>
                      <strong>Save</strong> others’ recipes to Favorites in one
                      tap.
                    </p>
                  </IonText>
                </div>
              </div>
              </header>

              <h2 style={{ marginTop: 16 }}  className="login-card-heading">Step into your kitchen</h2>
              <p  style={{ marginTop: 8 }}  className="login-card-hint">
                Sign in with Google, it’s fast, and we’ll keep your recipes and
                favorites in sync across devices.
              </p>

              <div style={{ marginTop: 8 }} className="login-signin-block">
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
                <p style={{ marginTop: 8 }}  className="login-privacy">
                  We only use Google to identify you and sync your data—no ads,
                  no extra permissions.
                </p>
              </div>

              {authError ? (
                <p className="login-error">{authError}</p>
              ) : null}

              
            </IonCardContent>
          </IonCard>

          <p className="login-footer">Cook something good today.</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
