import React from "react";
import { AppBanner } from "../../design-system";
import { useNetworkStatus } from "../../hooks";
import "./OfflineBanner.css";


/**
 * Sticky notice when the device reports offline.
 */
const OfflineBanner: React.FC = () => {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <div className="offline-banner-wrap" role="status" aria-live="polite">
      <AppBanner
        title="You are offline"
        message="Check your connection and try again."
        tone="warning"
      />
    </div>
  );
};

export default OfflineBanner;
