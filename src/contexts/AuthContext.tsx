import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirebaseAuth, getFirebaseIdToken, isFirebaseConfigured } from "../lib/firebase";
import { signInWithGoogle, signOutGoogleNative } from "../lib/firebaseGoogleAuth";
import {
  signInWithApple as signInWithAppleFirebase,
  signOutAppleNative,
} from "../lib/firebaseAppleAuth";
import {
  getAuthErrorMessage,
  registerWithEmail as registerWithEmailFirebase,
  sendPasswordReset as sendPasswordResetFirebase,
  signInWithEmail,
} from "../lib/firebaseEmailAuth";
import {
  fetchProfile,
  mapFirebaseUser,
  syncAuthProfile,
  updateProfileFields,
  upsertProfile,
} from "../lib/authProfile";
import { uploadProfileAvatar } from "../lib/profileAvatarStorage";
import { deleteFirebaseAccount } from "../lib/deleteFirebaseAccount";
import {
  persistGuestBrowsePreference,
  readGuestBrowsePreference,
} from "../lib/guestBrowse";
import { isBackendConfigured } from "../lib/appConfig";

import type { User } from "../types/User";

export type { User };

type AuthContextType = {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  authError: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  continueWithoutSignIn: () => void;
  logout: () => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  updateUser: (
    updates: Partial<User> & { avatarFile?: File | null },
  ) => Promise<{ name?: string; avatarUrl?: string } | void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

async function hydrateUserFromFirebase(
  mounted: () => boolean,
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
) {
  let firebaseUser = getFirebaseAuth().currentUser;
  if (!firebaseUser || !mounted()) return;

  // Use Auth user immediately. Do not seed/upsert Firestore profiles here;
  // register/OAuth flows write the profile only when there is a real name.
  setUser(mapFirebaseUser(firebaseUser, null));
  try {
    await getFirebaseIdToken(true);
    firebaseUser = getFirebaseAuth().currentUser;
    if (!firebaseUser || !mounted()) return;
    const profile = await fetchProfile(firebaseUser.uid);
    if (!mounted()) return;
    setUser(mapFirebaseUser(firebaseUser, profile));
  } catch {
    // keep Auth metadata if profile read fails
  }
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
    setGuestBrowse(true);
    persistGuestBrowsePreference(true);
  };

  useEffect(() => {
    if (!isBackendConfigured()) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    const isMounted = () => mounted;

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
      if (!mounted) return;
      if (firebaseUser) {
        clearGuestBrowse();
        setAuthError(null);
        void hydrateUserFromFirebase(isMounted, setUser);
      } else {
        setUser(null);
        if (readGuestBrowsePreference()) setGuestBrowse(true);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [clearGuestBrowse]);

  const runProviderSignIn = async (
    action: () => Promise<unknown>,
    providerLabel: string,
  ) => {
    if (!isFirebaseConfigured()) {
      setAuthError("Sign-in is not configured.");
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
      await action();
      await getFirebaseIdToken(true);
    } catch (error) {
      setAuthError(formatProviderAuthError(error, providerLabel));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    await runProviderSignIn(signInWithGoogle, "Google");
  };

  const loginWithApple = async () => {
    await runProviderSignIn(signInWithAppleFirebase, "Apple");
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Sign-in is not configured.");
    }
    setAuthError(null);
    try {
      await signInWithEmail(email, password);
      await getFirebaseIdToken(true);
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const registerWithEmail = async (
    name: string,
    email: string,
    password: string,
  ) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Sign-in is not configured.");
    }
    setAuthError(null);
    try {
      // createUser fires onAuthStateChanged before displayName is set; sync
      // profile again after registerWithEmailFirebase finishes updateProfile.
      const firebaseUser = await registerWithEmailFirebase(
        name,
        email,
        password,
      );
      await upsertProfile(firebaseUser);
      const profile = await fetchProfile(firebaseUser.uid);
      setUser(mapFirebaseUser(firebaseUser, profile));
      await getFirebaseIdToken(true);
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const sendPasswordReset = async (email: string) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Sign-in is not configured.");
    }
    setAuthError(null);
    try {
      await sendPasswordResetFirebase(email);
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    setUser(null);
    clearGuestBrowse();
    await signOutGoogleNative();
    await signOutAppleNative();
    await signOut(getFirebaseAuth());
  };

  const deleteAccount = useCallback(
    async (password?: string) => {
      if (!isBackendConfigured()) {
        throw new Error("Sign-in is not configured.");
      }
      await deleteFirebaseAccount(password);
      setUser(null);
      clearGuestBrowse();
    },
    [clearGuestBrowse],
  );

  const updateUser = async (
    updates: Partial<User> & { avatarFile?: File | null },
  ) => {
    if (!user) return;
    const { avatarFile, ...rest } = updates;
    let nextAvatarUrl = rest.avatarUrl;

    if (avatarFile) {
      nextAvatarUrl = await uploadProfileAvatar(user.id, avatarFile);
    }

    const authUser = getFirebaseAuth().currentUser;
    if (authUser) {
      let authPhotoURL = nextAvatarUrl;
      if (authPhotoURL) {
        try {
          const parsed = new URL(authPhotoURL);
          parsed.searchParams.delete("v");
          authPhotoURL = parsed.toString();
        } catch {
          // Keep original URL if it is not parseable.
        }
      }
      await syncAuthProfile(authUser, {
        displayName: rest.name,
        photoURL: authPhotoURL,
      });
    }

    await updateProfileFields(user.id, {
      displayName: rest.name,
      avatarUrl: nextAvatarUrl,
    });

    setUser((prev) =>
      prev
        ? {
            ...prev,
            ...rest,
            ...(nextAvatarUrl !== undefined
              ? { avatarUrl: nextAvatarUrl }
              : {}),
          }
        : null,
    );

    return {
      name: rest.name,
      avatarUrl: nextAvatarUrl,
    };
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
      loginWithEmail,
      registerWithEmail,
      sendPasswordReset,
      continueWithoutSignIn,
      logout,
      deleteAccount,
      updateUser,
    }),
    [user, isGuest, isLoading, authError, deleteAccount],
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
