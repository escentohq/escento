import { normalizeTagName } from "@/lib/form-utils";
import { db } from "@/lib/db";

async function ensureTag(
  model: "instrument" | "genre",
  rawName: string,
) {
  const name = normalizeTagName(rawName);
  if (!name) return null;

  const existing =
    model === "instrument"
      ? await db.instrument.findFirst({ where: { name } })
      : await db.genre.findFirst({ where: { name } });

  if (existing) return existing;

  return model === "instrument"
    ? await db.instrument.create({ data: { name } })
    : await db.genre.create({ data: { name } });
}

export async function ensureInstruments(names: string[]) {
  const records = await Promise.all(
    Array.from(new Set(names)).map((name) => ensureTag("instrument", name)),
  );
  return records.filter((record): record is NonNullable<typeof record> => Boolean(record));
}

export async function ensureGenres(names: string[]) {
  const records = await Promise.all(
    Array.from(new Set(names)).map((name) => ensureTag("genre", name)),
  );
  return records.filter((record): record is NonNullable<typeof record> => Boolean(record));
}

