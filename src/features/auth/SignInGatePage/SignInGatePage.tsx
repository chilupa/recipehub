import React, { useEffect, useRef, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";

import { AppConfirm } from "../../../design-system";

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
      <AppConfirm
        isOpen={open}
        onDidDismiss={() => {
          setOpen(false);
          if (skipFallbackNav.current) {
            skipFallbackNav.current = false;
            return;
          }
          history.replace("/recipes");
        }}
        title="Keep going"
        message="It only takes a moment to sign in."
        cancelText="Not now"
        confirmText="Sign in"
        onCancel={() => {
          history.replace("/recipes");
        }}
        onConfirm={() => {
          skipFallbackNav.current = true;
          history.replace("/login");
        }}
      />
    </IonPage>
  );
};

export default SignInGatePage;
