import { normalizeTagName } from "@/lib/form-utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function ensureTag(
  model: "instrument" | "genre",
  rawName: string,
) {
  const name = normalizeTagName(rawName);
  if (!name) return null;

  const supabase = await createSupabaseServerClient();
  const tableName = model === "instrument" ? "instrument" : "genre";

  const { data: existing } = await supabase
    .from(tableName)
    .select("*")
    .eq("name", name)
    .single();

  if (existing) return existing;

  const { data: created } = await supabase
    .from(tableName)
    .insert({ name })
    .select()
    .single();

  return created;
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

