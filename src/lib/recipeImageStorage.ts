import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { compressImageToJpeg } from "./imageCompress";
import { devWarn } from "./devLog";
import { getFirebaseStorage } from "./firebase";

export const RECIPE_IMAGES_BUCKET = "recipe-images";

/** Feed/detail covers stay sharp enough while staying in the low-hundreds KB. */
const COVER_MAX_BYTES = 250 * 1024;
const COVER_MAX_EDGE = 1280;

export function recipeCoverStoragePath(userId: string, recipeId: string): string {
  return `${RECIPE_IMAGES_BUCKET}/${userId}/${recipeId}.jpg`;
}

/** Resize and JPEG-encode covers before Firebase Storage upload. */
export async function prepareRecipeCoverBlob(file: File): Promise<Blob> {
  return compressImageToJpeg(file, {
    maxEdge: COVER_MAX_EDGE,
    maxBytes: COVER_MAX_BYTES,
    quality: 0.8,
    minQuality: 0.45,
    minEdge: 640,
  });
}

export async function uploadRecipeCover(
  userId: string,
  recipeId: string,
  file: File,
): Promise<string> {
  const body = await prepareRecipeCoverBlob(file);
  const path = recipeCoverStoragePath(userId, recipeId);
  const storageRef = ref(getFirebaseStorage(), path);
  await uploadBytes(storageRef, body, { contentType: "image/jpeg" });
  return getDownloadURL(storageRef);
}

export async function deleteRecipeCoverObject(
  userId: string,
  recipeId: string,
): Promise<void> {
  const path = recipeCoverStoragePath(userId, recipeId);
  try {
    await deleteObject(ref(getFirebaseStorage(), path));
  } catch (error) {
    devWarn("deleteRecipeCoverObject:", error);
  }
}
