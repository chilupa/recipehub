import { IonItem, IonLabel } from '@ionic/react';
import type { ReactNode, ReactElement } from 'react';

import type { IconName } from '../../icons/iconRegistry';
import { AppIcon } from '../AppIcon';

import './AppListItem.css';

export interface AppListItemProps {
  title: string;
  subtitle?: string;
  leadingIcon?: IconName;
  trailing?: ReactNode;
  href?: string;
  routerLink?: string;
  onClick?: () => void;
  detail?: boolean;
  lines?: 'full' | 'inset' | 'none';
  className?: string;
}

export function AppListItem({
  title,
  subtitle,
  leadingIcon,
  trailing,
  href,
  routerLink,
  onClick,
  detail = Boolean(href || routerLink || onClick),
  lines = 'full',
  className,
}: AppListItemProps): ReactElement {
  return (
    <IonItem
      className={['app-list-item', className].filter(Boolean).join(' ')}
      lines={lines}
      detail={detail}
      href={href}
      routerLink={routerLink}
      button={Boolean(href || routerLink || onClick)}
      onClick={onClick}
    >
      {leadingIcon ? (
        <span slot="start" className="app-list-item__leading">
          <AppIcon name={leadingIcon} size="md" />
        </span>
      ) : null}
      <IonLabel>
        {/* Use div/span — Ionic ::slotted(p) forces muted text color */}
        <div className="app-list-item__title">{title}</div>
        {subtitle ? <div className="app-list-item__subtitle">{subtitle}</div> : null}
      </IonLabel>
      {trailing ? (
        <span slot="end" className="app-list-item__trailing">
          {trailing}
        </span>
      ) : null}
    </IonItem>
  );
}
