import React from "react";
import { IonCard, IonCardContent, IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoginHero from "./LoginHero";
import LoginSignInPanel from "./LoginSignInPanel";
import { useLoginRedirect } from "./useLoginRedirect";
import "./Login.css";

const Login: React.FC = () => {
  const {
    user,
    loginWithGoogle,
    loginWithApple,
    continueWithoutSignIn,
    isLoading,
    authError,
  } = useAuth();
  const history = useHistory();

  useLoginRedirect(Boolean(user));

  const handleBrowseWithoutAccount = () => {
    continueWithoutSignIn();
    history.replace("/recipes");
  };

  return (
    <IonPage className="login-page">
      <IonContent fullscreen className="login-content">
        <div className="login-scroll">
          <IonCard className="login-card">
            <IonCardContent>
              <LoginHero />
              <LoginSignInPanel
                isLoading={isLoading}
                authError={authError}
                onGoogle={loginWithGoogle}
                onApple={loginWithApple}
                onGuest={handleBrowseWithoutAccount}
              />
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
