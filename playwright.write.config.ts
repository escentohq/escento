import { execSync } from "node:child_process";

import { defineConfig, devices } from "@playwright/test";

/**
 * Write-flow E2E suite — runs the real signup / onboarding / profile / gig /
 * messaging flows against an EPHEMERAL LOCAL Supabase stack (`supabase start`).
 *
 * Credentials are resolved in this order:
 *   1. Already present in the environment (CI injects them from `supabase
 *      status` into $GITHUB_ENV before invoking Playwright).
 *   2. Discovered on demand via `supabase status -o env` so locally a developer
 *      only has to run `supabase start` first.
 *
 * A hard safety guard refuses to run if the resolved Supabase URL points at a
 * hosted project (*.supabase.co). These tests create and mutate data and must
 * NEVER touch a cloud/production database.
 */
function parseEnvBlock(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)="?([^"]*)"?$/);
    if (match) out[match[1]] = match[2];
  }
  return out;
}

function resolveLocalSupabaseEnv(): Record<string, string> {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!url || !anonKey || !serviceKey) {
    try {
      const status = parseEnvBlock(execSync("supabase status -o env", { encoding: "utf8" }));
      url = url || status.API_URL || "";
      anonKey = anonKey || status.ANON_KEY || "";
      serviceKey = serviceKey || status.SERVICE_ROLE_KEY || "";
    } catch {
      throw new Error(
        "Could not resolve local Supabase credentials. Start the stack first:\n" +
          "  supabase start   (Docker Desktop must be running)\n" +
          "then re-run: npm run test:e2e:write",
      );
    }
  }

  if (!url || !anonKey || !serviceKey) {
    throw new Error("Local Supabase credentials are incomplete. Run `supabase start` and retry.");
  }

  if (/\.supabase\.co/i.test(url)) {
    throw new Error(
      `Refusing to run write-flow E2E against a hosted Supabase project (${url}).\n` +
        "These tests create and mutate data and must only run against a local/ephemeral stack.",
    );
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  };
}

const supabaseEnv = resolveLocalSupabaseEnv();
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e/flows",
  // Shared local DB — keep runs serial and deterministic.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // A fresh production build + start on a dedicated port (never 3000) so a
    // running `next dev` against cloud Supabase can never be reused by accident.
    command: `npm run build && npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      ...supabaseEnv,
      NEXT_PUBLIC_APP_URL: baseURL,
      // Non-secret placeholders so server boot never crashes on missing envs.
      ADMIN_EMAILS: "admin@example.test",
      SUPPORT_EMAIL: "support@example.test",
      ESCENTO_SUPPORT_ACCOUNT_EMAIL: "support@example.test",
      RESEND_API_KEY: "re_placeholder",
      SUPPORT_FROM_EMAIL: "Escento Support <support@example.test>",
      GEOAPIFY_API_KEY: "placeholder",
    },
  },
});
