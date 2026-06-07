"use server";

import { revalidatePath } from "next/cache";

import { requireAdminEmail } from "@/lib/admin-auth";
import {
  moderateAdminTarget,
  type AdminAction,
  type AdminTargetType,
} from "@/lib/api/admin-dashboard";
import { nonEmptyOrNull, strOrEmpty } from "@/lib/form-utils";

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
