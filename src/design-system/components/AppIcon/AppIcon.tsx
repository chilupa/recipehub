import { IonIcon } from '@ionic/react';
import type { CSSProperties, ReactElement } from 'react';

import { getIcon, iconSizes, type IconName, type IconSize } from '../../icons/iconRegistry';

export interface AppIconProps {
  name: IconName;
  size?: IconSize | number | string;
  color?: string;
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
  'aria-label'?: string;
}

export function AppIcon({
  name,
  size = 'md',
  color,
  className,
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
}: AppIconProps): ReactElement {
  const resolvedSize =
    typeof size === 'string' && size in iconSizes ? iconSizes[size as IconSize] : size;

  const style: CSSProperties = {
    fontSize: resolvedSize,
    color,
  };

  const classes = ['app-icon', className].filter(Boolean).join(' ');

  return (
    <IonIcon
      icon={getIcon(name)}
      style={style}
      className={classes}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
    />
  );
}
