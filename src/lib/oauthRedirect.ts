import { Capacitor } from "@capacitor/core";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Custom scheme redirect for native builds. Must be listed in Supabase
 * Authentication → URL configuration → Redirect URLs, and handled by the
 * Android/iOS app (intent filter / URL scheme).
 */
const DEFAULT_NATIVE_REDIRECT = "recipehub://login-callback";

export function getOAuthRedirectUrl(): string {
  if (Capacitor.isNativePlatform()) {
    const fromEnv = import.meta.env.VITE_NATIVE_AUTH_REDIRECT_URL?.trim();
    return fromEnv || DEFAULT_NATIVE_REDIRECT;
  }
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

export function looksLikeOAuthCallbackUrl(url: string): boolean {
  return (
    url.includes("code=") ||
    url.includes("access_token=") ||
    (url.includes("error=") && url.includes("error_description="))
  );
}

/**
 * Finishes Supabase OAuth when the app receives the redirect (WebView URL,
 * deep link, or cold-start launch URL).
 */
export async function completeSupabaseOAuthFromUrl(
  client: SupabaseClient,
  url: string
): Promise<void> {
  if (!looksLikeOAuthCallbackUrl(url)) return;

  const queryIdx = url.indexOf("?");
  const hashIdx = url.indexOf("#");
  const queryEnd = hashIdx >= 0 ? hashIdx : undefined;
  const query = queryIdx >= 0 ? url.slice(queryIdx + 1, queryEnd) : "";
  const queryParams = new URLSearchParams(query);
  const authCode = queryParams.get("code");

  if (authCode) {
    const { error } = await client.auth.exchangeCodeForSession(authCode);
    if (error) throw error;
    return;
  }

  if (hashIdx < 0) return;
  const hash = url.slice(hashIdx + 1);
  const fragmentQuestionIdx = hash.indexOf("?");
  const fragment = fragmentQuestionIdx >= 0 ? hash.slice(0, fragmentQuestionIdx) : hash;

  const params = new URLSearchParams(fragment);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (access_token && refresh_token) {
    const { error } = await client.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;
  }
}
