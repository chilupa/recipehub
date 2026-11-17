import { updateProfile, type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "./firebase";
import type { User } from "../types/User";

export async function fetchProfile(userId: string) {
  const snap = await getDoc(doc(getFirestoreDb(), "profiles", userId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    display_name: (data.display_name as string | null) ?? null,
    avatar_url: (data.avatar_url as string | null) ?? null,
  };
}

export async function upsertProfile(firebaseUser: FirebaseUser): Promise<void> {
  // Only persist a real Auth display name. Do not invent email-prefix or other
  // seed values while Firestore is still empty / racing email register.
  const authName = firebaseUser.displayName?.trim() || null;
  if (!authName && !firebaseUser.photoURL?.trim()) {
    return;
  }

  const payload: {
    updated_at: string;
    display_name?: string;
    avatar_url?: string | null;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (authName) {
    payload.display_name = authName;
  }
  if (firebaseUser.photoURL?.trim()) {
    payload.avatar_url = firebaseUser.photoURL.trim();
  }

  await setDoc(doc(getFirestoreDb(), "profiles", firebaseUser.uid), payload, {
    merge: true,
  });
}

export async function updateProfileFields(
  userId: string,
  fields: { displayName?: string; avatarUrl?: string | null },
): Promise<void> {
  const payload: {
    updated_at: string;
    display_name?: string;
    avatar_url?: string | null;
  } = {
    updated_at: new Date().toISOString(),
  };
  if (fields.displayName != null) {
    payload.display_name = fields.displayName;
  }
  if (fields.avatarUrl !== undefined) {
    payload.avatar_url = fields.avatarUrl;
  }
  await setDoc(doc(getFirestoreDb(), "profiles", userId), payload, {
    merge: true,
  });
}

/** @deprecated Prefer updateProfileFields */
export async function updateProfileDisplayName(
  userId: string,
  displayName: string,
): Promise<void> {
  await updateProfileFields(userId, { displayName });
}

export async function syncAuthProfile(
  firebaseUser: FirebaseUser,
  fields: { displayName?: string; photoURL?: string | null },
): Promise<void> {
  const next: { displayName?: string; photoURL?: string } = {};
  if (fields.displayName != null) {
    next.displayName = fields.displayName;
  }
  if (fields.photoURL) {
    next.photoURL = fields.photoURL;
  }
  if (Object.keys(next).length === 0) return;
  await updateProfile(firebaseUser, next);
}

export function mapFirebaseUser(
  firebaseUser: FirebaseUser | null,
  profile: { display_name?: string | null; avatar_url?: string | null } | null,
): User | null {
  if (!firebaseUser) return null;
  // Prefer Auth displayName first so an empty/stale Firestore profile cannot
  // hide the name entered at email register.
  const name =
    firebaseUser.displayName?.trim() ||
    profile?.display_name?.trim() ||
    "Chef";
  // Prefer custom Firestore avatar over provider photoURL.
  const avatarUrl =
    profile?.avatar_url?.trim() ||
    firebaseUser.photoURL?.trim() ||
    undefined;
  return {
    id: firebaseUser.uid,
    name,
    email: firebaseUser.email ?? undefined,
    avatarUrl,
    joinedAt: firebaseUser.metadata.creationTime ?? undefined,
  };
}
