import type { ReactNode, ReactElement } from 'react';

import type { IconName } from '../../icons/iconRegistry';
import { AppButton } from '../AppButton';
import { AppIcon } from '../AppIcon';
import { TextHeading } from '../TextHeading';

import './AppEmptyState.css';

export interface AppEmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function AppEmptyState({
  title,
  description,
  icon = 'informationCircleOutline',
  actionLabel,
  onAction,
  children,
}: AppEmptyStateProps): ReactElement {
  return (
    <div className="app-empty-state" role="status">
      <div className="app-empty-state__icon">
        <AppIcon name={icon} size="xl" />
      </div>
      <TextHeading level={2} className="app-empty-state__title">
        {title}
      </TextHeading>
      {description ? <p className="app-empty-state__description">{description}</p> : null}
      {children}
      {actionLabel && onAction ? (
        <AppButton variant="primary" onClick={onAction} className="app-empty-state__action">
          {actionLabel}
        </AppButton>
      ) : null}
    </div>
  );
}
