import React, { useEffect, useRef, useState } from "react";
import { IonAlert, IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";

/**
 * Shown when a guest hits a route that requires an account (other tabs, filters, add, etc.).
 */
const SignInGatePage: React.FC = () => {
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const skipFallbackNav = useRef(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <IonPage>
      <IonContent />
      <IonAlert
        isOpen={open}
        onDidDismiss={() => {
          setOpen(false);
          if (skipFallbackNav.current) {
            skipFallbackNav.current = false;
            return;
          }
          history.replace("/recipes");
        }}
        header="Keep going"
        message="It only takes a moment to sign in."
        buttons={[
          {
            text: "Not now",
            role: "cancel",
            handler: () => {
              history.replace("/recipes");
              return true;
            },
          },
          {
            text: "Sign in",
            handler: () => {
              skipFallbackNav.current = true;
              history.replace("/login");
              return true;
            },
          },
        ]}
      />
    </IonPage>
  );
};

export default SignInGatePage;
