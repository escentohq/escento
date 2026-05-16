import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserBySupabaseId, updateUser } from "@/lib/api/users";

function displayNameFromAuth(authUser: SupabaseAuthUser): string | null {
  const meta = authUser.user_metadata as Record<string, unknown> | undefined;
  const full =
    typeof meta?.full_name === "string"
      ? meta.full_name
      : typeof meta?.name === "string"
        ? meta.name
        : null;
  if (full?.trim()) return full.trim();
  if (authUser.user_metadata?.full_name) {
    const v = authUser.user_metadata.full_name;
    return typeof v === "string" ? v : null;
  }
  if (authUser.user_metadata?.name) {
    const v = authUser.user_metadata.name;
    return typeof v === "string" ? v : null;
  }
  return null;
}

function imageFromAuth(authUser: SupabaseAuthUser): string | null {
  const meta = authUser.user_metadata as Record<string, unknown> | undefined;
  const fromMeta =
    typeof meta?.avatar_url === "string"
      ? meta.avatar_url
      : typeof meta?.picture === "string"
        ? meta.picture
        : null;
  if (fromMeta) return fromMeta;
  if (typeof authUser.user_metadata?.avatar_url === "string") {
    return authUser.user_metadata.avatar_url;
  }
  if (typeof authUser.user_metadata?.picture === "string") {
    return authUser.user_metadata.picture;
  }
  return null;
}

/**
 * Ensures a Supabase auth user has a corresponding app user record.
 * Uses upsert on email to handle concurrent signup requests safely.
 * For existing supabaseId links, updates the record.
 */
export async function syncAppUserFromAuth(authUser: SupabaseAuthUser) {
  const authId = authUser.id;
  const email = authUser.email?.trim().toLowerCase();
  if (!email) {
    throw new Error("Authenticated user is missing an email.");
  }

  const name = displayNameFromAuth(authUser);
  const image = imageFromAuth(authUser);

  // Check if already linked by supabaseId (most common path after initial creation)
  const bySupabase = await getUserBySupabaseId(authId);
  if (bySupabase) {
    return updateUser(bySupabase.id, {
      email,
      name: name ?? bySupabase.name,
      image: image ?? bySupabase.image,
    });
  }

  // For new signups: upsert on email to prevent race conditions on concurrent requests
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user")
    .upsert(
      {
        id: crypto.randomUUID(),
        email,
        supabase_user_id: authId,
        name: name || undefined,
        image: image || undefined,
      },
      { onConflict: "email" },
    )
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    image: data.image,
    supabaseUserId: data.supabase_user_id,
    role: data.role,
  };
}
