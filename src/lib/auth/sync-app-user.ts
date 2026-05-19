import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { getUserBySupabaseId, getUserByEmail, updateUser } from "@/lib/api/users";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function nameFromAuth(u: SupabaseAuthUser): string | null {
  const m = u.user_metadata as Record<string, unknown> | undefined;
  const v = m?.full_name ?? m?.name;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function imageFromAuth(u: SupabaseAuthUser): string | null {
  const m = u.user_metadata as Record<string, unknown> | undefined;
  const v = m?.avatar_url ?? m?.picture;
  return typeof v === "string" ? v : null;
}

export async function syncAppUserFromAuth(authUser: SupabaseAuthUser) {
  const email = authUser.email?.trim().toLowerCase();
  if (!email) throw new Error("Auth user missing email.");

  const name = nameFromAuth(authUser);
  const image = imageFromAuth(authUser);

  const byId = await getUserBySupabaseId(authUser.id);
  if (byId) {
    return updateUser(byId.id, {
      email,
      name: name ?? byId.name,
      image: image ?? byId.image,
    });
  }

  const byEmail = await getUserByEmail(email);
  if (byEmail) {
    return updateUser(byEmail.id, {
      email,
      supabaseUserId: authUser.id,
      name: name ?? byEmail.name,
      image: image ?? byEmail.image,
    });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user")
    .insert({
      id: crypto.randomUUID(),
      email,
      supabase_user_id: authUser.id,
      name: name ?? undefined,
      image: image ?? undefined,
    })
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
