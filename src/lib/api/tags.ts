import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeTagName } from "@/lib/form-utils";
import type { Tag } from "./types";

type TagTable = "instrument" | "genre";

async function ensureTags(table: TagTable, names: string[], userId: string): Promise<Tag[]> {
  const supabase = await createSupabaseServerClient();
  const normalized = Array.from(new Set(names.map(normalizeTagName))).filter(Boolean);

  if (!normalized.length) return [];

  // Upsert all tags — onConflict: 'name' prevents duplicate inserts under concurrent writes
  // New rows get created_by set to userId, is_default false
  const { error: upsertError } = await supabase
    .from(table)
    .upsert(normalized.map((name) => ({ name, created_by: userId, is_default: false })), { onConflict: "name", ignoreDuplicates: true });

  if (upsertError) throw upsertError;

  // Fetch the final tags
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

export async function ensureInstruments(names: string[], userId: string): Promise<Tag[]> {
  return ensureTags("instrument", names, userId);
}

export async function ensureGenres(names: string[], userId: string): Promise<Tag[]> {
  return ensureTags("genre", names, userId);
}
