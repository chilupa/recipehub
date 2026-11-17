import { IonCard, IonCardContent, IonCardHeader } from '@ionic/react';
import type { ReactNode, ReactElement } from 'react';

import { TextHeading } from '../TextHeading';

import './AppCard.css';

export type AppCardVariant = 'standard' | 'outlined' | 'elevated';

export interface AppCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  variant?: AppCardVariant;
  className?: string;
  onClick?: () => void;
}

export function AppCard({
  children,
  title,
  subtitle,
  variant = 'standard',
  className,
  onClick,
}: AppCardProps): ReactElement {
  const classes = ['app-card', `app-card--${variant}`, className].filter(Boolean).join(' ');
  const interactive = Boolean(onClick);

  return (
    <IonCard
      className={classes}
      button={interactive}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
    >
      {title || subtitle ? (
        <IonCardHeader>
          {title ? (
            <TextHeading level={3} className="app-card__title">
              {title}
            </TextHeading>
          ) : null}
          {subtitle ? <p className="app-card__subtitle">{subtitle}</p> : null}
        </IonCardHeader>
      ) : null}
      <IonCardContent className="app-card__content">{children}</IonCardContent>
    </IonCard>
  );
}
