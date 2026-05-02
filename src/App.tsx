import React, { useState } from "react";
import { IonApp, setupIonicReact } from "@ionic/react";
import { RecipeProvider } from "./contexts/RecipeContext";
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

setupIonicReact();

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro());

  if (showIntro) {
    return (
      <IonApp key="intro">
        <Intro onComplete={() => setShowIntro(false)} />
      </IonApp>
    );
  }

  return (
    <IonApp key="main">
      <AuthProvider>
        <RecipeProvider>
          <ShoppingListProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </ShoppingListProvider>
        </RecipeProvider>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
