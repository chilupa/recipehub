import React, { useState } from "react";
import { IonToggle } from "@ionic/react";
import { Capacitor } from "@capacitor/core";

import { AppListItem, TextHeading } from "../../../../design-system";
import {
  getHapticsEnabled,
  setHapticsEnabled,
} from "../../../../lib/hapticsSettings";

const ProfilePreferencesSection: React.FC = () => {
  const [hapticsOn, setHapticsOn] = useState(() => getHapticsEnabled());
  const isNative = Capacitor.isNativePlatform();

  return (
    <section className="stack profile-section">
      <TextHeading level={2} className="section-label">
        Preferences
      </TextHeading>
      <div className="profile-links">
        <AppListItem
          title="Haptic feedback"
          subtitle={
            isNative
              ? "Short tap when you favorite a recipe"
              : "Same setting in the iOS or Android app. Web does not vibrate."
          }
          leadingIcon="pulseOutline"
          detail={false}
          lines="none"
          trailing={
            isNative ? (
              <IonToggle
                checked={hapticsOn}
                aria-label="Haptic feedback"
                onIonChange={(e) => {
                  const next = e.detail.checked;
                  setHapticsEnabled(next);
                  setHapticsOn(next);
                }}
              />
            ) : null
          }
        />
      </div>
    </section>
  );
};

export default ProfilePreferencesSection;
