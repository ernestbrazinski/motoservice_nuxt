/** Латиница, цифры, дефисы (kebab-case), не с дефиса. */
const KEBAB_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidKebabSlug(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  return KEBAB_SLUG_RE.test(t);
}

export function kebabSlugHint(): string {
  return "Латинские буквы и цифры, через дефис, например oil-filters (kebab-case).";
}
