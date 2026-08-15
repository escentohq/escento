import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Unit layer. Seconds, not minutes — it runs alongside lint/typecheck in the
 * `quality` CI job, not alongside Playwright.
 *
 * Scope: pure logic and repo invariants only. Anything that needs a browser or a
 * database belongs in `e2e/` (read-only smoke) or `e2e/flows/` (write flows).
 */
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    reporters: process.env.CI ? ["dot"] : ["default"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
