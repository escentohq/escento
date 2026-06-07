"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth-guards";
import {
  moderateAdminTarget,
  type AdminAction,
  type AdminTargetType,
} from "@/lib/api/admin";
import { strOrEmpty, nonEmptyOrNull } from "@/lib/form-utils";

const ACTIONS = new Set<AdminAction>([
  "hide",
  "restore",
  "verify",
  "unverify",
  "delete",
  "suspend",
  "unsuspend",
  "clear_text",
]);

const TARGETS = new Set<AdminTargetType>([
  "user",
  "musician_profile",
  "creator_profile",
  "gig",
]);

export async function moderateTargetAction(formData: FormData) {
  const session = await requireAdmin("/admin");
  const targetType = strOrEmpty(formData.get("targetType")) as AdminTargetType;
  const targetId = strOrEmpty(formData.get("targetId"));
  const action = strOrEmpty(formData.get("action")) as AdminAction;
  const reason = nonEmptyOrNull(formData.get("reason"));
  const replacementText = strOrEmpty(formData.get("replacementText"));

  if (!TARGETS.has(targetType) || !ACTIONS.has(action) || !targetId) {
    throw new Error("Invalid moderation request.");
  }

  await moderateAdminTarget({
    adminUserId: session.user.id,
    targetType,
    targetId,
    action,
    reason,
    replacementText,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/musicians");
  revalidatePath("/admin/creators");
  revalidatePath("/admin/gigs");
  revalidatePath("/admin/users");
  revalidatePath("/admin/audit-log");
  revalidatePath("/musicians");
  revalidatePath("/gigs");
}
