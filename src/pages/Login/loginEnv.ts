export const showSigninStatusBannerFromEnv =
  String(import.meta.env.VITE_SHOW_SIGNIN_STATUS_BANNER ?? "").toLowerCase() ===
  "true";
