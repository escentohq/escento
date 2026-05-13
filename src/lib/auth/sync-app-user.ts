import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

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
 * Ensures a Prisma `User` exists for the Supabase auth user and returns it.
 * Links by `supabaseUserId`, or by email for legacy rows created before Supabase.
 */
export async function syncAppUserFromAuth(authUser: SupabaseAuthUser) {
  const authId = authUser.id;
  const email = authUser.email?.trim().toLowerCase();
  if (!email) {
    throw new Error("Authenticated user is missing an email.");
  }

  const name = displayNameFromAuth(authUser);
  const image = imageFromAuth(authUser);
  const supabase = await createSupabaseServerClient();

  const { data: bySupabase } = await supabase
    .from("user")
    .select("*")
    .eq("supabase_user_id", authId)
    .single();

  if (bySupabase) {
    const { data } = await supabase
      .from("user")
      .update({
        email,
        name: name ?? bySupabase.name,
        image: image ?? bySupabase.image,
      })
      .eq("id", bySupabase.id)
      .select()
      .single();
    return data;
  }

  const { data: byEmail } = await supabase
    .from("user")
    .select("*")
    .eq("email", email)
    .single();

  if (byEmail) {
    const { data } = await supabase
      .from("user")
      .update({
        supabase_user_id: authId,
        name: byEmail.name ?? name,
        image: byEmail.image ?? image,
      })
      .eq("id", byEmail.id)
      .select()
      .single();
    return data;
  }

  const { data } = await supabase
    .from("user")
    .insert({
      email,
      name,
      image,
      supabase_user_id: authId,
    })
    .select()
    .single();

  return data;
}
