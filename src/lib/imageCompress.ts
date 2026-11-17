/**
 * Resize and JPEG-encode an image blob. Used for recipe covers and profile avatars.
 */
export async function blobToJpeg(
  blob: Blob,
  maxEdge: number,
  quality: number,
): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  try {
    let { width, height } = bitmap;
    const longest = Math.max(width, height);
    if (longest > maxEdge) {
      const scale = maxEdge / longest;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
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

export type CompressImageOptions = {
  /** Longest edge in px. */
  maxEdge?: number;
  /** Target max file size in bytes. */
  maxBytes?: number;
  /** Starting JPEG quality (0–1). */
  quality?: number;
  /** Lowest JPEG quality while shrinking (0–1). */
  minQuality?: number;
  /** Smallest longest-edge while shrinking. */
  minEdge?: number;
};

/**
 * Compress an image down toward maxBytes.
 * Steps quality down, then edge size, until under the budget when possible.
 */
export async function compressImageToJpeg(
  file: Blob,
  options: CompressImageOptions = {},
): Promise<Blob> {
  const maxBytes = options.maxBytes ?? 100 * 1024;
  const minQuality = options.minQuality ?? 0.4;
  const minEdge = options.minEdge ?? 256;
  let maxEdge = options.maxEdge ?? 512;
  let quality = options.quality ?? 0.72;

  try {
    let blob = await blobToJpeg(file, maxEdge, quality);

    while (blob.size > maxBytes && quality > minQuality) {
      quality = Math.max(minQuality, quality - 0.08);
      blob = await blobToJpeg(file, maxEdge, quality);
    }

    while (blob.size > maxBytes && maxEdge > minEdge) {
      maxEdge = Math.max(minEdge, Math.round(maxEdge * 0.75));
      blob = await blobToJpeg(file, maxEdge, quality);
    }

    return blob;
  } catch {
    return file;
  }
}
