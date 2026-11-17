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
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../forgotPasswordSchema";

import "../AuthProviders.css";

export default function ForgotPassword(): ReactElement {
  const history = useHistory();
  const { sendPasswordReset } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await sendPasswordReset(values.email);
      setSuccessMessage(
        "Check your email for a link to reset your password.",
      );
      setToastOpen(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Request failed",
      );
      setToastOpen(true);
    }
  });

  return (
    <IonPage>
      <AppHeader showBack onBack={() => history.push("/login")} />
      <IonContent fullscreen>
        <div className="page-container stack-lg">
          <section className="stack">
            <TextHeading level={1} className="page-hero-title">
              Reset password
            </TextHeading>
            <p className="section-subtitle">
              Enter the email for your account and we will send a reset link.
            </p>
          </section>

          <form className="stack" onSubmit={onSubmit} noValidate>
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
            {errorMessage ? (
              <p className="auth-form-error">{errorMessage}</p>
            ) : null}
            <AppButton type="submit" fullWidth loading={isSubmitting}>
              Send reset link
            </AppButton>
            <AppButton
              type="button"
              variant="text"
              fullWidth
              onClick={() => history.push("/login")}
            >
              Back to sign in
            </AppButton>
          </form>
        </div>

        <AppToast
          isOpen={toastOpen}
          message={successMessage ?? errorMessage ?? "Request failed"}
          color={successMessage ? "success" : "danger"}
          onDidDismiss={() => setToastOpen(false)}
        />
      </IonContent>
    </IonPage>
  );
}
