import type { Prisma } from "@prisma/client";

import { normalizeTagName } from "@/lib/form-utils";

type Transaction = Prisma.TransactionClient;

async function ensureTag(
  tx: Transaction,
  model: "instrument" | "genre",
  rawName: string,
) {
  const name = normalizeTagName(rawName);
  if (!name) return null;

  const existing =
    model === "instrument"
      ? await tx.instrument.findFirst({ where: { name } })
      : await tx.genre.findFirst({ where: { name } });

  if (existing) return existing;

  return model === "instrument"
    ? tx.instrument.create({ data: { name } })
    : tx.genre.create({ data: { name } });
}

export async function ensureInstruments(tx: Transaction, names: string[]) {
  const records = await Promise.all(
    Array.from(new Set(names)).map((name) => ensureTag(tx, "instrument", name)),
  );
  return records.filter((record): record is NonNullable<typeof record> => Boolean(record));
}

export async function ensureGenres(tx: Transaction, names: string[]) {
  const records = await Promise.all(
    Array.from(new Set(names)).map((name) => ensureTag(tx, "genre", name)),
  );
  return records.filter((record): record is NonNullable<typeof record> => Boolean(record));
}

