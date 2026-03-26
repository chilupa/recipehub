export function isShareWebHost(): boolean {
  if (typeof window === "undefined") return false;
  const rawBase = (import.meta.env.VITE_SHARE_WEB_BASE_URL ?? "").trim();
  if (!rawBase) return false;
  try {
    const baseOrigin = new URL(rawBase).origin;
    return window.location.origin === baseOrigin;
  } catch {
    return false;
  }
}

