"use server";

import { revalidatePath } from "next/cache";

import { writeActiveViewCookie } from "@/lib/active-view";
import { requireUser } from "@/lib/auth-guards";
import { isAppRole, type AppRole } from "@/lib/onboarding-role";

/**
 * Persist which mode the account is acting in (issue #6).
 *
 * Deliberately does **not** redirect. `redirect()` throws, so the caller's
 * `refreshNavigationState()` would never run and the header would keep showing
 * the previous mode's actions. The client navigates itself.
 *
 * Rejecting a capability the account does not hold is defense in depth, not a
 * security boundary: the view grants nothing, and `resolveActiveView` ignores a
 * value the account cannot back up.
 */
export async function setActiveViewAction(view: AppRole): Promise<void> {
  const session = await requireUser("/");
  if (!isAppRole(view)) throw new Error(`Unsupported view: ${String(view)}`);
  if (!session.user.capabilities.includes(view)) {
    throw new Error("That view is not available on this account.");
  }

  await writeActiveViewCookie(view);
  revalidatePath("/", "layout");
}
