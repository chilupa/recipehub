import { IonAlert } from '@ionic/react';
import type { ReactElement } from 'react';

import './AppConfirm.css';

export interface AppConfirmProps {
  isOpen: boolean;
  /** Optional alert header. Omit for message-only confirms. */
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  /** Hide the cancel button for a simple OK alert. */
  hideCancel?: boolean;
  /** Styles the confirm action as destructive (e.g. delete). */
  destructive?: boolean;
  backdropDismiss?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  onDidDismiss: () => void;
}

export function AppConfirm({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  hideCancel = false,
  destructive = false,
  backdropDismiss = true,
  onConfirm,
  onCancel,
  onDidDismiss,
}: AppConfirmProps): ReactElement {
  const buttons = [
    ...(hideCancel
      ? []
      : [
          {
            text: cancelText,
            role: 'cancel' as const,
            handler: () => {
              onCancel?.();
            },
          },
        ]),
    {
      text: confirmText,
      role: destructive ? ('destructive' as const) : undefined,
      handler: () => {
        onConfirm();
      },
    },
  ];

  return (
    <IonAlert
      className="app-confirm"
      isOpen={isOpen}
      header={title || undefined}
      message={message}
      buttons={buttons}
      backdropDismiss={backdropDismiss}
      onDidDismiss={onDidDismiss}
    />
  );
}
