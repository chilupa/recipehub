import { IonBadge } from '@ionic/react';
import type { ReactNode, ReactElement } from 'react';

import './AppBadge.css';

export type AppBadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

export interface AppBadgeProps {
  children: ReactNode;
  color?: AppBadgeColor;
  className?: string;
}

export function AppBadge({ children, color = 'primary', className }: AppBadgeProps): ReactElement {
  const mappedColor = color === 'info' ? 'tertiary' : color;
  return (
    <IonBadge color={mappedColor} className={['app-badge', className].filter(Boolean).join(' ')}>
      {children}
    </IonBadge>
  );
}
