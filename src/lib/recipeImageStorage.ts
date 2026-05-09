import { devWarn } from "./devLog";
import { supabase } from "./supabase";

export const RECIPE_IMAGES_BUCKET = "recipe-images";

export function recipeCoverStoragePath(userId: string, recipeId: string): string {
  return `${userId}/${recipeId}.jpg`;
}

export function publicUrlForRecipeCover(path: string): string {
  const { data } = supabase.storage
    .from(RECIPE_IMAGES_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

async function blobToJpeg(blob: Blob, maxWidth: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  try {
    let { width, height } = bitmap;
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return blob;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const out = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
    });
    return out ?? blob;
  } finally {
    bitmap.close();
  }
}

/** Resize wide photos and normalize to JPEG for a predictable storage path. */
export async function prepareRecipeCoverBlob(file: File): Promise<Blob> {
  try {
    return await blobToJpeg(file, 1600, 0.88);
  } catch {
    return file;
  }
}

export async function uploadRecipeCover(
  userId: string,
  recipeId: string,
  file: File,
): Promise<string> {
  const body = await prepareRecipeCoverBlob(file);
  const path = recipeCoverStoragePath(userId, recipeId);
  const { error } = await supabase.storage
    .from(RECIPE_IMAGES_BUCKET)
    .upload(path, body, {
      contentType: "image/jpeg",
      upsert: true,
    });
  if (error) throw error;
  return publicUrlForRecipeCover(path);
}

export async function deleteRecipeCoverObject(
  userId: string,
  recipeId: string,
): Promise<void> {
  const path = recipeCoverStoragePath(userId, recipeId);
  const { error } = await supabase.storage
    .from(RECIPE_IMAGES_BUCKET)
    .remove([path]);
  if (error) devWarn("deleteRecipeCoverObject:", error);
}
