import { useCallback, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useSearchRecipesQuery } from "../../hooks/useSearchRecipesQuery";
import { GUEST_VIEWER_ID } from "../../lib/guestBrowse";

export function useSearchRecipesScreen() {
  const { user } = useAuth();
  const viewerId = user?.id ?? GUEST_VIEWER_ID;
  const [toast, setToast] = useState({ show: false, message: "" });

  const onSearchFailed = useCallback(() => {
    setToast({ show: true, message: "Could not search recipes." });
  }, []);

  const query = useSearchRecipesQuery({ viewerId, onSearchFailed });

  return {
    ...query,
    toast,
    dismissToast: () =>
      setToast((current) => ({ ...current, show: false })),
  };
}
