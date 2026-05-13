import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeTagName } from "@/lib/form-utils";
import type { Tag } from "./types";

type TagTable = "instrument" | "genre";

async function ensureTags(table: TagTable, names: string[]): Promise<Tag[]> {
  const supabase = await createSupabaseServerClient();
  const normalized = Array.from(new Set(names.map(normalizeTagName))).filter(Boolean);

  if (!normalized.length) return [];

  const { data: existing, error: existingError } = await supabase
    .from(table)
    .select("id, name")
    .in("name", normalized);

  if (existingError) throw existingError;

  const existingNames = new Set((existing || []).map((tag) => tag.name));
  const missing = normalized.filter((name) => !existingNames.has(name));

  if (missing.length) {
    const { error: insertError } = await supabase
      .from(table)
      .insert(missing.map((name) => ({ id: crypto.randomUUID(), name })));

    if (insertError) throw insertError;
  }

  const { data, error } = await supabase
    .from(table)
    .select("id, name")
    .in("name", normalized);

  if (error) throw error;

  const tagsByName = new Map((data || []).map((tag) => [tag.name, tag]));
  return normalized.map((name) => tagsByName.get(name)).filter((tag): tag is Tag => Boolean(tag));
}

export async function listInstruments(): Promise<Tag[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("instrument")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function listGenres(): Promise<Tag[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("genre")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function ensureInstruments(names: string[]): Promise<Tag[]> {
  return ensureTags("instrument", names);
}

export async function ensureGenres(names: string[]): Promise<Tag[]> {
  return ensureTags("genre", names);
}
