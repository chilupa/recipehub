import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import {
  completeSupabaseOAuthFromUrl,
  getOAuthRedirectUrl,
  looksLikeOAuthCallbackUrl,
} from "../lib/oauthRedirect";
import type { Provider, User as SupabaseUser } from "@supabase/supabase-js";
import { FunctionsHttpError } from "@supabase/supabase-js";
import {
  persistGuestBrowsePreference,
  readGuestBrowsePreference,
} from "../lib/guestBrowse";

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  /** ISO timestamp from Supabase Auth (`user.created_at`). */
  joinedAt?: string;
}

type AuthContextType = {
  user: User | null;
  /** True when the user is browsing without an account (feed preview only). */
  isGuest: boolean;
  isLoading: boolean;
  authError: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  continueWithoutSignIn: () => void;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === "true";
const MOCK_USER_STORAGE_KEY = "recipehub-mock-user";
const defaultMockUser: User = {
  id: "mock-user",
  name: "Demo Chef",
  email: "demo@example.com",
  avatarUrl: undefined,
  joinedAt: "2024-06-01T12:00:00.000Z",
};

const loadMockUser = (): User | null => {
  try {
    const raw = localStorage.getItem(MOCK_USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

const saveMockUser = (u: User) => {
  try {
    localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(u));
  } catch {
    // ignore
  }
};

function formatProviderAuthError(
  error: unknown,
  providerLabel: string,
): string {
  const fallback = `${providerLabel} sign-in failed.`;
  const rawMessage = error instanceof Error ? error.message : "";
  const lowered = rawMessage.toLowerCase();
  if (
    lowered.includes("failed to fetch") ||
    lowered.includes("network") ||
    lowered.includes("dns") ||
    lowered.includes("timed out")
  ) {
    return `Sign-in is temporarily unavailable due to a network or auth provider issue. Please try again shortly, or continue as guest.`;
  }
  return rawMessage || fallback;
}

function mapAuthUser(
  supabaseUser: SupabaseUser | null,
  profile: { display_name?: string | null; avatar_url?: string | null } | null,
): User | null {
  if (!supabaseUser) return null;
  const name =
    profile?.display_name?.trim() ||
    supabaseUser.user_metadata?.full_name?.trim() ||
    supabaseUser.user_metadata?.name?.trim() ||
    supabaseUser.email?.split("@")[0] ||
    "Chef";
  return {
    id: supabaseUser.id,
    name,
    email: supabaseUser.email ?? undefined,
    avatarUrl: profile?.avatar_url ?? supabaseUser.user_metadata?.avatar_url ?? undefined,
    joinedAt: supabaseUser.created_at,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [guestBrowse, setGuestBrowse] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearGuestBrowse = useCallback(() => {
    setGuestBrowse(false);
    persistGuestBrowsePreference(false);
  }, []);

  const continueWithoutSignIn = () => {
    if (useMockAuth) return;
    setGuestBrowse(true);
    persistGuestBrowsePreference(true);
  };

  const fetchProfile = async (userId: string) => {
    if (useMockAuth) return null;
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .single();
    return data;
  };

  const upsertProfile = async (supabaseUser: SupabaseUser) => {
    if (useMockAuth) return;
    const displayName =
      supabaseUser.user_metadata?.full_name?.trim() ||
      supabaseUser.user_metadata?.name?.trim() ||
      supabaseUser.email?.split("@")[0] ||
      null;
    const avatarUrl =
      supabaseUser.user_metadata?.avatar_url?.trim() || null;
    await supabase.from("profiles").upsert(
      {
        id: supabaseUser.id,
        display_name: displayName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  };

  useEffect(() => {
    let mounted = true;

    if (useMockAuth) {
      const mock = loadMockUser() ?? defaultMockUser;
      if (mounted) {
        setUser(mock);
        clearGuestBrowse();
        setIsLoading(false);
      }
      return () => {
        mounted = false;
      };
    }

    const init = async () => {
      try {
        if (isSupabaseConfigured()) {
          try {
            if (typeof window !== "undefined") {
              const href = window.location.href;
              if (looksLikeOAuthCallbackUrl(href)) {
                await completeSupabaseOAuthFromUrl(supabase, href);
                window.history.replaceState(
                  {},
                  document.title,
                  window.location.pathname || "/"
                );
              }
            }
            if (Capacitor.isNativePlatform()) {
              const launch = await App.getLaunchUrl();
              if (launch?.url && looksLikeOAuthCallbackUrl(launch.url)) {
                await completeSupabaseOAuthFromUrl(supabase, launch.url);
                await Browser.close().catch(() => undefined);
              }
            }
          } catch {
            // OAuth callback parse failed; continue with getSession
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) {
          clearGuestBrowse();
          // Show home immediately from JWT metadata; hydrate profile in background.
          setUser(mapAuthUser(session.user, null));
          void (async () => {
            try {
              await upsertProfile(session.user);
              const profileAfter = await fetchProfile(session.user.id);
              if (!mounted) return;
              setUser(mapAuthUser(session.user, profileAfter));
            } catch {
              // keep metadata-based user if profiles/RLS fail
            }
          })();
        } else {
          setUser(null);
          if (mounted && readGuestBrowsePreference()) {
            setGuestBrowse(true);
          }
        }
      } catch {
        if (mounted) {
          setUser(null);
          if (readGuestBrowsePreference()) setGuestBrowse(true);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT") {
        setUser(null);
        clearGuestBrowse();
        return;
      }
      if (session?.user) {
        clearGuestBrowse();
        setUser(mapAuthUser(session.user, null));
        setAuthError(null);
        void (async () => {
          try {
            await upsertProfile(session.user);
            const profile = await fetchProfile(session.user.id);
            if (!mounted) return;
            setUser(mapAuthUser(session.user, profile));
          } catch {
            // keep metadata-based user
          }
        })();
      } else {
        setUser(null);
        if (readGuestBrowsePreference()) setGuestBrowse(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [clearGuestBrowse]);

  useEffect(() => {
    if (useMockAuth || !isSupabaseConfigured()) return;
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;
    let listener: PluginListenerHandle | undefined;

    void (async () => {
      listener = await App.addListener("appUrlOpen", async ({ url }) => {
        if (!looksLikeOAuthCallbackUrl(url)) return;
        try {
          await completeSupabaseOAuthFromUrl(supabase, url);
        } catch {
          // user can retry sign-in
        } finally {
          await Browser.close().catch(() => undefined);
        }
      });
      if (cancelled) {
        void listener.remove();
      }
    })();

    return () => {
      cancelled = true;
      void listener?.remove();
    };
  }, []);

  const loginWithProvider = async (provider: Provider, errorLabel: string) => {
    if (useMockAuth) {
      setIsLoading(true);
      const mock = loadMockUser() ?? defaultMockUser;
      saveMockUser(mock);
      setUser(mock);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    try {
      const redirectTo = getOAuthRedirectUrl();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: Capacitor.isNativePlatform(),
        },
      });
      if (error) throw error;
      if (Capacitor.isNativePlatform() && data?.url) {
        await Browser.open({ url: data.url });
      } else if (!Capacitor.isNativePlatform() && data?.url) {
        window.location.assign(data.url);
      }
    } catch (error) {
      const message = formatProviderAuthError(error, errorLabel);
      setAuthError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    await loginWithProvider("google", "Google");
  };

  const loginWithApple = async () => {
    await loginWithProvider("apple", "Apple");
  };

  const logout = async () => {
    if (useMockAuth) {
      try {
        localStorage.removeItem(MOCK_USER_STORAGE_KEY);
      } catch {
        // ignore
      }
      setUser(null);
      clearGuestBrowse();
      return;
    }

    // Clear UI first so we don’t stay on tabs while sign-out network runs.
    setUser(null);
    clearGuestBrowse();
    await supabase.auth.signOut();
  };

  const deleteAccount = useCallback(async () => {
    if (useMockAuth) {
      try {
        localStorage.removeItem(MOCK_USER_STORAGE_KEY);
      } catch {
        // ignore
      }
      setUser(null);
      clearGuestBrowse();
      return;
    }
    if (!isSupabaseConfigured()) {
      throw new Error("Sign-in is not configured.");
    }
    const { data, error: invokeError } = await supabase.functions.invoke(
      "delete-account",
      { method: "POST" },
    );
    if (invokeError) {
      let message = invokeError.message || "Could not delete account.";
      if (invokeError instanceof FunctionsHttpError) {
        try {
          const body = (await invokeError.context.json()) as {
            error?: string;
          };
          if (body?.error) message = body.error;
        } catch {
          // response body wasn’t JSON
        }
      }
      throw new Error(message);
    }
    if (
      data &&
      typeof data === "object" &&
      "error" in data &&
      (data as { error?: string }).error
    ) {
      throw new Error(String((data as { error: string }).error));
    }
    setUser(null);
    clearGuestBrowse();
    try {
      await supabase.auth.signOut();
    } catch {
      // Session may already be invalid after user deletion.
    }
  }, [clearGuestBrowse]);

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, ...updates } : null));

    if (useMockAuth) {
      const updated = { ...user, ...updates };
      saveMockUser(updated);
      return;
    }

    const { id } = user;
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: updates.name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  };

  const isGuest = Boolean(!user && guestBrowse);

  const value = useMemo(
    () => ({
      user,
      isGuest,
      isLoading,
      authError,
      loginWithGoogle,
      loginWithApple,
      continueWithoutSignIn,
      logout,
      deleteAccount,
      updateUser,
    }),
    [user, isGuest, isLoading, authError, deleteAccount]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
