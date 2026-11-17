import type { ReactNode, ReactElement } from 'react';

import type { IconName } from '../../icons/iconRegistry';
import { AppIcon } from '../AppIcon';

import './AppBanner.css';

export type AppBannerTone = 'info' | 'success' | 'warning' | 'error';

export interface AppBannerProps {
  title: string;
  message?: string;
  tone?: AppBannerTone;
  action?: ReactNode;
  /** When set, shows a trailing dismiss (X) button. Parent controls visibility. */
  onDismiss?: () => void;
}

const toneIcons: Record<AppBannerTone, IconName> = {
  info: 'informationCircle',
  success: 'checkmarkCircle',
  warning: 'warning',
  error: 'alertCircle',
};

export function AppBanner({
  title,
  message,
  tone = 'info',
  action,
  onDismiss,
}: AppBannerProps): ReactElement {
  return (
    <div className={`app-banner app-banner--${tone}`} role="status">
      <div className="app-banner__icon">
        <AppIcon name={toneIcons[tone]} size="md" />
      </div>
      <div className="app-banner__body">
        <strong className="app-banner__title">{title}</strong>
        {message ? <p className="app-banner__message">{message}</p> : null}
      </div>
      {action ? <div className="app-banner__action">{action}</div> : null}
      {onDismiss ? (
        <button
          type="button"
          className="app-banner__dismiss"
          aria-label="Dismiss"
          onClick={onDismiss}
        >
          <AppIcon name="closeOutline" size="sm" />
        </button>
      ) : null}
    </div>
  );
}
