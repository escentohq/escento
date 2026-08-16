import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Issue #69. `supabase/parity_check.sql` is the operator gate that proves the
 * hosted database matches `supabase/migrations/`, because
 * `.github/workflows/schema-drift.yml` cannot run without a `SUPABASE_DB_URL`
 * secret that does not exist.
 *
 * A hand-maintained checklist rots the moment someone adds a migration and
 * forgets it — and a parity check that silently stops covering the newest
 * migration is worse than none, because it reports PASS. This test is what
 * stops that: the migration list inside the SQL file has to match the migration
 * files on disk, exactly, in both directions.
 */

const ROOT = process.cwd();
const MIGRATIONS_DIR = path.join(ROOT, "supabase/migrations");
const PARITY_CHECK = path.join(ROOT, "supabase/parity_check.sql");

/** `20260816130000_fix_transactional_write_grants.sql` -> version + name. */
function migrationsOnDisk(): { version: string; name: string }[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => {
      const base = file.replace(/\.sql$/, "");
      const separator = base.indexOf("_");
      return { version: base.slice(0, separator), name: base.slice(separator + 1) };
    });
}

/** The `expected_migrations` VALUES list inside the parity check. */
function migrationsInParityCheck(sql: string): { version: string; name: string }[] {
  const block = sql.match(/expected_migrations\(version, name\) as \(\s*values([\s\S]*?)\n\)/i);
  if (!block) throw new Error("parity_check.sql has no expected_migrations VALUES block");
  return [...block[1].matchAll(/\('(\d+)','([a-z0-9_]+)'\)/g)].map((match) => ({
    version: match[1],
    name: match[2],
  }));
}

describe("hosted parity check (#69)", () => {
  const sql = readFileSync(PARITY_CHECK, "utf8");
  const onDisk = migrationsOnDisk();
  const declared = migrationsInParityCheck(sql);

  it("lists every migration file, and only those", () => {
    expect(declared).toEqual(onDisk);
  });

  it("is read-only, so it is safe to run against production", () => {
    // The whole point is that an operator can paste this into the SQL editor of
    // a live database without thinking about it.
    const mutating =
      /^\s*(insert|update|delete|drop|alter|truncate|grant|revoke|create)\b/gim;
    const statements = sql
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");
    expect(statements.match(mutating) ?? []).toEqual([]);
  });

  it("covers the regressions it was written for", () => {
    for (const marker of ["#59", "#68"]) {
      expect(sql, `parity_check.sql no longer mentions ${marker}`).toContain(marker);
    }
  });
});
