import { test, expect } from "@playwright/test";

import { FAQ_ITEMS } from "../src/app/faq/_faq-content";

/**
 * Read-only, signed-out. The load case for /faq comes free from the inventory
 * loop in smoke.spec.ts; what this file guards is the thing that silently rots
 * later — the visible copy and the FAQPage JSON-LD drifting apart. Both are
 * generated from `_faq-content.ts`, and both are counted against it here.
 */

test.describe("/faq", () => {
  test("renders every question and its answer in the server HTML", async ({ page }) => {
    const response = await page.goto("/faq", { waitUntil: "domcontentloaded" });
    expect(response?.status(), "/faq HTTP status").toBeLessThan(400);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/frequently asked/i);

    for (const item of FAQ_ITEMS) {
      await expect(
        page.getByRole("heading", { name: item.question, exact: true }),
        `question missing: ${item.id}`,
      ).toBeVisible();

      // Answers ship collapsed, so assert the text is in the server HTML rather
      // than visible — that is what indexing and the JSON-LD parity depend on.
      await expect(
        page.locator(`#${item.id} p`).first(),
        `answer missing from HTML: ${item.id}`,
      ).toHaveText(item.answer);
    }
  });

  test("FAQPage JSON-LD matches the visible content one-for-one", async ({ page }) => {
    await page.goto("/faq", { waitUntil: "domcontentloaded" });

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.length, "no JSON-LD on /faq").toBeGreaterThan(0);

    const faqBlock = blocks
      .map((raw) => JSON.parse(raw) as unknown)
      .flatMap((parsed) => (Array.isArray(parsed) ? parsed : [parsed]))
      .find(
        (entry): entry is { mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }> } =>
          typeof entry === "object" &&
          entry !== null &&
          (entry as { "@type"?: string })["@type"] === "FAQPage",
      );

    expect(faqBlock, "no FAQPage block in the JSON-LD").toBeDefined();
    expect(faqBlock?.mainEntity, "JSON-LD entry count drifted from _faq-content.ts").toHaveLength(
      FAQ_ITEMS.length,
    );

    for (const [index, item] of FAQ_ITEMS.entries()) {
      expect(faqBlock?.mainEntity[index].name, `JSON-LD question ${index}`).toBe(item.question);
      expect(faqBlock?.mainEntity[index].acceptedAnswer.text, `JSON-LD answer ${index}`).toBe(
        item.answer,
      );
    }
  });
});

test("robots.txt and sitemap.xml serve absolute URLs", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status(), "robots.txt status").toBe(200);
  const robotsBody = await robots.text();
  expect(robotsBody).toContain("Sitemap: https://www.escento.com/sitemap.xml");
  expect(robotsBody).toContain("Disallow: /admin");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status(), "sitemap.xml status").toBe(200);
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).toContain("<loc>https://www.escento.com/faq</loc>");
});
