import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminTargetType = "user" | "musician_profile" | "creator_profile" | "gig";
export type AdminAction =
  | "hide"
  | "restore"
  | "verify"
  | "unverify"
  | "delete"
  | "suspend"
  | "unsuspend"
  | "clear_text";

export type AdminUserRow = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  image: string | null;
  isAdmin: boolean;
  isPublic: boolean;
  isVerified: boolean;
  suspendedAt: string | null;
  suspensionReason: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminProfileRow = {
  id: string;
  userId: string;
  email: string | null;
  displayName: string;
  profileType: "MUSICIAN";
  isPublic: boolean;
  isVerified: boolean;
  bio: string | null;
  moderationReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCreatorRow = {
  id: string;
  email: string | null;
  name: string | null;
  profileType: "CREATOR";
  isPublic: boolean;
  isVerified: boolean;
  suspendedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  gigCount: number;
};

export type AdminGigRow = {
  id: string;
  creatorId: string;
  creatorEmail: string | null;
  creatorName: string | null;
  title: string;
  description: string;
  status: string;
  isPublic: boolean;
  isVerified: boolean;
  moderationReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminAuditLogRow = {
  id: string;
  adminUserId: string;
  adminEmail: string | null;
  adminName: string | null;
  action: string;
  targetType: string;
  targetId: string;
  targetUserId: string | null;
  reason: string | null;
  createdAt: string;
};

function mapUser(raw: any): AdminUserRow {
  return {
    id: raw.id,
    email: raw.email ?? null,
    name: raw.name ?? null,
    role: raw.role ?? null,
    image: raw.image ?? null,
    isAdmin: Boolean(raw.is_admin),
    isPublic: raw.is_public ?? true,
    isVerified: raw.is_verified ?? true,
    suspendedAt: raw.suspended_at ?? null,
    suspensionReason: raw.suspension_reason ?? null,
    createdAt: raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
  };
}

function mapProfile(raw: any): AdminProfileRow {
  return {
    id: raw.id,
    userId: raw.user_id,
    email: raw.app_user?.email ?? null,
    displayName: raw.display_name,
    profileType: "MUSICIAN",
    isPublic: raw.is_public ?? true,
    isVerified: raw.is_verified ?? true,
    bio: raw.bio ?? null,
    moderationReason: raw.moderation_reason ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapCreator(raw: any, gigCount = 0): AdminCreatorRow {
  return {
    id: raw.id,
    email: raw.email ?? null,
    name: raw.name ?? null,
    profileType: "CREATOR",
    isPublic: raw.is_public ?? true,
    isVerified: raw.is_verified ?? true,
    suspendedAt: raw.suspended_at ?? null,
    createdAt: raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
    gigCount,
  };
}

function mapGig(raw: any): AdminGigRow {
  return {
    id: raw.id,
    creatorId: raw.creator_id,
    creatorEmail: raw.app_user?.email ?? null,
    creatorName: raw.app_user?.name ?? null,
    title: raw.title,
    description: raw.description,
    status: raw.status,
    isPublic: raw.is_public ?? true,
    isVerified: raw.is_verified ?? true,
    moderationReason: raw.moderation_reason ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export async function getAdminDashboard() {
  const supabase = createSupabaseAdminClient();
  const [
    users,
    musicianProfiles,
    creators,
    gigs,
    recentProfiles,
    recentGigs,
  ] = await Promise.all([
    supabase.from("app_user").select("id", { count: "exact", head: true }),
    supabase.from("musician_profile").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("app_user").select("id", { count: "exact", head: true }).eq("role", "CREATOR"),
    supabase.from("gig").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase
      .from("musician_profile")
      .select("id, user_id, display_name, bio, is_public, is_verified, moderation_reason, created_at, updated_at, app_user(email)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("gig")
      .select("id, creator_id, title, description, status, is_public, is_verified, moderation_reason, created_at, updated_at, app_user(name, email)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  for (const result of [users, musicianProfiles, creators, gigs, recentProfiles, recentGigs]) {
    if (result.error) throw result.error;
  }

  return {
    totalUsers: users.count ?? 0,
    totalMusicianProfiles: musicianProfiles.count ?? 0,
    totalCreatorProfiles: creators.count ?? 0,
    totalGigs: gigs.count ?? 0,
    recentProfiles: (recentProfiles.data ?? []).map(mapProfile),
    recentGigs: (recentGigs.data ?? []).map(mapGig),
  };
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("app_user")
    .select("id, email, name, role, image, is_admin, is_public, is_verified, suspended_at, suspension_reason, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapUser);
}

export async function listAdminMusicianProfiles(): Promise<AdminProfileRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("musician_profile")
    .select("id, user_id, display_name, bio, is_public, is_verified, moderation_reason, created_at, updated_at, app_user(email)")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapProfile);
}

export async function listAdminCreatorProfiles(): Promise<AdminCreatorRow[]> {
  const supabase = createSupabaseAdminClient();
  const [{ data: users, error: usersError }, { data: gigs, error: gigsError }] = await Promise.all([
    supabase
      .from("app_user")
      .select("id, email, name, role, image, is_public, is_verified, suspended_at, created_at, updated_at")
      .eq("role", "CREATOR")
      .order("created_at", { ascending: false }),
    supabase.from("gig").select("creator_id").is("deleted_at", null),
  ]);

  if (usersError) throw usersError;
  if (gigsError) throw gigsError;

  const gigCounts = new Map<string, number>();
  for (const gig of gigs ?? []) {
    gigCounts.set(gig.creator_id, (gigCounts.get(gig.creator_id) ?? 0) + 1);
  }

  return (users ?? []).map((user) => mapCreator(user, gigCounts.get(user.id) ?? 0));
}

export async function listAdminGigs(): Promise<AdminGigRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("gig")
    .select("id, creator_id, title, description, status, is_public, is_verified, moderation_reason, created_at, updated_at, app_user(name, email)")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapGig);
}

export async function listAdminAuditLog(): Promise<AdminAuditLogRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("id, admin_user_id, action, target_type, target_id, target_user_id, reason, created_at, admin:app_user!admin_audit_log_admin_user_id_fkey(email, name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    adminUserId: row.admin_user_id,
    adminEmail: row.admin?.email ?? null,
    adminName: row.admin?.name ?? null,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    targetUserId: row.target_user_id ?? null,
    reason: row.reason ?? null,
    createdAt: row.created_at,
  }));
}

async function audit(
  adminUserId: string,
  action: AdminAction,
  targetType: AdminTargetType,
  targetId: string,
  targetUserId: string | null,
  reason: string | null,
) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("admin_audit_log").insert({
    admin_user_id: adminUserId,
    action,
    target_type: targetType,
    target_id: targetId,
    target_user_id: targetUserId,
    reason,
  });
  if (error) throw error;
}

async function getTargetUserId(targetType: AdminTargetType, targetId: string) {
  const supabase = createSupabaseAdminClient();
  if (targetType === "user" || targetType === "creator_profile") return targetId;
  if (targetType === "musician_profile") {
    const { data } = await supabase.from("musician_profile").select("user_id").eq("id", targetId).single();
    return data?.user_id ?? null;
  }
  const { data } = await supabase.from("gig").select("creator_id").eq("id", targetId).single();
  return data?.creator_id ?? null;
}

export async function moderateAdminTarget({
  adminUserId,
  targetType,
  targetId,
  action,
  reason,
  replacementText,
}: {
  adminUserId: string;
  targetType: AdminTargetType;
  targetId: string;
  action: AdminAction;
  reason: string | null;
  replacementText?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const targetUserId = await getTargetUserId(targetType, targetId);

  if (action === "suspend" && targetUserId === adminUserId) {
    throw new Error("Admins cannot suspend their own account.");
  }

  let result;
  if (targetType === "user" || targetType === "creator_profile") {
    const patch =
      action === "hide" ? { is_public: false, suspension_reason: reason }
      : action === "restore" ? { is_public: true, suspension_reason: null }
      : action === "verify" ? { is_verified: true }
      : action === "unverify" ? { is_verified: false, suspension_reason: reason }
      : action === "suspend" ? { suspended_at: new Date().toISOString(), suspension_reason: reason }
      : action === "unsuspend" ? { suspended_at: null, suspension_reason: null }
      : null;
    if (!patch) throw new Error("Unsupported user moderation action.");
    result = await supabase.from("app_user").update(patch).eq("id", targetId);
  } else if (targetType === "musician_profile") {
    if (action === "delete") {
      result = await supabase.from("musician_profile").update({ deleted_at: new Date().toISOString(), is_public: false, moderation_reason: reason }).eq("id", targetId);
    } else {
      const patch =
        action === "hide" ? { is_public: false, moderation_reason: reason }
        : action === "restore" ? { is_public: true, moderation_reason: null }
        : action === "verify" ? { is_verified: true }
        : action === "unverify" ? { is_verified: false, moderation_reason: reason }
        : action === "clear_text" ? { bio: replacementText ?? "", moderation_reason: reason }
        : null;
      if (!patch) throw new Error("Unsupported musician profile moderation action.");
      result = await supabase.from("musician_profile").update(patch).eq("id", targetId);
    }
  } else {
    if (action === "delete") {
      result = await supabase.from("gig").update({ deleted_at: new Date().toISOString(), is_public: false, moderation_reason: reason }).eq("id", targetId);
    } else {
      const patch =
        action === "hide" ? { is_public: false, moderation_reason: reason }
        : action === "restore" ? { is_public: true, moderation_reason: null }
        : action === "verify" ? { is_verified: true }
        : action === "unverify" ? { is_verified: false, moderation_reason: reason }
        : action === "clear_text" ? { description: replacementText ?? "", moderation_reason: reason }
        : null;
      if (!patch) throw new Error("Unsupported gig moderation action.");
      result = await supabase.from("gig").update(patch).eq("id", targetId);
    }
  }

  if (result.error) throw result.error;
  await audit(adminUserId, action, targetType, targetId, targetUserId, reason);
}
