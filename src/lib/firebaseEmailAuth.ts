import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";

class AuthConfigError extends Error {
  constructor() {
    super("Sign-in is not configured.");
    this.name = "AuthConfigError";
  }
}

function requireAuth() {
  if (!isFirebaseConfigured()) {
    throw new AuthConfigError();
  }
  return getFirebaseAuth();
}

function getErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const instance = requireAuth();
  await setPersistence(instance, browserLocalPersistence);
  const result = await signInWithEmailAndPassword(
    instance,
    email.trim(),
    password,
  );
  return result.user;
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const instance = requireAuth();
  const displayName = name.trim();
  const result = await createUserWithEmailAndPassword(
    instance,
    email.trim(),
    password,
  );
  await updateProfile(result.user, { displayName });
  await result.user.reload();
  return instance.currentUser ?? result.user;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const instance = requireAuth();
  await sendPasswordResetEmail(instance, email.trim());
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthConfigError) {
    return error.message;
  }
  const code = getErrorCode(error);

  switch (code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/weak-password":
      return "Choose a stronger password (at least 8 characters).";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/requires-recent-login":
      return "For security, confirm your sign-in again, then delete your account.";
    default:
      return error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
  }
}
