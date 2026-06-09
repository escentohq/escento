import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type TaxonomyKind = "instrument" | "genre";

export type AdminTaxonomyRow = {
  id: string;
  name: string;
  isDefault: boolean | null;
  createdBy: string | null;
  musicianUsage: number;
  gigUsage: number;
};

function tableForKind(kind: TaxonomyKind) {
  return kind === "instrument"
    ? {
        tagTable: "instrument",
        musicianJoinTable: "musician_instrument",
        musicianColumn: "instrument_id",
        gigJoinTable: "gig_instrument",
        gigColumn: "instrument_id",
      }
    : {
        tagTable: "genre",
        musicianJoinTable: "musician_genre",
        musicianColumn: "genre_id",
        gigJoinTable: "gig_genre",
        gigColumn: "genre_id",
      };
}

export async function listAdminTaxonomy(kind: TaxonomyKind): Promise<AdminTaxonomyRow[]> {
  const supabase = createSupabaseAdminClient();
  const tables = tableForKind(kind);
  const [tags, musicianLinks, gigLinks] = await Promise.all([
    supabase
      .from(tables.tagTable)
      .select("id, name, is_default, created_by")
      .order("name", { ascending: true }),
    supabase.from(tables.musicianJoinTable).select(tables.musicianColumn),
    supabase.from(tables.gigJoinTable).select(tables.gigColumn),
  ]);

  if (tags.error || musicianLinks.error || gigLinks.error) {
    throw tags.error || musicianLinks.error || gigLinks.error;
  }

  const musicianCounts = new Map<string, number>();
  for (const link of musicianLinks.data ?? []) {
    const id = link[tables.musicianColumn];
    musicianCounts.set(id, (musicianCounts.get(id) ?? 0) + 1);
  }

  const gigCounts = new Map<string, number>();
  for (const link of gigLinks.data ?? []) {
    const id = link[tables.gigColumn];
    gigCounts.set(id, (gigCounts.get(id) ?? 0) + 1);
  }

  return (tags.data ?? []).map((tag) => ({
    id: tag.id,
    name: tag.name,
    isDefault: tag.is_default ?? null,
    createdBy: tag.created_by ?? null,
    musicianUsage: musicianCounts.get(tag.id) ?? 0,
    gigUsage: gigCounts.get(tag.id) ?? 0,
  }));
}

export async function deleteTaxonomyTerm(kind: TaxonomyKind, id: string) {
  const supabase = createSupabaseAdminClient();
  const tables = tableForKind(kind);
  const [musicianDelete, gigDelete] = await Promise.all([
    supabase.from(tables.musicianJoinTable).delete().eq(tables.musicianColumn, id),
    supabase.from(tables.gigJoinTable).delete().eq(tables.gigColumn, id),
  ]);

  if (musicianDelete.error || gigDelete.error) {
    throw musicianDelete.error || gigDelete.error;
  }

  const { error } = await supabase.from(tables.tagTable).delete().eq("id", id);
  if (error) throw error;
}

export async function addTaxonomyTerm({
  kind,
  name,
  createdBy,
}: {
  kind: TaxonomyKind;
  name: string;
  createdBy: string;
}) {
  const supabase = createSupabaseAdminClient();
  const tables = tableForKind(kind);
  const { error } = await supabase
    .from(tables.tagTable)
    .upsert(
      { name, created_by: createdBy, is_default: false },
      { onConflict: "name", ignoreDuplicates: true },
    );

  if (error) throw error;
}
