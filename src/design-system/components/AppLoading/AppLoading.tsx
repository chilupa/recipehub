import { IonSpinner } from '@ionic/react';
import type { ReactElement } from 'react';

import './AppLoading.css';

export interface AppLoadingProps {
  message?: string;
  fullscreen?: boolean;
}

export function AppLoading({
  message = 'Loading…',
  fullscreen = false,
}: AppLoadingProps): ReactElement {
  return (
    <div
      className={fullscreen ? 'app-loading app-loading--fullscreen' : 'app-loading'}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <IonSpinner name="crescent" color="primary" />
      {message ? <p className="app-loading__message">{message}</p> : null}
    </div>
  );
}
