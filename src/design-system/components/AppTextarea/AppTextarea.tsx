import { IonNote, IonText, IonTextarea } from "@ionic/react";
import type { ComponentProps, ReactElement } from "react";
import { forwardRef, useId } from "react";

import "../AppInput/AppInput.css";
import "./AppTextarea.css";

export interface AppTextareaProps
  extends Omit<ComponentProps<typeof IonTextarea>, "label"> {
  label: string;
  helperText?: string;
  errorText?: string;
  /** Visually hide the label while keeping it available to assistive tech. */
  hideLabel?: boolean;
}

export const AppTextarea = forwardRef<
  HTMLIonTextareaElement,
  AppTextareaProps
>(function AppTextarea(
  {
    label,
    helperText,
    errorText,
    hideLabel = false,
    className,
    name,
    id,
    ...rest
  },
  ref,
): ReactElement {
  const generatedId = useId();
  const inputId = id ?? (name ? `app-textarea-${name}` : generatedId);
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(errorText);
  const classes = [
    "app-input",
    "app-textarea",
    hasError ? "app-input--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <label
        className={
          hideLabel
            ? "app-input__label app-input__label--hidden"
            : "app-input__label"
        }
        htmlFor={inputId}
      >
        {label}
      </label>
      <div className="app-input__field app-textarea__field">
        <IonTextarea
          ref={ref}
          id={inputId}
          name={name}
          className="app-input__control app-textarea__control"
          aria-invalid={hasError}
          aria-describedby={
            hasError ? errorId : helperText ? helperId : undefined
          }
          {...rest}
        />
      </div>
      {hasError ? (
        <IonText color="danger" id={errorId}>
          <IonNote className="app-input__message app-input__message--error">
            {errorText}
          </IonNote>
        </IonText>
      ) : helperText ? (
        <IonNote className="app-input__message" id={helperId}>
          {helperText}
        </IonNote>
      ) : null}
    </div>
  );
});
