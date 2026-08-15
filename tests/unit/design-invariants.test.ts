import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Design rules that AGENTS.md states as prose. Prose does not fail a build.
 */

const ROOT = process.cwd();
const GLOBALS = path.join(ROOT, "src/app/globals.css");

/**
 * `globals.css` is the small shared foundation, deliberately frozen: styling
 * belongs in Tailwind utilities on the component. Adding a class here is how a
 * parallel, invisible design system starts.
 */
const ALLOWED_GLOBAL_CLASSES = [
  ".control-primary",
  ".control-secondary",
  ".media-avatar",
  ".status-dot",
  ".surface-overlay",
];

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return /\.(ts|tsx|css)$/.test(entry.name) ? [full] : [];
    }),
  );
  return files.flat();
}

const srcFiles = await walk(path.join(ROOT, "src"));

describe("globals.css stays frozen", () => {
  it("defines no classes beyond the shared foundation", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const declared = [...css.matchAll(/^\s*(\.[a-zA-Z0-9_-]+)/gm)].map((match) => match[1]);
    const added = [...new Set(declared)].filter((name) => !ALLOWED_GLOBAL_CLASSES.includes(name));

    expect(
      added,
      "New global class(es). Style the component with Tailwind utilities instead, " +
        `or add a deliberate exception here:\n  ${added.join("\n  ")}`,
    ).toEqual([]);
  });
});

describe("no gradients", () => {
  it("uses no CSS gradient anywhere in src/", () => {
    const offenders = srcFiles
      .filter((file) => /(?:linear|radial|conic)-gradient|\bbg-gradient-/.test(readFileSync(file, "utf8")))
      .map((file) => path.relative(ROOT, file));

    expect(
      offenders,
      `Gradients are prohibited by the design system (AGENTS.md):\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });
});
