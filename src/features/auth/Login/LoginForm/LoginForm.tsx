import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactElement } from "react";
import { Controller, useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";

import { AppButton, AppInput } from "../../../../design-system";
import { loginSchema, type LoginFormValues } from "../../loginSchema";

type Props = {
  busy: boolean;
  errorMessage: string | null;
  onSubmitEmail: (email: string, password: string) => Promise<void>;
};

export function LoginForm({
  busy,
  errorMessage,
  onSubmitEmail,
}: Props): ReactElement {
  const history = useHistory();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    await onSubmitEmail(values.email, values.password);
  });

  const formBusy = busy || isSubmitting;

  return (
    <form className="login-page__form" onSubmit={onSubmit} noValidate>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <AppInput
            label="Email address"
            hideLabel
            placeholder="Email address"
            type="email"
            name={field.name}
            value={field.value}
            leadingIcon="mailOutline"
            onIonInput={(event) => field.onChange(event.detail.value ?? "")}
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
            hideLabel
            placeholder="Password"
            type="password"
            name={field.name}
            value={field.value}
            leadingIcon="lockClosedOutline"
            onIonInput={(event) => field.onChange(event.detail.value ?? "")}
            onIonBlur={field.onBlur}
            errorText={errors.password?.message}
            autocomplete="current-password"
          />
        )}
      />

      <div className="login-page__row">
        <button
          type="button"
          className="login-page__forgot"
          disabled={formBusy}
          onClick={() => history.push("/forgot-password")}
        >
          Forgot password?
        </button>
      </div>

      {errorMessage ? <p className="auth-form-error">{errorMessage}</p> : null}

      <AppButton type="submit" fullWidth loading={isSubmitting} disabled={formBusy}>
        Sign in
      </AppButton>
    </form>
  );
}
