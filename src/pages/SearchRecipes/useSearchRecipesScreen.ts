import { useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useSearchRecipesQuery } from "../../hooks/useSearchRecipesQuery";
import { GUEST_VIEWER_ID } from "../../lib/guestBrowse";

export function useSearchRecipesScreen() {
  const { user } = useAuth();
  const viewerId = user?.id ?? GUEST_VIEWER_ID;
  const { showErrorToast } = useToast();

  const onSearchFailed = useCallback(() => {
    showErrorToast("Could not search recipes.");
  }, [showErrorToast]);

  const query = useSearchRecipesQuery({ viewerId, onSearchFailed });

  return {
    ...query,
    showErrorToast,
  };
}
