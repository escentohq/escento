import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Issue #68. `20260816120000_lock_app_user_self_update.sql` narrowed the
 * authenticated column grants on `musician_profile` and `gig`, which was
 * correct, and simultaneously broke all four transactional write RPCs, which
 * was not noticed for a full release cycle.
 *
 * Nothing in the fast lane could have caught it: the RPC bodies live in one
 * migration and the grants that authorise them live in another, and only a real
 * Postgres session ties the two together. The write-flow suite does tie them
 * together, but it is manual and takes thirteen minutes.
 *
 * So this file re-derives the same contract statically. It replays the grant
 * statements in migration order to get the effective column privileges for
 * `authenticated`, extracts the columns each RPC actually writes, and asserts
 * the second is a subset of the first. It also pins the two specific mistakes
 * that caused the outage, so neither can come back quietly:
 *
 *   - a bare `INSERT INTO t SELECT ...` has an implicit target of every column
 *     in the table, so it demands privileges the product deliberately withholds;
 *   - the privileged columns must stay ungranted, so a future fix cannot make
 *     the RPCs work by widening the grant instead of narrowing the write.
 */

const ROOT = process.cwd();
const MIGRATIONS_DIR = path.join(ROOT, "supabase/migrations");

const GUARDED_TABLES = ["musician_profile", "gig"] as const;
type GuardedTable = (typeof GUARDED_TABLES)[number];

/**
 * Columns issue #59 exists to keep away from a signed-in client. The RPCs set
 * none of them; the table defaults produce the same values.
 */
const PRIVILEGED_COLUMNS: Record<GuardedTable, string[]> = {
  musician_profile: ["is_public", "is_verified", "moderation_status", "admin_notes"],
  gig: ["is_public", "is_verified", "moderation_status", "admin_notes"],
};

function migrationFiles(): { name: string; sql: string }[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => ({ name, sql: readFileSync(path.join(MIGRATIONS_DIR, name), "utf8") }));
}

/** All migrations concatenated in apply order — the effective schema. */
const ALL_SQL = migrationFiles()
  .map((file) => file.sql)
  .join("\n");

function splitColumnList(raw: string): string[] {
  return raw
    .split(",")
    .map((part) => part.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

/**
 * Replay every GRANT/REVOKE touching a table in migration order and return the
 * columns `authenticated` may write. A `REVOKE ALL` resets the accumulated set,
 * which is exactly what 20260816120000 does before re-granting.
 */
function effectiveGrants(table: GuardedTable): { insert: Set<string>; update: Set<string> } {
  const insert = new Set<string>();
  const update = new Set<string>();
  const quoted = `(?:"?public"?\\.)?"?${table}"?`;

  for (const { sql } of migrationFiles()) {
    const statements = sql.split(";");
    for (const statement of statements) {
      const revoke = new RegExp(
        `REVOKE\\s+ALL\\s+ON\\s+(?:TABLE\\s+)?${quoted}\\s+FROM\\b[^;]*\\bauthenticated\\b`,
        "is",
      );
      if (revoke.test(statement)) {
        insert.clear();
        update.clear();
        continue;
      }

      // `GRANT ALL` / `GRANT INSERT` with no column list covers every column.
      const wholeTable = new RegExp(
        `GRANT\\s+(ALL|INSERT|UPDATE)\\s*(?:PRIVILEGES\\s*)?ON\\s+(?:TABLE\\s+)?${quoted}\\s+TO\\b[^;]*\\bauthenticated\\b`,
        "is",
      );
      const wholeMatch = statement.match(wholeTable);
      if (wholeMatch) {
        const kind = wholeMatch[1].toUpperCase();
        if (kind === "ALL" || kind === "INSERT") insert.add("*");
        if (kind === "ALL" || kind === "UPDATE") update.add("*");
        continue;
      }

      const columnGrant = new RegExp(
        `GRANT\\s+(INSERT|UPDATE)\\s*\\(([^)]*)\\)\\s*ON\\s+(?:TABLE\\s+)?${quoted}\\s+TO\\b[^;]*\\bauthenticated\\b`,
        "gis",
      );
      for (const match of statement.matchAll(columnGrant)) {
        const target = match[1].toUpperCase() === "INSERT" ? insert : update;
        for (const column of splitColumnList(match[2])) target.add(column);
      }
    }
  }

  return { insert, update };
}

/**
 * The four transactional write RPCs and the table each one owns.
 *
 * Every one of them is redefined by a later migration, so only the last
 * definition describes the running database. Superseded bodies stay in history
 * on purpose and must not be asserted against — the broken `SELECT ...*` form
 * is still sitting in 20260816010000 and 20260816020000, where it is inert.
 */
const WRITE_RPCS: { name: string; table: GuardedTable }[] = [
  { name: "create_musician_profile_with_tags", table: "musician_profile" },
  { name: "update_musician_profile_with_tags", table: "musician_profile" },
  { name: "create_gig_with_tags", table: "gig" },
  { name: "update_gig_with_tags", table: "gig" },
];

/** The body of the last `CREATE OR REPLACE FUNCTION` for a given RPC. */
function latestDefinition(rpc: string): string {
  const pattern = new RegExp(
    `CREATE OR REPLACE FUNCTION\\s+"?public"?\\."?${rpc}"?[\\s\\S]*?\\$\\$;`,
    "gi",
  );
  const matches = [...ALL_SQL.matchAll(pattern)];
  if (matches.length === 0) throw new Error(`no definition found for ${rpc}`);
  return matches[matches.length - 1][0];
}

/** Columns each `INSERT INTO public.<table> (...) VALUES (...)` writes. */
function insertedColumns(sql: string, table: GuardedTable): string[][] {
  const pattern = new RegExp(
    `INSERT\\s+INTO\\s+public\\.${table}\\s*\\(([^)]*)\\)\\s*VALUES`,
    "gis",
  );
  return [...sql.matchAll(pattern)].map((match) => splitColumnList(match[1]));
}

/** Columns each `UPDATE public.<table> SET ...` writes. */
function updatedColumns(sql: string, table: GuardedTable): string[][] {
  const pattern = new RegExp(`UPDATE\\s+public\\.${table}\\s+SET\\b([\\s\\S]*?)\\bWHERE\\b`, "gis");
  return [...sql.matchAll(pattern)].map((match) =>
    match[1]
      .split(",")
      .map((assignment) => assignment.trim().split("=")[0].trim().replace(/^"|"$/g, ""))
      .filter((column) => /^[a-z_][a-z0-9_]*$/.test(column)),
  );
}

describe("transactional write grant contract (#68)", () => {
  for (const table of GUARDED_TABLES) {
    const grants = effectiveGrants(table);

    it(`grants authenticated a narrowed column list on ${table}`, () => {
      expect(grants.insert.has("*"), `${table} still carries a table-wide INSERT grant`).toBe(false);
      expect(grants.update.has("*"), `${table} still carries a table-wide UPDATE grant`).toBe(false);
      expect(grants.insert.size).toBeGreaterThan(0);
      expect(grants.update.size).toBeGreaterThan(0);
    });

    it(`keeps privileged ${table} columns away from authenticated (#59)`, () => {
      for (const column of PRIVILEGED_COLUMNS[table]) {
        expect(
          grants.insert.has(column),
          `${table}.${column} is INSERT-granted to authenticated; #68 must be fixed by narrowing the write, not widening the grant`,
        ).toBe(false);
        expect(
          grants.update.has(column),
          `${table}.${column} is UPDATE-granted to authenticated; #68 must be fixed by narrowing the write, not widening the grant`,
        ).toBe(false);
      }
      // `updated_at` is maintained by a BEFORE UPDATE trigger precisely so it
      // never has to appear here, where a client could forge it.
      expect(grants.update.has("updated_at")).toBe(false);
    });

  }

  for (const { name, table } of WRITE_RPCS) {
    const grants = effectiveGrants(table);
    const body = latestDefinition(name);

    it(`${name} only writes ${table} columns authenticated may insert`, () => {
      for (const columns of insertedColumns(body, table)) {
        const denied = columns.filter((column) => !grants.insert.has(column));
        expect(denied, `${name} inserts ungranted ${table} columns`).toEqual([]);
      }
    });

    it(`${name} only writes ${table} columns authenticated may update`, () => {
      for (const columns of updatedColumns(body, table)) {
        const denied = columns.filter((column) => !grants.update.has(column));
        expect(denied, `${name} updates ungranted ${table} columns`).toEqual([]);
      }
    });

    it(`${name} names its insert columns explicitly`, () => {
      // The regression itself: `INSERT INTO t SELECT (...).*` implicitly targets
      // every column, so PostgreSQL checks the grant against all of them.
      const bare = new RegExp(`INSERT\\s+INTO\\s+public\\.${table}\\s+SELECT\\b`, "is");
      expect(
        bare.test(body),
        `${name} uses a bare INSERT INTO public.${table} SELECT ..., which targets every column and fails with 42501`,
      ).toBe(false);
    });
  }

  it("writes at least one row through an explicit column list per guarded table", () => {
    for (const table of GUARDED_TABLES) {
      const created = WRITE_RPCS.filter((rpc) => rpc.table === table).flatMap((rpc) =>
        insertedColumns(latestDefinition(rpc.name), table),
      );
      expect(created.length, `no explicit INSERT column list found for ${table}`).toBeGreaterThan(0);
    }
  });

  it("maintains updated_at with a trigger rather than a grant", () => {
    for (const table of GUARDED_TABLES) {
      const trigger = new RegExp(
        `CREATE\\s+TRIGGER\\s+"?[a-z_]+"?\\s+BEFORE\\s+UPDATE\\s+ON\\s+"?public"?\\."?${table}"?`,
        "is",
      );
      expect(trigger.test(ALL_SQL), `${table} has no BEFORE UPDATE trigger to set updated_at`).toBe(
        true,
      );
    }
    expect(/CREATE OR REPLACE FUNCTION\s+"?public"?\."?set_updated_at"?/is.test(ALL_SQL)).toBe(true);
  });

  it("keeps the transactional write RPCs SECURITY INVOKER", () => {
    // RLS backstopping the function bodies is why the ownership assertions are
    // defence in depth rather than the only check. SECURITY DEFINER would make
    // them load-bearing on their own.
    const rpcs = [
      "create_musician_profile_with_tags",
      "update_musician_profile_with_tags",
      "create_gig_with_tags",
      "update_gig_with_tags",
    ];
    for (const rpc of rpcs) {
      const definition = new RegExp(
        `CREATE OR REPLACE FUNCTION\\s+"?public"?\\."?${rpc}"?[\\s\\S]*?\\$\\$;`,
        "gi",
      );
      const matches = [...ALL_SQL.matchAll(definition)];
      expect(matches.length, `no definition found for ${rpc}`).toBeGreaterThan(0);
      const latest = matches[matches.length - 1][0];
      expect(/SECURITY\s+DEFINER/i.test(latest), `${rpc} became SECURITY DEFINER`).toBe(false);
    }
  });
});
