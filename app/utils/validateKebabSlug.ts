/** Lowercase Latin, digits, single hyphens between segments (kebab-case). */
const KEBAB_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidKebabSlug(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  return KEBAB_SLUG_RE.test(t);
}
