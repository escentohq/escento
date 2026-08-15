/**
 * Single source of the public origin and the default site description.
 *
 * Four places need the domain — root metadata, the Organization/WebSite JSON-LD,
 * `sitemap.ts`, and `robots.ts` — and a sitemap that disagrees with the canonical
 * tag is worse than no sitemap. It is a constant rather than an env var because
 * the production origin is fixed and every consumer is build-time static; reading
 * it from the environment would make a missing var silently emit relative URLs.
 */
export const SITE_URL = "https://www.escento.com";

export const SITE_DESCRIPTION =
  "Escento helps musicians get discovered for gigs, collaborations, and creative opportunities.";
