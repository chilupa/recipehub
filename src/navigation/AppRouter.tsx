import type { ReactElement } from "react";
import { IonReactRouter } from "@ionic/react-router";

import { useAuth } from "../contexts/AuthContext";
import AuthLoadingScreen from "../components/AuthLoadingScreen";
import UnauthenticatedRoutes from "../routes/UnauthenticatedRoutes";
import { useAndroidBackButton } from "../hooks";
import { TabNavigation } from "./TabNavigation";

function RouterEffects(): null {
  useAndroidBackButton();
  return null;
}

export function AppRouter(): ReactElement {
  const { user, isGuest, isLoading } = useAuth();
  const canUseApp = Boolean(user || isGuest);

  return (
    <IonReactRouter>
      <RouterEffects />
      {isLoading ? (
        <AuthLoadingScreen />
      ) : !canUseApp ? (
        <UnauthenticatedRoutes />
      ) : (
        <TabNavigation />
      )}
    </IonReactRouter>
  );
}
