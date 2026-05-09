const shareWebBaseUrl = (import.meta.env.VITE_SHARE_WEB_BASE_URL ?? "").trim();
export const appDownloadUrl = (import.meta.env.VITE_APP_DOWNLOAD_URL ?? "").trim();

export function getRecipeShareUrl(recipeId: string): string {
  if (shareWebBaseUrl) {
    const base = shareWebBaseUrl.replace(/\/+$/, "");
    return `${base}/recipes/recipe/${encodeURIComponent(recipeId)}`;
  }
  if (appDownloadUrl) return appDownloadUrl;
  return window.location.href;
}
