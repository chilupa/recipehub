import React, { useState } from "react";
import { IonApp, setupIonicReact } from "@ionic/react";
import { RecipeProvider } from "../contexts/RecipeContext";
import { RecentlyViewedProvider } from "../contexts/RecentlyViewedContext";
import { ShoppingListProvider } from "../contexts/ShoppingListContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { ToastProvider } from "../contexts/ToastContext";
import { AuthProvider } from "../contexts/AuthContext";
import { Intro, hasSeenIntro } from "../features/auth";
import { AppRouter } from "../navigation";
import ErrorBoundary from "../components/ErrorBoundary";
import OfflineBanner from "../components/OfflineBanner";
import FirebaseConfigMissing from "../components/FirebaseConfigMissing";
import { AppLoading } from "../design-system";
import { useAppBootstrap } from "../hooks";
import { isBackendConfigured } from "../lib/appConfig";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.class.css";

import "../design-system/tokens/index.css";
import "../design-system/theme/ionic-overrides.css";
import "../design-system/theme/global.scss";
import "../theme/variables.css";

setupIonicReact({
  swipeBackEnabled: true,
});

const App: React.FC = () => {
  const { ready } = useAppBootstrap();
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro());

  if (!ready) {
    return (
      <IonApp>
        <AppLoading fullscreen message="Starting app…" />
      </IonApp>
    );
  }

  if (showIntro) {
    return (
      <IonApp key="intro">
        <Intro onComplete={() => setShowIntro(false)} />
      </IonApp>
    );
  }

  if (!isBackendConfigured()) {
    return (
      <IonApp key="main">
        <FirebaseConfigMissing />
      </IonApp>
    );
  }

  return (
    <IonApp key="main">
      <ToastProvider>
        <OfflineBanner />
        <AuthProvider>
          <RecipeProvider>
            <RecentlyViewedProvider>
              <ShoppingListProvider>
                <NotificationProvider>
                  <ErrorBoundary>
                    <AppRouter />
                  </ErrorBoundary>
                </NotificationProvider>
              </ShoppingListProvider>
            </RecentlyViewedProvider>
          </RecipeProvider>
        </AuthProvider>
      </ToastProvider>
    </IonApp>
  );
};

export default App;
