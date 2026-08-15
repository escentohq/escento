import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Every `process.env.X` the app reads must be documented in `.env.example`.
 * Without this, a feature ships reading a variable that Vercel never had set and
 * the failure only shows up in production, at runtime, on one code path.
 */

const ROOT = process.cwd();
const SCAN_DIRS = ["src", "e2e"];
const SCAN_FILES = ["middleware.ts", "playwright.config.ts", "playwright.write.config.ts"];

/**
 * Supplied by the runtime, not by us — documenting these in `.env.example` would
 * imply a developer has to set them.
 */
const RUNTIME_PROVIDED = new Set([
  "NODE_ENV", // Node/Next
  "CI", // GitHub Actions
  "PLAYWRIGHT_BASE_URL", // set per-run by the CI workflow
  "VERCEL_AUTOMATION_BYPASS_SECRET", // GitHub Actions secret, never a local .env value
  "E2E_PREBUILT", // set by the CI write-flow job, which builds in its own step
]);

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return /\.(ts|tsx|mjs)$/.test(entry.name) ? [full] : [];
    }),
  );
  return files.flat();
}

const scanned = [
  ...(await Promise.all(SCAN_DIRS.map((dir) => walk(path.join(ROOT, dir))))).flat(),
  ...SCAN_FILES.map((file) => path.join(ROOT, file)),
];

const reads = new Map<string, string[]>();
for (const file of scanned) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
    const name = match[1];
    if (RUNTIME_PROVIDED.has(name)) continue;
    reads.set(name, [...(reads.get(name) ?? []), path.relative(ROOT, file)]);
  }
}

const documented = new Set(
  [...readFileSync(path.join(ROOT, ".env.example"), "utf8").matchAll(/^([A-Z0-9_]+)=/gm)].map(
    (match) => match[1],
  ),
);

describe("env contract", () => {
  it("documents every environment variable the app reads", () => {
    const undocumented = [...reads.entries()]
      .filter(([name]) => !documented.has(name))
      .map(([name, files]) => `${name}  (read in ${[...new Set(files)].join(", ")})`);

    expect(
      undocumented,
      `Add these to .env.example:\n  ${undocumented.join("\n  ")}`,
    ).toEqual([]);
  });

  it("documents nothing the app never reads", () => {
    const unused = [...documented].filter((name) => !reads.has(name));
    expect(
      unused,
      `.env.example documents variables no code reads:\n  ${unused.join("\n  ")}`,
    ).toEqual([]);
  });
});
