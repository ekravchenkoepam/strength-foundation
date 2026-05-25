const BLOCKED_SLUG_ROUTES = new Set<string>();

const BLOCKED_SUBSLUG_ROUTES = new Set(['uk/about/contacts', 'en/about/contacts']);

export const isBlockedSlugRoute = (locale: string, slug: string): boolean =>
  BLOCKED_SLUG_ROUTES.has(`${locale}/${slug}`);

export const isBlockedSubSlugRoute = (locale: string, slug: string, subSlug: string): boolean =>
  BLOCKED_SUBSLUG_ROUTES.has(`${locale}/${slug}/${subSlug}`);
