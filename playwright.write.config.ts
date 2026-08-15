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
// Workers need the same verified-local credentials for focused RLS/admin setup.
// The hosted-project guard above runs before these values are exposed to tests.
Object.assign(process.env, supabaseEnv);
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);
// Local fast-iteration escape hatch: when PLAYWRIGHT_BASE_URL is set, target an
// already-running server instead of building+starting a fresh one. CI never
// sets this, so CI always gets a clean managed server.
const externalTarget = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./e2e/flows",
  // Shared local DB — keep runs serial and deterministic.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  // No retries in CI. A retry turns a first-attempt failure into a green run and
  // buries the flake in the log — the suite is supposed to tell us the moment
  // something stops working, so a test that does not pass on its first attempt
  // is a failure. Flakes get fixed, not re-rolled.
  retries: 0,
  // Stop the shard on the first failure instead of spending another ten minutes
  // proving the rest still passes. The report and trace for that one failure are
  // what anybody debugging actually reads.
  maxFailures: isCI ? 1 : 0,
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: externalTarget ?? baseURL,
    // There is no retry to trace any more, so keep the trace of the failure
    // itself. Only failures produce one, so this costs nothing on a green run.
    trace: "retain-on-failure",
    // The app's Reveal animations slide cards in on scroll; under load that can
    // leave buttons "not stable" for Playwright. Reduced motion (which the app
    // honours via useReducedMotion) makes them appear instantly and stably.
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(externalTarget
    ? {}
    : {
        webServer: {
          // A fresh production build + start on a dedicated port (never 3000) so a
          // running `next dev` against cloud Supabase can never be reused by accident.
          //
          // E2E_PREBUILT skips the build for a caller that already ran one against
          // this same stack — CI builds in its own step so the build is separately
          // timed and shared with nothing else. Locally the default still rebuilds,
          // because a stale .next is a far worse failure mode than a slow run.
          command: process.env.E2E_PREBUILT
            ? `npx next start -p ${PORT}`
            : `npm run build && npx next start -p ${PORT}`,
          url: baseURL,
          reuseExistingServer: false,
          // Generous for a cold `next build` plus start on a loaded CI runner or
          // developer machine. With a prebuilt app there is nothing to compile, so
          // a slow start means something is actually wrong — fail fast instead.
          timeout: process.env.E2E_PREBUILT ? 120_000 : 600_000,
          env: {
            ...supabaseEnv,
            NEXT_PUBLIC_APP_URL: baseURL,
            // Non-secret placeholders so server boot never crashes on missing envs.
            ADMIN_EMAILS: "admin@example.test",
            SUPPORT_EMAIL: "support@example.test",
            ESCENTO_SUPPORT_ACCOUNT_EMAIL: "support@example.test",
            SUPPORT_FROM_EMAIL: "Escento Support <support@example.test>",
            GEOAPIFY_API_KEY: "placeholder",
          },
        },
      }),
});
