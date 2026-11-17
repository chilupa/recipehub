import type { ReactNode, ReactElement } from 'react';

export type TextHeadingLevel = 1 | 2 | 3;

export interface TextHeadingProps {
  level: TextHeadingLevel;
  className?: string;
  id?: string;
  children: ReactNode;
}

/**
 * Typography-based heading for screen readers without using h1–h6
 * (avoids Ionic typography.css size overrides).
 */
export function TextHeading({
  level,
  className,
  id,
  children,
}: TextHeadingProps): ReactElement {
  return (
    <p id={id} className={className} role="heading" aria-level={level}>
      {children}
    </p>
  );
}
