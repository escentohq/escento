import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * The disallow list mirrors the `protected`/`admin` entries in
 * `e2e/route-inventory.ts`. None of those render for a signed-out crawler
 * anyway — they redirect to /signin — so keeping them out of the crawl budget
 * costs nothing and stops a redirect chain from being indexed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/admin",
        "/api",
        "/messages",
        "/onboarding",
        "/profile",
        "/reports",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
