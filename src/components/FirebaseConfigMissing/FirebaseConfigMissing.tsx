import React from "react";
import { IonContent, IonPage } from "@ionic/react";

import { AppHeader, TextHeading } from "../../design-system";

import "./FirebaseConfigMissing.css";

const FirebaseConfigMissing: React.FC = () => (
  <IonPage>
    <AppHeader title="RecipeHub" />
    <IonContent className="ion-padding firebase-config-missing">
      <TextHeading level={1} className="page-hero-title">
        Firebase not configured
      </TextHeading>
      <p className="firebase-config-missing__lead text-body2">
        Add Firebase env vars to run the app. Create a{" "}
        <code className="firebase-config-missing__code">.env</code> in the
        project root with:
      </p>
      <pre
        className="firebase-config-missing__pre"
        role="region"
      >{`VITE_FIREBASE_API_KEY=<api-key>
VITE_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project-id>
VITE_FIREBASE_STORAGE_BUCKET=<project-id>.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
VITE_FIREBASE_APP_ID=<app-id>
VITE_GOOGLE_WEB_CLIENT_ID=<web-client-id>.apps.googleusercontent.com`}</pre>
      <p className="firebase-config-missing__hint text-body2">
        See FIREBASE_SETUP.md, then restart{" "}
        <code className="firebase-config-missing__code">npm run dev</code>.
      </p>
    </IonContent>
  </IonPage>
);

export default FirebaseConfigMissing;
