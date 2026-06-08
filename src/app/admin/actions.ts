"use server";

import { revalidatePath } from "next/cache";

import { requireAdminEmail } from "@/lib/admin-auth";
import { getCurrentSession } from "@/lib/auth-guards";
import {
  moderateAdminTarget,
  type AdminAction,
  type AdminTargetType,
} from "@/lib/api/admin-dashboard";
import { nonEmptyOrNull, strOrEmpty } from "@/lib/form-utils";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deleteUserCompletely } from "@/lib/user-deletion";

const TARGET_TYPES = new Set<AdminTargetType>([
  "user",
  "musician_profile",
  "creator_profile",
  "gig",
]);

const ACTIONS = new Set<AdminAction>([
  "hide",
  "restore",
  "verify",
  "unverify",
  "clear_text",
]);

export async function adminModerationAction(formData: FormData) {
  const adminEmail = await requireAdminEmail();
  const targetType = strOrEmpty(formData.get("targetType")) as AdminTargetType;
  const targetId = strOrEmpty(formData.get("targetId"));
  const action = strOrEmpty(formData.get("action")) as AdminAction;
  const reason = nonEmptyOrNull(formData.get("reason"));
  const replacementText = strOrEmpty(formData.get("replacementText"));

  if (!TARGET_TYPES.has(targetType) || !ACTIONS.has(action) || !targetId) {
    throw new Error("Invalid admin moderation request.");
  }

  await moderateAdminTarget({
    adminEmail,
    targetType,
    targetId,
    action,
    reason,
    replacementText,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/musicians");
  revalidatePath("/admin/creators");
  revalidatePath("/admin/gigs");
}

export async function adminDeleteUserAction(formData: FormData) {
  const adminEmail = await requireAdminEmail();
  const session = await getCurrentSession();
  const targetId = strOrEmpty(formData.get("targetId"));
  const targetEmail = strOrEmpty(formData.get("targetEmail"));
  const confirmation = strOrEmpty(formData.get("confirmation"));
  const reason = nonEmptyOrNull(formData.get("reason"));

  if (!targetId) {
    throw new Error("Missing user.");
  }

  if (session?.user.id === targetId) {
    throw new Error("Admins cannot delete their own account from the admin dashboard.");
  }

  if (confirmation !== "DELETE") {
    throw new Error("Type DELETE to confirm permanent account deletion.");
  }

  const admin = createSupabaseAdminClient();
  const { data: targetUser, error: targetError } = await admin
    .from("app_user")
    .select("id, email")
    .eq("id", targetId)
    .maybeSingle();

  if (targetError) throw targetError;
  if (!targetUser) throw new Error("User not found.");
  if (targetEmail && targetUser.email !== targetEmail) {
    throw new Error("User details changed. Refresh and try again.");
  }

  await deleteUserCompletely(targetId);

  const { error: auditError } = await admin.from("admin_audit_log").insert({
    admin_user_email: adminEmail,
    action: "delete_user",
    target_type: "user",
    target_id: targetId,
    reason,
  });

  if (auditError) {
    console.error("[admin] user deletion audit failed", auditError);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/musicians");
  revalidatePath("/admin/creators");
  revalidatePath("/admin/gigs");
}
