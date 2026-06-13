import { defineConfig, devices } from "@playwright/test";

/**
 * Read-only smoke suite.
 *
 * Targets a deployed URL via PLAYWRIGHT_BASE_URL (the Vercel preview/prod URL in
 * CI) and never authenticates or writes — so it is safe to run against the real
 * Supabase-backed deployment. When PLAYWRIGHT_BASE_URL is not set it builds and
 * starts the app locally for developer convenience.
 *
 * Write flows live in a separate config (playwright.write.config.ts) that runs
 * against an ephemeral local Supabase stack.
 */
const isCI = Boolean(process.env.CI);
const externalTarget = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalTarget ?? "http://localhost:3000";

// Future-proof: if a Vercel Deployment Protection bypass secret is ever
// configured (Pro plan), forward it so smoke can reach gated previews. No-op on
// the current Hobby plan where previews are public.
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /smoke\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    extraHTTPHeaders: bypass
      ? { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" }
      : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Only spin up a local server when we are not pointed at a deployed URL.
  ...(externalTarget
    ? {}
    : {
        webServer: {
          command: "npm run build && npm run start",
          url: "http://localhost:3000",
          reuseExistingServer: !isCI,
          timeout: 300_000,
        },
      }),
});
