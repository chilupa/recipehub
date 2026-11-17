import type { ReactElement } from 'react';

import { AppIcon } from '../../design-system';

import { GoogleLogo } from './GoogleLogo';

import './AuthProviders.css';

type AuthProvidersProps = {
  busy: boolean;
  onGoogle: () => void;
  onApple: () => void;
};

/**
 * Provider buttons follow Google Identity and Sign in with Apple visual guidelines:
 * full-width “Continue with …” controls, logo left, label centered in the remaining space.
 */
export function AuthProviders({ busy, onGoogle, onApple }: AuthProvidersProps): ReactElement {
  return (
    <div className="auth-providers">
      <button
        type="button"
        className="auth-oauth auth-oauth--google"
        disabled={busy}
        onClick={onGoogle}
      >
        <span className="auth-oauth__logo" aria-hidden="true">
          <GoogleLogo size={20} />
        </span>
        <span className="auth-oauth__label">Continue with Google</span>
      </button>
      <button
        type="button"
        className="auth-oauth auth-oauth--apple"
        disabled={busy}
        onClick={onApple}
      >
        <span className="auth-oauth__logo" aria-hidden="true">
          <AppIcon name="logoApple" size="md" />
        </span>
        <span className="auth-oauth__label">Continue with Apple</span>
      </button>
    </div>
  );
}
