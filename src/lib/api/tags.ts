import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeTagName } from "@/lib/form-utils";
import type { Tag } from "./types";

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
  const supabase = await createSupabaseServerClient();
  const normalized = Array.from(new Set(names.map(normalizeTagName))).filter(Boolean);

  if (!normalized.length) return [];

  const { data, error } = await supabase
    .from("instrument")
    .upsert(normalized.map((name) => ({ name })), { onConflict: "name" })
    .select("id, name");

  if (error) throw error;
  return data || [];
}

export async function ensureGenres(names: string[]): Promise<Tag[]> {
  const supabase = await createSupabaseServerClient();
  const normalized = Array.from(new Set(names.map(normalizeTagName))).filter(Boolean);

  if (!normalized.length) return [];

  const { data, error } = await supabase
    .from("genre")
    .upsert(normalized.map((name) => ({ name })), { onConflict: "name" })
    .select("id, name");

  if (error) throw error;
  return data || [];
}
