import React from "react";
import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet, IonTabs } from "@ionic/react";
import { useAuth } from "./contexts/AuthContext";
import Tabs from "./components/Tabs";
import SignedInTabRoutes from "./routes/SignedInTabRoutes";
import GuestTabRoutes from "./routes/GuestTabRoutes";
import AuthLoadingScreen from "./components/AuthLoadingScreen";
import UnauthenticatedRoutes from "./routes/UnauthenticatedRoutes";

const AppRoutes: React.FC = () => {
  const { user, isGuest, isLoading } = useAuth();
  const canUseApp = Boolean(user || isGuest);

  return (
    <IonReactRouter>
      {isLoading ? (
        <AuthLoadingScreen />
      ) : !canUseApp ? (
        <UnauthenticatedRoutes />
      ) : (
        <IonTabs>
          <IonRouterOutlet>
            {user ? <SignedInTabRoutes /> : <GuestTabRoutes />}
          </IonRouterOutlet>
          <Tabs />
        </IonTabs>
      )}
    </IonReactRouter>
  );
};

export default AppRoutes;
