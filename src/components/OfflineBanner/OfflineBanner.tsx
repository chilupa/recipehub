import React, { useEffect, useState } from "react";
import { IonIcon, IonText } from "@ionic/react";
import { cloudOfflineOutline } from "ionicons/icons";
import "./OfflineBanner.css";

/**
 * Sticky notice when the browser reports offline. aria-live so assistive tech
 * announces connectivity changes.
 */
const OfflineBanner: React.FC = () => {
  const [offline, setOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );

  useEffect(() => {
    const onOff = () => setOffline(!navigator.onLine);
    window.addEventListener("online", onOff);
    window.addEventListener("offline", onOff);
    return () => {
      window.removeEventListener("online", onOff);
      window.removeEventListener("offline", onOff);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="offline-banner"
      role="status"
      aria-live="polite"
      aria-relevant="additions text"
    >
      <IonIcon icon={cloudOfflineOutline} className="offline-banner__icon" />
      <IonText>You are offline. Check your connection and try again.</IonText>
    </div>
  );
};

export default OfflineBanner;
