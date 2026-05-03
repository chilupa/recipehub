export function sanitizeRedirectPath(value: string | null): string {
  if (!value) return "/recipes";
  // Only allow in-app relative paths.
  if (!value.startsWith("/") || value.startsWith("//")) return "/recipes";
  if (value.startsWith("/login")) return "/recipes";
  return value;
}
