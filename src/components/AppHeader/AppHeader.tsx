import React from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from "@ionic/react";

import "./AppHeader.css";

interface AppHeaderProps {
  /** Omit on stack pages that only show a back control (title in content). Pass for tag search, errors, etc. */
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = false,
  backHref = "/recipes",
}) => {
  /** Tab roots default to RecipeHub; stack pages with back omit title unless `title` is passed. */
  const resolvedTitle =
    title !== undefined
      ? title
      : showBackButton
        ? undefined
        : "RecipeHub";

  return (
    <IonHeader>
      <IonToolbar color="primary" className="app-header-toolbar">
        {showBackButton ? (
          <IonButtons slot="start">
            <IonBackButton defaultHref={backHref} />
          </IonButtons>
        ) : null}
        {resolvedTitle != null && resolvedTitle !== "" ? (
          <IonTitle className="app-header-title">{resolvedTitle}</IonTitle>
        ) : null}
      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader;
