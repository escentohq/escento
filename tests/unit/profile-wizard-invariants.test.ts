import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("profile identity write invariant", () => {
  const source = readFileSync(
    join(process.cwd(), "src", "app", "profile", "create", "identity", "actions.ts"),
    "utf8",
  );

  it("updates an existing profile and only creates when none exists", () => {
    expect(source).toMatch(
      /const profile = existing\s*\?\s*await updateProfile\(existing\.id,[\s\S]*:\s*await createProfile\(/,
    );
  });

  it("resolves the next destination from the saved profile", () => {
    expect(source).toContain("resolveMusicianProfileNavigation(profile).href");
    expect(source).not.toContain('redirect("/musicians")');
  });
});
