import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./SupabaseConfigMissing.css";

const SupabaseConfigMissing: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>RecipeHub</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding supabase-config-missing">
      <h1 className="supabase-config-missing__title">Backend not configured</h1>
      <IonText color="medium">
        <p className="supabase-config-missing__lead">
          Add Supabase env vars to run the app. Create a{" "}
          <code className="supabase-config-missing__code">.env</code> in the
          project root with:
        </p>
      </IonText>
      <pre className="supabase-config-missing__pre" role="region">{`VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>`}</pre>
      <IonText color="medium">
        <p className="supabase-config-missing__hint">
          See README Quick start and SUPABASE_SETUP.md, then restart{" "}
          <code className="supabase-config-missing__code">npm run dev</code>.
        </p>
      </IonText>
    </IonContent>
  </IonPage>
);

export default SupabaseConfigMissing;
