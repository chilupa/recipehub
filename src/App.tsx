import React, { useState } from "react";
import { IonApp, setupIonicReact } from "@ionic/react";
import { RecipeProvider } from "./contexts/RecipeContext";
import { RecentlyViewedProvider } from "./contexts/RecentlyViewedContext";
import { ShoppingListProvider } from "./contexts/ShoppingListContext";
import { NotificationProvider } from "./contexts/NotificationContext";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS required for Ionic components */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode — see https://ionicframework.com/docs/theming/dark-mode
 */
import "@ionic/react/css/palettes/dark.system.css";

import "./theme/variables.css";
import { AuthProvider } from "./contexts/AuthContext";
import Intro, { hasSeenIntro } from "./pages/Intro";
import AppRoutes from "./AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineBanner from "./components/OfflineBanner";
import SupabaseConfigMissing from "./components/SupabaseConfigMissing";
import { isSupabaseConfigured } from "./lib/supabase";

setupIonicReact({
  /** Edge swipe to go back (iOS mode / native; improves stack depth tracking). */
  swipeBackEnabled: true,
});

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro());

  if (showIntro) {
    return (
      <IonApp key="intro">
        <Intro onComplete={() => setShowIntro(false)} />
      </IonApp>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <IonApp key="main">
        <SupabaseConfigMissing />
      </IonApp>
    );
  }

  return (
    <IonApp key="main">
      <OfflineBanner />
      <AuthProvider>
        <RecipeProvider>
          <RecentlyViewedProvider>
            <ShoppingListProvider>
              <NotificationProvider>
                <ErrorBoundary>
                  <AppRoutes />
                </ErrorBoundary>
              </NotificationProvider>
            </ShoppingListProvider>
          </RecentlyViewedProvider>
        </RecipeProvider>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
