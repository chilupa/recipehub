import React, { useState } from "react";
import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonToggle,
} from "@ionic/react";
import { Capacitor } from "@capacitor/core";
import { pulseOutline } from "ionicons/icons";
import {
  getHapticsEnabled,
  setHapticsEnabled,
} from "../../../lib/hapticsSettings";

const ProfilePreferencesSection: React.FC = () => {
  const [hapticsOn, setHapticsOn] = useState(() => getHapticsEnabled());
  const isNative = Capacitor.isNativePlatform();

  return (
    <>
      <p className="profile-section-label">Preferences</p>
      <div className="profile-links">
        <IonList lines="none">
          <IonItem>
            <IonIcon icon={pulseOutline} slot="start" color="primary" />
            <IonLabel>
              <h2>Haptic feedback</h2>
              <p>
                {isNative
                  ? "Short tap when you favorite a recipe"
                  : "Same setting in the iOS or Android app. Web does not vibrate."}
              </p>
            </IonLabel>
            {isNative ? (
              <IonToggle
                slot="end"
                checked={hapticsOn}
                onIonChange={(e) => {
                  const next = e.detail.checked;
                  setHapticsEnabled(next);
                  setHapticsOn(next);
                }}
              />
            ) : null}
          </IonItem>
        </IonList>
      </div>
    </>
  );
};

export default ProfilePreferencesSection;
