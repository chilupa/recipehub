import { IonToast } from '@ionic/react';
import type { ReactElement } from 'react';

import './AppToast.css';

export type AppToastColor = 'primary' | 'success' | 'warning' | 'danger' | 'medium';

export interface AppToastProps {
  isOpen: boolean;
  message: string;
  duration?: number;
  color?: AppToastColor;
  position?: 'top' | 'middle' | 'bottom';
  onDidDismiss: () => void;
}

export function AppToast({
  isOpen,
  message,
  duration = 2500,
  color = 'primary',
  position = 'bottom',
  onDidDismiss,
}: AppToastProps): ReactElement {
  return (
    <IonToast
      className="app-toast"
      isOpen={isOpen}
      message={message}
      duration={duration}
      color={color}
      position={position}
      onDidDismiss={onDidDismiss}
      buttons={[{ text: 'Dismiss', role: 'cancel' }]}
    />
  );
}
