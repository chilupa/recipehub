import { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { sanitizeRedirectPath } from "./loginRedirect";

export function useLoginRedirect(hasUser: boolean) {
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (hasUser) {
      const redirect = new URLSearchParams(location.search).get("redirect");
      history.replace(sanitizeRedirectPath(redirect));
    }
  }, [hasUser, history, location.search]);
}
