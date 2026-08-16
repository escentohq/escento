import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminTargetType = "user" | "musician_profile" | "creator_profile" | "gig";
export type AdminAction = "hide" | "restore" | "verify" | "unverify" | "clear_text";

export type AdminUserRow = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  isMusician: boolean;
  isCreator: boolean;
  isPublic: boolean | null;
  isVerified: boolean | null;
  moderationStatus: string | null;
  adminNotes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminMusicianRow = {
  id: string;
  userId: string;
  email: string | null;
  displayName: string;
  bio: string | null;
  isPublic: boolean | null;
  isVerified: boolean | null;
  moderationStatus: string | null;
  adminNotes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminCreatorRow = AdminUserRow & {
  gigCount: number;
};

export type AdminGigRow = {
  id: string;
  creatorId: string;
  creatorEmail: string | null;
  creatorName: string | null;
  title: string;
  description: string | null;
  isPublic: boolean | null;
  isVerified: boolean | null;
  moderationStatus: string | null;
  adminNotes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

function userRow(raw: any): AdminUserRow {
  return {
    id: raw.id,
    email: raw.email ?? null,
    name: raw.name ?? null,
    role: raw.role ?? null,
    isMusician: raw.is_musician ?? false,
    isCreator: raw.is_creator ?? false,
    isPublic: raw.is_public ?? null,
    isVerified: raw.is_verified ?? null,
    moderationStatus: raw.moderation_status ?? null,
    adminNotes: raw.admin_notes ?? null,
    createdAt: raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
  };
}

function musicianRow(raw: any): AdminMusicianRow {
  return {
    id: raw.id,
    userId: raw.user_id,
    email: raw.app_user?.email ?? null,
    displayName: raw.display_name,
    bio: raw.bio ?? null,
    isPublic: raw.is_public ?? null,
    isVerified: raw.is_verified ?? null,
    moderationStatus: raw.moderation_status ?? null,
    adminNotes: raw.admin_notes ?? null,
    createdAt: raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
  };
}

function gigRow(raw: any): AdminGigRow {
  return {
    id: raw.id,
    creatorId: raw.creator_id,
    creatorEmail: raw.app_user?.email ?? null,
    creatorName: raw.app_user?.name ?? null,
    title: raw.title,
    description: raw.description ?? null,
    isPublic: raw.is_public ?? null,
    isVerified: raw.is_verified ?? null,
    moderationStatus: raw.moderation_status ?? null,
    adminNotes: raw.admin_notes ?? null,
    createdAt: raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
  };
}

export async function getAdminDashboardData() {
  const supabase = createSupabaseAdminClient();
  const [users, musicians, creators, gigs, recentProfiles, recentGigs] = await Promise.all([
    supabase.from("app_user").select("id", { count: "exact", head: true }),
    supabase.from("musician_profile").select("id", { count: "exact", head: true }),
    supabase.from("app_user").select("id", { count: "exact", head: true }).eq("is_creator", true),
    supabase.from("gig").select("id", { count: "exact", head: true }),
    supabase
      .from("musician_profile")
      .select("id, user_id, display_name, bio, is_public, is_verified, moderation_status, admin_notes, created_at, updated_at, app_user(email)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("gig")
      .select("id, creator_id, title, description, is_public, is_verified, moderation_status, admin_notes, created_at, updated_at, app_user(name, email)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  for (const result of [users, musicians, creators, gigs, recentProfiles, recentGigs]) {
    if (result.error) throw result.error;
  }

  return {
    totalUsers: users.count ?? 0,
    totalMusicianProfiles: musicians.count ?? 0,
    totalCreatorProfiles: creators.count ?? 0,
    totalGigs: gigs.count ?? 0,
    recentProfiles: (recentProfiles.data ?? []).map(musicianRow),
    recentGigs: (recentGigs.data ?? []).map(gigRow),
  };
}

export async function listAdminUsers() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("app_user")
    .select("id, email, name, role, is_musician, is_creator, is_public, is_verified, moderation_status, admin_notes, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(userRow);
}

export async function listAdminMusicians() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("musician_profile")
    .select("id, user_id, display_name, bio, is_public, is_verified, moderation_status, admin_notes, created_at, updated_at, app_user(email)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(musicianRow);
}

export async function listAdminCreators(): Promise<AdminCreatorRow[]> {
  const supabase = createSupabaseAdminClient();
  const [users, gigs] = await Promise.all([
    supabase
      .from("app_user")
      .select("id, email, name, role, is_musician, is_creator, is_public, is_verified, moderation_status, admin_notes, created_at, updated_at")
      .order("created_at", { ascending: false }),
    supabase.from("gig").select("creator_id"),
  ]);
  if (users.error) throw users.error;
  if (gigs.error) throw gigs.error;

  const gigCounts = new Map<string, number>();
  for (const gig of gigs.data ?? []) {
    gigCounts.set(gig.creator_id, (gigCounts.get(gig.creator_id) ?? 0) + 1);
  }

  return (users.data ?? [])
    .filter((user) => user.is_creator || gigCounts.has(user.id))
    .map((user) => ({
      ...userRow(user),
      gigCount: gigCounts.get(user.id) ?? 0,
    }));
}

export async function listAdminGigs() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("gig")
    .select("id, creator_id, title, description, is_public, is_verified, moderation_status, admin_notes, created_at, updated_at, app_user(name, email)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(gigRow);
}

export async function moderateAdminTarget({
  adminEmail,
  targetType,
  targetId,
  action,
  reason,
  replacementText,
}: {
  adminEmail: string;
  targetType: AdminTargetType;
  targetId: string;
  action: AdminAction;
  reason: string | null;
  replacementText?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const note = reason || null;

  const patch =
    action === "hide"
      ? { is_public: false, moderation_status: "hidden", admin_notes: note }
      : action === "restore"
        ? { is_public: true, moderation_status: "active", admin_notes: note }
        : action === "verify"
          ? { is_verified: true, admin_notes: note }
          : action === "unverify"
            ? { is_verified: false, admin_notes: note }
            : null;

  let result;
  if (targetType === "user" || targetType === "creator_profile") {
    if (!patch) throw new Error("Unsupported user action.");
    result = await supabase.from("app_user").update(patch).eq("id", targetId);
  } else if (targetType === "musician_profile") {
    const nextPatch = action === "clear_text" ? { bio: replacementText ?? "", admin_notes: note } : patch;
    if (!nextPatch) throw new Error("Unsupported musician action.");
    result = await supabase.from("musician_profile").update(nextPatch).eq("id", targetId);
  } else {
    const nextPatch = action === "clear_text" ? { description: replacementText ?? "", admin_notes: note } : patch;
    if (!nextPatch) throw new Error("Unsupported gig action.");
    result = await supabase.from("gig").update(nextPatch).eq("id", targetId);
  }

  if (result.error) throw result.error;

  await supabase.from("admin_audit_log").insert({
    admin_user_email: adminEmail,
    action,
    target_type: targetType,
    target_id: targetId,
    reason: note,
  });
}
