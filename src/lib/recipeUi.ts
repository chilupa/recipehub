/** Shorten recipe title for compact UI (e.g. delete confirmation). */
export function truncateRecipeTitleForDisplay(title: string | undefined): string {
  const name = title?.trim() || "this recipe";
  return name.length > 50 ? `${name.slice(0, 47)}…` : name;
}

/** Like counts on cards (e.g. 1.2k, 3.4m). */
export function formatCompactFavoriteCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}
