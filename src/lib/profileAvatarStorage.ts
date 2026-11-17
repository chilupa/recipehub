import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { compressImageToJpeg } from "./imageCompress";
import { devWarn } from "./devLog";
import { getFirebaseStorage } from "./firebase";

export const PROFILE_AVATARS_BUCKET = "profile-avatars";

/** Keep avatars small for fast tab/profile loads (~under 100KB). */
const AVATAR_MAX_BYTES = 100 * 1024;
const AVATAR_MAX_EDGE = 512;

export function profileAvatarStoragePath(userId: string): string {
  return `${PROFILE_AVATARS_BUCKET}/${userId}.jpg`;
}

export async function prepareProfileAvatarBlob(file: File): Promise<Blob> {
  return compressImageToJpeg(file, {
    maxEdge: AVATAR_MAX_EDGE,
    maxBytes: AVATAR_MAX_BYTES,
    quality: 0.72,
  });
}

export async function uploadProfileAvatar(
  userId: string,
  file: File,
): Promise<string> {
  const body = await prepareProfileAvatarBlob(file);
  const path = profileAvatarStoragePath(userId);
  const storageRef = ref(getFirebaseStorage(), path);
  await uploadBytes(storageRef, body, { contentType: "image/jpeg" });
  // Same storage path is overwritten; bust browser/CDN cache on the stored URL.
  const url = await getDownloadURL(storageRef);
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${Date.now()}`;
}

export async function deleteProfileAvatarObject(userId: string): Promise<void> {
  const path = profileAvatarStoragePath(userId);
  try {
    await deleteObject(ref(getFirebaseStorage(), path));
  } catch (error) {
    devWarn("deleteProfileAvatarObject:", error);
  }
}
