import { IonContent, IonHeader, IonModal, IonTitle, IonToolbar, IonButtons } from '@ionic/react';
import type { ReactNode, ReactElement } from 'react';

import { AppButton } from '../AppButton';
import { AppIcon } from '../AppIcon';

import './AppModal.css';

export type AppModalSize = 'sm' | 'md' | 'lg' | 'fullscreen';

export interface AppModalProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  title?: string;
  children: ReactNode;
  /** Used for sheet sizes (sm/md/lg). Ignored for fullscreen — use close/confirm instead. */
  footer?: ReactNode;
  size?: AppModalSize;
  presentingElement?: HTMLElement | undefined;
  backdropDismiss?: boolean;
  /** Sheet sizes only: show the trailing X control. */
  showClose?: boolean;
  /** Fullscreen: leading dismiss label. Defaults to Close. */
  closeText?: string;
  /** Fullscreen: trailing confirm label. Defaults to Confirm. */
  confirmText?: string;
  /** Fullscreen: trailing confirm action. */
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
}

const sizeClassMap: Record<AppModalSize, string> = {
  sm: 'app-modal--sm',
  md: 'app-modal--md',
  lg: 'app-modal--lg',
  fullscreen: 'app-modal--fullscreen',
};

export function AppModal({
  isOpen,
  onDidDismiss,
  title,
  children,
  footer,
  size = 'md',
  presentingElement,
  backdropDismiss = true,
  showClose = true,
  closeText = 'Close',
  confirmText = 'Confirm',
  onConfirm,
  confirmDisabled = false,
  confirmLoading = false,
}: AppModalProps): ReactElement {
  const isFullscreen = size === 'fullscreen';

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onDidDismiss}
      backdropDismiss={backdropDismiss}
      className={`app-modal ${sizeClassMap[size]}`}
      // Card presentation fights a true full-page modal.
      presentingElement={isFullscreen ? undefined : presentingElement}
    >
      {title || isFullscreen ? (
        <IonHeader>
          <IonToolbar color="primary" className="app-modal__toolbar">
            {isFullscreen ? (
              <IonButtons slot="start">
                <AppButton variant="text" color="light" onClick={onDidDismiss}>
                  {closeText}
                </AppButton>
              </IonButtons>
            ) : null}
            {title ? (
              <IonTitle className="app-modal__title" role="heading" aria-level={2}>
                {title}
              </IonTitle>
            ) : null}
            {isFullscreen ? (
              onConfirm ? (
                <IonButtons slot="end">
                  <AppButton
                    variant="text"
                    color="light"
                    disabled={confirmDisabled}
                    loading={confirmLoading}
                    onClick={onConfirm}
                  >
                    {confirmText}
                  </AppButton>
                </IonButtons>
              ) : null
            ) : showClose ? (
              <IonButtons slot="end">
                <AppButton
                  variant="text"
                  color="light"
                  aria-label="Close modal"
                  onClick={onDidDismiss}
                >
                  <AppIcon name="closeOutline" />
                </AppButton>
              </IonButtons>
            ) : null}
          </IonToolbar>
        </IonHeader>
      ) : null}
      <IonContent className="app-modal__content">{children}</IonContent>
      {!isFullscreen && footer ? <div className="app-modal__footer">{footer}</div> : null}
    </IonModal>
  );
}
