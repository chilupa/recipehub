import { IonInput, IonNote, IonText } from '@ionic/react';
import type { ComponentProps, ReactElement } from 'react';
import { forwardRef, useId, useState } from 'react';

import type { IconName } from '../../icons';
import { AppIcon } from '../AppIcon';

import './AppInput.css';

export type AppInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'time';

export interface AppInputProps extends Omit<ComponentProps<typeof IonInput>, 'type' | 'label'> {
  label: string;
  helperText?: string;
  errorText?: string;
  type?: AppInputType;
  leadingIcon?: IconName;
  /** Visually hide the label while keeping it available to assistive tech. */
  hideLabel?: boolean;
}

export const AppInput = forwardRef<HTMLIonInputElement, AppInputProps>(function AppInput(
  {
    label,
    helperText,
    errorText,
    type = 'text',
    leadingIcon,
    hideLabel = false,
    className,
    name,
    id,
    ...rest
  },
  ref,
): ReactElement {
  const generatedId = useId();
  const inputId = id ?? (name ? `app-input-${name}` : generatedId);
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(errorText);
  const isPassword = type === 'password';
  const [passwordVisible, setPasswordVisible] = useState(false);
  const resolvedType = isPassword && passwordVisible ? 'text' : type;
  const classes = [
    'app-input',
    hasError ? 'app-input--error' : '',
    leadingIcon ? 'app-input--with-leading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <label
        className={hideLabel ? 'app-input__label app-input__label--hidden' : 'app-input__label'}
        htmlFor={inputId}
      >
        {label}
      </label>
      <div className="app-input__field">
        {leadingIcon ? (
          <span className="app-input__leading" aria-hidden="true">
            <AppIcon name={leadingIcon} size="md" />
          </span>
        ) : null}
        <IonInput
          ref={ref}
          id={inputId}
          name={name}
          type={resolvedType}
          className="app-input__control"
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            className="app-input__visibility"
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={passwordVisible}
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            <AppIcon name={passwordVisible ? 'eyeOffOutline' : 'eyeOutline'} size="md" />
          </button>
        ) : null}
      </div>
      {hasError ? (
        <IonText color="danger" id={errorId}>
          <IonNote className="app-input__message app-input__message--error">{errorText}</IonNote>
        </IonText>
      ) : helperText ? (
        <IonNote className="app-input__message" id={helperId}>
          {helperText}
        </IonNote>
      ) : null}
    </div>
  );
});
