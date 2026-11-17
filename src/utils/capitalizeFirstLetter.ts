/** Capitalize the first non-space character; leave the rest as typed. */
export function capitalizeFirstLetter(value: string): string {
  if (!value) return value;
  const match = /^(\s*)([\s\S]*)$/.exec(value);
  if (!match) return value;
  const [, lead, rest] = match;
  if (!rest) return value;
  return lead + rest.charAt(0).toLocaleUpperCase() + rest.slice(1);
}

/** Capitalize the first letter of each line (for ingredients / steps). */
export function capitalizeLines(value: string): string {
  return value
    .split(/(\n)/)
    .map((part) => (part === "\n" ? part : capitalizeFirstLetter(part)))
    .join("");
}
