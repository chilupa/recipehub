import type { ReactElement, ReactNode } from "react";

import { TextHeading } from "../TextHeading";

import "./PageIntro.css";

export interface PageIntroProps {
  title: string;
  description: string;
  /** Optional trailing control (e.g. Mark all read). */
  endAction?: ReactNode;
}

export function PageIntro({
  title,
  description,
  endAction,
}: PageIntroProps): ReactElement {
  return (
    <header className="page-intro">
      <div className="page-intro__copy">
        <TextHeading level={1} className="page-hero-title">
          {title}
        </TextHeading>
        <p className="section-subtitle page-intro__description">
          {description}
        </p>
      </div>
      {endAction ? (
        <div className="page-intro__action">{endAction}</div>
      ) : null}
    </header>
  );
}
