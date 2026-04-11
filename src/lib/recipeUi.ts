/** Shorten recipe title for compact UI (e.g. delete confirmation). */
export function truncateRecipeTitleForDisplay(title: string | undefined): string {
  const name = title?.trim() || "this recipe";
  return name.length > 50 ? `${name.slice(0, 47)}…` : name;
}
