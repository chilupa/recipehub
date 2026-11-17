import { IonButton, IonSpinner } from '@ionic/react';
import type { ReactNode, ReactElement } from 'react';

import './AppButton.css';

export type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type AppButtonColor = 'primary' | 'secondary' | 'danger' | 'medium' | 'light' | 'dark';

export interface AppButtonProps {
  children: ReactNode;
  variant?: AppButtonVariant;
  /** Override Ionic color when needed (e.g. light text on a primary toolbar). */
  color?: AppButtonColor;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  expand?: 'block' | 'full';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  'aria-label'?: string;
}

const variantMap: Record<
  AppButtonVariant,
  { fill: 'solid' | 'outline' | 'clear'; color: AppButtonColor }
> = {
  primary: { fill: 'solid', color: 'primary' },
  secondary: { fill: 'solid', color: 'secondary' },
  outline: { fill: 'outline', color: 'primary' },
  text: { fill: 'clear', color: 'primary' },
  danger: { fill: 'solid', color: 'danger' },
};

export function AppButton({
  children,
  variant = 'primary',
  color,
  loading = false,
  disabled = false,
  fullWidth = false,
  expand,
  className,
  type = 'button',
  onClick,
  'aria-label': ariaLabel,
}: AppButtonProps): ReactElement {
  const mapped = variantMap[variant];
  const classes = ['app-button', `app-button--${variant}`, className].filter(Boolean).join(' ');

  return (
    <IonButton
      type={type}
      className={classes}
      fill={mapped.fill}
      color={color ?? mapped.color}
      disabled={disabled || loading}
      expand={fullWidth ? 'block' : expand}
      aria-busy={loading}
      aria-label={ariaLabel}
      onClick={() => {
        if (disabled || loading) {
          return;
        }
        onClick?.();
      }}
    >
      {loading ? <IonSpinner name="crescent" className="app-button__spinner" /> : null}
      <span
        className={loading ? 'app-button__label app-button__label--hidden' : 'app-button__label'}
      >
        {children}
      </span>
    </IonButton>
  );
}
