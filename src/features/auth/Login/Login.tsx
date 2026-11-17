import { IonContent, IonPage } from "@ionic/react";
import { useState } from "react";
import type { ReactElement } from "react";
import { useHistory } from "react-router-dom";

import { appConfig } from "../../../app.config";
import { useAuth } from "../../../contexts/AuthContext";
import {
  AppButton,
  AppIcon,
  AppToast,
  TextHeading,
} from "../../../design-system";
import { AuthProviders } from "../AuthProviders";
import { LoginForm } from "./LoginForm";
import { useLoginRedirect } from "./useLoginRedirect";

import "../AuthProviders.css";
import "./Login.css";

export default function Login(): ReactElement {
  const history = useHistory();
  const {
    user,
    loginWithEmail,
    loginWithGoogle,
    loginWithApple,
    continueWithoutSignIn,
  } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [socialBusy, setSocialBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);

  useLoginRedirect(Boolean(user));

  const continueAsGuest = () => {
    continueWithoutSignIn();
    history.replace("/recipes");
  };

  const onSubmitEmail = async (email: string, password: string) => {
    setErrorMessage(null);
    setEmailBusy(true);
    try {
      await loginWithEmail(email, password);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in";
      setErrorMessage(message);
      setToastOpen(true);
    } finally {
      setEmailBusy(false);
    }
  };

  const runSocial = async (provider: "google" | "apple") => {
    setErrorMessage(null);
    setSocialBusy(true);
    try {
      if (provider === "google") {
        await loginWithGoogle();
      } else {
        await loginWithApple();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in";
      setErrorMessage(message);
      setToastOpen(true);
    } finally {
      setSocialBusy(false);
    }
  };

  const busy = emailBusy || socialBusy;

  return (
    <IonPage className="login-page">
      <IonContent fullscreen scrollY className="login-page__content">
        <button
          type="button"
          className="login-page__close"
          aria-label="Continue as guest"
          onClick={continueAsGuest}
        >
          <AppIcon name="closeOutline" size="md" />
        </button>

        <div className="login-page__shell">
          <header className="login-page__brand">
            <div className="login-page__brand-mark" aria-hidden="true">
              <img
                className="login-page__brand-logo"
                src={appConfig.brand.logoSrc}
                alt=""
              />
            </div>
            <p className="login-page__brand-name text-body1 weight-semibold">
              {appConfig.appName}
            </p>
            <p className="login-page__brand-tagline">Cook · Share · Save</p>
          </header>

          <section className="login-page__card" aria-label="Sign in">
            <div className="login-page__card-header">
              <TextHeading
                level={1}
                className="page-hero-title login-page__card-title"
              >
                Sign in
              </TextHeading>
              <p className="section-subtitle login-page__card-subtitle">
                Welcome back. Sign in to continue.
              </p>
            </div>

            <LoginForm
              busy={busy}
              errorMessage={errorMessage}
              onSubmitEmail={onSubmitEmail}
            />

            <div className="login-page__divider" role="presentation">
              or continue with
            </div>

            <AuthProviders
              busy={busy}
              onGoogle={() => void runSocial("google")}
              onApple={() => void runSocial("apple")}
            />

            <AppButton
              type="button"
              variant="text"
              fullWidth
              disabled={busy}
              onClick={continueAsGuest}
            >
              <AppIcon name="personOutline" size="sm" />
              Continue as guest
            </AppButton>

            <p className="login-page__footer">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="login-page__footer-link"
                disabled={busy}
                onClick={() => history.push("/register")}
              >
                Create account
              </button>
            </p>
          </section>
        </div>

        <AppToast
          isOpen={toastOpen}
          message={errorMessage ?? "Unable to sign in"}
          color="danger"
          onDidDismiss={() => setToastOpen(false)}
        />
      </IonContent>
    </IonPage>
  );
}
