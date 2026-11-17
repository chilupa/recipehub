import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { deleteAllUserData } from "./recipeFirebase";
import { prepareGoogleSignIn, signOutGoogleNative } from "./firebaseGoogleAuth";
import { signOutAppleNative } from "./firebaseAppleAuth";

function getErrorCode(error: unknown): string {
  if (typeof error === "object" && error && "code" in error) {
    return String((error as { code?: string }).code);
  }
  return "";
}

export function currentUserHasPasswordProvider(): boolean {
  const user = getFirebaseAuth().currentUser;
  return Boolean(
    user?.providerData.some((provider) => provider.providerId === "password"),
  );
}

async function reauthenticateCurrentUser(password?: string): Promise<FirebaseUser> {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    throw new Error("You need to be signed in to delete your account.");
  }

  const providerIds = user.providerData.map((provider) => provider.providerId);

  if (providerIds.includes("password")) {
    const email = user.email?.trim();
    if (!email) {
      throw new Error("Your account has no email on file.");
    }
    if (!password) {
      const error = new Error("Enter your password to confirm account deletion.");
      (error as { code?: string }).code = "auth/requires-recent-login";
      throw error;
    }
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
    return user;
  }

  if (providerIds.includes("google.com")) {
    if (Capacitor.isNativePlatform()) {
      await prepareGoogleSignIn();
      const response = await SocialLogin.login({
        provider: "google",
        options: { scopes: ["email", "profile"] },
      });
      const result = response.result;
      if (!result || result.responseType !== "online" || !result.idToken?.trim()) {
        throw new Error("Google sign-in did not return an ID token.");
      }
      await reauthenticateWithCredential(
        user,
        GoogleAuthProvider.credential(
          result.idToken.trim(),
          result.accessToken?.token ?? undefined,
        ),
      );
      return user;
    }
    await reauthenticateWithPopup(user, new GoogleAuthProvider());
    return user;
  }

  if (providerIds.includes("apple.com")) {
    if (Capacitor.isNativePlatform()) {
      await SocialLogin.initialize({ apple: {} });
      const response = await SocialLogin.login({
        provider: "apple",
        options: { scopes: ["email", "name"] },
      });
      const idToken = response.result?.idToken?.trim();
      if (!idToken) {
        throw new Error("Apple sign-in did not return an ID token.");
      }
      const provider = new OAuthProvider("apple.com");
      await reauthenticateWithCredential(
        user,
        provider.credential({ idToken }),
      );
      return user;
    }
    const provider = new OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
    await reauthenticateWithPopup(user, provider);
    return user;
  }

  throw new Error(
    "Unable to verify your account for deletion. Sign out, sign in again, then retry.",
  );
}

/**
 * Permanently deletes the signed-in Auth user and their Firestore data.
 * May require a recent login; pass `password` for email accounts when prompted.
 */
export async function deleteFirebaseAccount(password?: string): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You are not signed in.");
  }

  const uid = user.uid;

  const runDelete = async () => {
    const freshUser = auth.currentUser;
    if (!freshUser || freshUser.uid !== uid) {
      throw new Error("You are not signed in.");
    }
    await deleteAllUserData(uid);
    await deleteUser(freshUser);
  };

  try {
    if (password) {
      await reauthenticateCurrentUser(password);
    }
    await runDelete();
  } catch (error) {
    if (getErrorCode(error) !== "auth/requires-recent-login") {
      throw error;
    }
    await reauthenticateCurrentUser(password);
    await runDelete();
  }

  await signOutGoogleNative();
  await signOutAppleNative();
}
