import { capitalizeFirstLetter } from "./capitalizeFirstLetter";

/** Capitalize the first letter of a tag for display. */
export function formatTagLabel(tag: string): string {
  const trimmed = tag.trim();
  if (!trimmed) return "";
  return capitalizeFirstLetter(trimmed);
}
