import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  ALLOWED_ROUTE_HANDLERS,
  ROUTE_INVENTORY,
  guardsFor,
  type RouteEntry,
} from "../../e2e/route-inventory";

/**
 * Catches the class of break, not the instance: a route nobody classified, a
 * classification nobody deleted, and a `protected`/`admin` page whose guard call
 * went missing. All three are invisible to a test suite that hardcodes paths.
 */

const APP_DIR = path.join(process.cwd(), "src/app");

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return [full];
    }),
  );
  return files.flat();
}

/** `src/app/gigs/[id]/edit/page.tsx` -> `/gigs/[id]/edit`; route groups drop out. */
function patternFor(file: string): string {
  const rel = path.relative(APP_DIR, file);
  const segments = path
    .dirname(rel)
    .split(path.sep)
    .filter((segment) => segment !== "." && !segment.startsWith("(") && !segment.startsWith("@"));
  return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
}

const allFiles = await walk(APP_DIR);
const pageFiles = allFiles.filter((file) => path.basename(file) === "page.tsx");
const routeHandlers = allFiles
  .filter((file) => path.basename(file) === "route.ts")
  .map((file) => path.relative(process.cwd(), file));

const byPattern = new Map<string, RouteEntry>(
  ROUTE_INVENTORY.map((entry) => [entry.pattern, entry]),
);

describe("route inventory", () => {
  it("classifies every page route exactly once", () => {
    const patterns = pageFiles.map(patternFor).sort();
    const duplicates = patterns.filter((p, i) => patterns.indexOf(p) !== i);
    expect(duplicates, "two page files resolve to the same route pattern").toEqual([]);

    const unclassified = pageFiles
      .filter((file) => !byPattern.has(patternFor(file)))
      .map((file) => `${path.relative(process.cwd(), file)}  (route ${patternFor(file)})`);

    expect(
      unclassified,
      "New route(s) missing from e2e/route-inventory.ts. Add an entry declaring " +
        "whether a signed-out visitor may load the page:\n  " +
        unclassified.join("\n  "),
    ).toEqual([]);
  });

  it("has no entries for routes that no longer exist", () => {
    const onDisk = new Set(pageFiles.map(patternFor));
    const stale = ROUTE_INVENTORY.filter((entry) => !onDisk.has(entry.pattern)).map(
      (entry) => entry.pattern,
    );
    expect(stale, "e2e/route-inventory.ts lists deleted routes").toEqual([]);
  });

  it("requires an auth guard in every protected and admin page", () => {
    const missing: string[] = [];

    for (const file of pageFiles) {
      const entry = byPattern.get(patternFor(file));
      if (!entry) continue;
      const guards = guardsFor(entry);
      if (!guards.length) continue;

      const source = readFileSync(file, "utf8");
      if (!guards.some((guard) => source.includes(`${guard}(`))) {
        missing.push(
          `${path.relative(process.cwd(), file)} is classified "${entry.access}" but calls none of: ${guards.join(", ")}`,
        );
      }
    }

    expect(missing, `Unguarded route(s):\n  ${missing.join("\n  ")}`).toEqual([]);
  });

  it("requires a reason on mixed routes and on dynamic routes with no smoke path", () => {
    const undocumented = ROUTE_INVENTORY.filter(
      (entry) =>
        !entry.reason && (entry.access === "mixed" || (!entry.smokePath && entry.access !== "admin")),
    ).map((entry) => entry.pattern);

    expect(undocumented, "these entries need a `reason`").toEqual([]);
  });

  it("allows no new REST route handlers", () => {
    const unexpected = routeHandlers.filter((file) => !ALLOWED_ROUTE_HANDLERS.includes(file));
    expect(
      unexpected,
      "Mutations are server actions (AGENTS.md rule #2). A new route.ts needs an " +
        `explicit entry in ALLOWED_ROUTE_HANDLERS:\n  ${unexpected.join("\n  ")}`,
    ).toEqual([]);
  });
});
