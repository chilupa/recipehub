import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";
import {
  OAuthProvider,
  signInWithCredential,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

export async function signInWithApple(): Promise<UserCredential> {
  if (Capacitor.isNativePlatform()) {
    return signInWithAppleNative();
  }
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  return signInWithPopup(getFirebaseAuth(), provider);
}

async function signInWithAppleNative(): Promise<UserCredential> {
  await SocialLogin.initialize({ apple: {} });
  const response = await SocialLogin.login({
    provider: "apple",
    options: {
      scopes: ["email", "name"],
    },
  });

  const result = response.result;
  const idToken = result.idToken?.trim();
  if (!idToken) {
    throw new Error("Apple sign-in did not return an ID token.");
  }

  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({ idToken });
  return signInWithCredential(getFirebaseAuth(), credential);
}

export async function signOutAppleNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await SocialLogin.logout({ provider: "apple" }).catch(() => undefined);
}
