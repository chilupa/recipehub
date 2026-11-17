import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

const webClientId = (import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ?? "").trim();
const iosClientId = (import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID ?? "").trim();

export function isGoogleSignInConfigured(): boolean {
  return Boolean(webClientId);
}

let initPromise: Promise<void> | null = null;

export async function prepareGoogleSignIn(): Promise<void> {
  if (!Capacitor.isNativePlatform() || !isGoogleSignInConfigured()) return;
  if (!initPromise) {
    initPromise = SocialLogin.initialize({
      google: {
        webClientId,
        ...(iosClientId ? { iOSClientId: iosClientId } : {}),
        mode: "online",
      },
    }).then(() => undefined);
  }
  await initPromise;
}

async function signInWithGoogleNative(): Promise<UserCredential> {
  await prepareGoogleSignIn();
  const response = await SocialLogin.login({
    provider: "google",
    options: {
      scopes: ["email", "profile"],
    },
  });

  const result = response.result;
  if (!result || result.responseType !== "online") {
    throw new Error("Google sign-in did not return an online session.");
  }

  const idToken = result.idToken?.trim();
  if (!idToken) {
    throw new Error("Google sign-in did not return an ID token.");
  }

  const credential = GoogleAuthProvider.credential(
    idToken,
    result.accessToken?.token ?? undefined,
  );
  return signInWithCredential(getFirebaseAuth(), credential);
}

async function signInWithGoogleWeb(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  return signInWithPopup(getFirebaseAuth(), provider);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  if (!isGoogleSignInConfigured()) {
    throw new Error("Google sign-in is not configured.");
  }
  if (Capacitor.isNativePlatform()) {
    return signInWithGoogleNative();
  }
  return signInWithGoogleWeb();
}

export async function signOutGoogleNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await SocialLogin.logout({ provider: "google" }).catch(() => undefined);
}
