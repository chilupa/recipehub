import React from "react";
import { IonIcon, IonSpinner } from "@ionic/react";
import { logoApple, logoGoogle } from "ionicons/icons";
import { showSigninStatusBannerFromEnv } from "../loginEnv";
import "./LoginSignInPanel.css";

type Props = {
  isLoading: boolean;
  authError: string | null;
  onGoogle: () => void;
  onApple: () => void;
  onGuest: () => void;
};

const LoginSignInPanel: React.FC<Props> = ({
  isLoading,
  authError,
  onGoogle,
  onApple,
  onGuest,
}) => {
  const showServiceNotice = showSigninStatusBannerFromEnv;

  return (
    <>
      <div className="login-signin-block">
        {showServiceNotice ? (
          <p className="login-service-notice" role="status">
            Sign-in may be temporarily degraded. You can continue as guest and
            retry later.
          </p>
        ) : null}
        <button
          type="button"
          className="login-google-btn"
          onClick={() => onGoogle()}
          disabled={isLoading}
        >
          {isLoading ? (
            <IonSpinner name="crescent" className="login-google-spinner" />
          ) : (
            <>
              <IonIcon icon={logoGoogle} className="login-google-icon" />
              <span className="login-google-label">Continue with Google</span>
            </>
          )}
        </button>
        <button
          type="button"
          className="login-apple-btn"
          onClick={() => onApple()}
          disabled={isLoading}
        >
          {isLoading ? (
            <IonSpinner name="crescent" className="login-google-spinner" />
          ) : (
            <>
              <IonIcon icon={logoApple} className="login-google-icon" />
              <span className="login-google-label">Continue with Apple</span>
            </>
          )}
        </button>
        <p className="login-privacy">
          We only use your sign-in provider to identify you and sync your data -
          no ads, no extra permissions.
        </p>
        <button
          type="button"
          className="login-browse-guest-btn"
          onClick={onGuest}
          disabled={isLoading}
        >
          Continue as guest
        </button>
      </div>

      {authError ? <p className="login-error">{authError}</p> : null}
    </>
  );
};

export default LoginSignInPanel;
