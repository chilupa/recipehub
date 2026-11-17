import { zodResolver } from "@hookform/resolvers/zod";
import { IonContent, IonPage } from "@ionic/react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Controller, useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";

import { useAuth } from "../../../contexts/AuthContext";
import {
  AppButton,
  AppHeader,
  AppInput,
  AppToast,
  TextHeading,
} from "../../../design-system";
import { AuthProviders } from "../AuthProviders";
import { registerSchema, type RegisterFormValues } from "../registerSchema";

import "../AuthProviders.css";

export default function Register(): ReactElement {
  const history = useHistory();
  const {
    registerWithEmail,
    loginWithGoogle,
    loginWithApple,
    continueWithoutSignIn,
  } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [socialBusy, setSocialBusy] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const continueAsGuest = () => {
    continueWithoutSignIn();
    history.replace("/recipes");
  };

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    try {
      await registerWithEmail(values.name, values.email, values.password);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create account",
      );
      setToastOpen(true);
    }
  });

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
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in",
      );
      setToastOpen(true);
    } finally {
      setSocialBusy(false);
    }
  };

  const busy = isSubmitting || socialBusy;

  return (
    <IonPage>
      <AppHeader showBack onBack={() => history.push("/login")} />
      <IonContent fullscreen>
        <div className="page-container stack-lg">
          <section className="stack">
            <TextHeading level={1} className="page-hero-title">
              Create account
            </TextHeading>
            <p className="section-subtitle">
              Save recipes, favorites, and shopping lists under your account.
            </p>
          </section>

          <form className="stack" onSubmit={onSubmit} noValidate>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <AppInput
                  label="Full name"
                  name={field.name}
                  value={field.value}
                  onIonInput={(event) =>
                    field.onChange(event.detail.value ?? "")
                  }
                  onIonBlur={field.onBlur}
                  errorText={errors.name?.message}
                  autocomplete="name"
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <AppInput
                  label="Email"
                  type="email"
                  name={field.name}
                  value={field.value}
                  onIonInput={(event) =>
                    field.onChange(event.detail.value ?? "")
                  }
                  onIonBlur={field.onBlur}
                  errorText={errors.email?.message}
                  autocomplete="email"
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <AppInput
                  label="Password"
                  type="password"
                  name={field.name}
                  value={field.value}
                  onIonInput={(event) =>
                    field.onChange(event.detail.value ?? "")
                  }
                  onIonBlur={field.onBlur}
                  errorText={errors.password?.message}
                  autocomplete="new-password"
                />
              )}
            />
            {errorMessage ? (
              <p className="auth-form-error">{errorMessage}</p>
            ) : null}
            <AppButton
              type="submit"
              fullWidth
              loading={isSubmitting}
              disabled={busy}
            >
              Create account
            </AppButton>
          </form>

          <AuthProviders
            busy={busy}
            onGoogle={() => void runSocial("google")}
            onApple={() => void runSocial("apple")}
          />

          <div className="stack">
            <AppButton
              type="button"
              variant="text"
              fullWidth
              disabled={busy}
              onClick={() => history.push("/login")}
            >
              Already have an account? Sign in
            </AppButton>
            <AppButton
              type="button"
              variant="outline"
              fullWidth
              disabled={busy}
              onClick={continueAsGuest}
            >
              Continue as guest
            </AppButton>
          </div>
        </div>

        <AppToast
          isOpen={toastOpen}
          message={errorMessage ?? "Unable to create account"}
          color="danger"
          onDidDismiss={() => setToastOpen(false)}
        />
      </IonContent>
    </IonPage>
  );
}
