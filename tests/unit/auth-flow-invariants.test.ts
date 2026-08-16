import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("post-auth latency invariants", () => {
  const callback = readSource("src/app/auth/callback/route.ts");
  const signIn = readSource("src/app/signin/actions.ts");
  const signUp = readSource("src/app/signup/actions.ts");

  it("uses the session exchange user without a second auth lookup", () => {
    expect(callback).toContain("exchangeCodeForSession");
    expect(callback).not.toContain("auth.getUser()");
  });

  it("defers welcome messages until after the response", () => {
    for (const source of [callback, signIn, signUp]) {
      expect(source).toMatch(/after\(\(\) =>\s*sendWelcomeMessageFromEscentoBestEffort/);
      expect(source).not.toMatch(/await sendWelcomeMessageFromEscentoBestEffort/);
    }
  });

  it("sends password sign-ins without a role to onboarding", () => {
    expect(signIn).toMatch(/select\("role"\)/);
    expect(signIn).toContain('redirect("/onboarding/role")');
  });
});

describe("auth user profile trigger invariant", () => {
  const migrationsDir = join(process.cwd(), "supabase", "migrations");
  const sql = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .map((file) => readFileSync(join(migrationsDir, file), "utf8"))
    .join("\n");

  it("creates an app_user row after each auth user insert", () => {
    expect(sql).toContain("on_auth_user_created");
    expect(sql).toMatch(/AFTER INSERT ON auth\.users/i);
    expect(sql).toMatch(/EXECUTE FUNCTION public\.handle_new_user\(\)/i);
  });

  it("copies either supported Google avatar metadata field", () => {
    expect(sql).toMatch(/COALESCE\(\s*NEW\.raw_user_meta_data->>'avatar_url',\s*NEW\.raw_user_meta_data->>'picture'/i);
  });
});
