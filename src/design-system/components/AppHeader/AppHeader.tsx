import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import type { ReactNode, ReactElement } from "react";
import { useHistory } from "react-router-dom";

import { AppButton } from "../AppButton";
import { AppIcon } from "../AppIcon";

import "./AppHeader.css";

export type AppHeaderVariant = "standard" | "transparent";

export interface AppHeaderProps {
  /** Omit on stack pages that only show a back control. Defaults to RecipeHub on tab roots. */
  title?: string;
  showBack?: boolean;
  /** @deprecated Prefer showBack; kept for RecipeHub call sites during migration. */
  showBackButton?: boolean;
  backHref?: string;
  onBack?: () => void;
  endActions?: ReactNode;
  variant?: AppHeaderVariant;
}

export function AppHeader({
  title,
  showBack,
  showBackButton,
  backHref = "/recipes",
  onBack,
  endActions,
  variant = "standard",
}: AppHeaderProps): ReactElement {
  const history = useHistory();
  const backEnabled = showBack ?? showBackButton ?? false;

  const resolvedTitle =
    title !== undefined ? title : backEnabled ? undefined : "RecipeHub";

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    history.goBack();
  };

  return (
    <IonHeader
      className={`app-header app-header--${variant}`}
      translucent={variant === "transparent"}
    >
      <IonToolbar
        color={variant === "standard" ? "primary" : undefined}
        className={`app-header__toolbar app-header__toolbar--${variant}`}
      >
        {backEnabled ? (
          <IonButtons slot="start">
            {onBack ? (
              <AppButton
                variant="text"
                aria-label="Go back"
                onClick={handleBack}
                className="app-header__back"
              >
                <AppIcon name="arrowBackOutline" size="md" />
              </AppButton>
            ) : (
              <IonBackButton defaultHref={backHref} />
            )}
          </IonButtons>
        ) : null}
        {resolvedTitle != null && resolvedTitle !== "" ? (
          <IonTitle className="app-header__title" role="heading" aria-level={1}>
            {resolvedTitle}
          </IonTitle>
        ) : null}
        {endActions ? <IonButtons slot="end">{endActions}</IonButtons> : null}
      </IonToolbar>
    </IonHeader>
  );
}
