import { IonAvatar } from '@ionic/react';
import type { ReactElement } from 'react';

import './AppAvatar.css';

export type AppAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AppAvatarProps {
  name: string;
  src?: string;
  size?: AppAvatarSize;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function AppAvatar({ name, src, size = 'md', className }: AppAvatarProps): ReactElement {
  const classes = ['app-avatar', `app-avatar--${size}`, className].filter(Boolean).join(' ');

  return (
    <IonAvatar className={classes} aria-label={name}>
      {src ? (
        <img src={src} alt={name} />
      ) : (
        <span className="app-avatar__initials" aria-hidden="true">
          {getInitials(name)}
        </span>
      )}
    </IonAvatar>
  );
}
