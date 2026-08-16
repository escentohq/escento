import { redirect } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { getCurrentSession } from "@/lib/auth-guards";
import { safeInternalPath } from "@/lib/internal-path";
import { isAppRole, type AppRole } from "@/lib/onboarding-role";
import { AddCapabilityCard, RoleOnboardingPicker } from "./_role-picker";

const COPY: Record<AppRole, { title: string; body: string; cta: string }> = {
  MUSICIAN: {
    title: "Add a musician profile",
    body: "You keep everything you have now. This adds a profile creators can find, so you can be booked as well as book.",
    cta: "Add musician profile",
  },
  CREATOR: {
    title: "Add creator tools",
    body: "You keep everything you have now. This lets you post gigs and hire musicians for your own projects.",
    cta: "Add creator tools",
  },
};

/**
 * Four states, not two. Since issue #6 an account can hold both capabilities, so
 * this page is both the first-run picker and the place you come back to when a
 * guard sends you here to add the other one.
 */
export default async function RoleOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string; next?: string }>;
}) {
  const { add, next } = await searchParams;
  const session = await getCurrentSession();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/onboarding/role");

  const capabilities = session.user.capabilities;
  const requested = isAppRole(add) ? add : null;

  // Nothing left to add.
  if (capabilities.length === 2) redirect(safeInternalPath(next, "/"));

  // Sent here by a guard, or arriving with one capability already.
  const missing: AppRole | null =
    requested && !capabilities.includes(requested)
      ? requested
      : capabilities.length === 1
        ? capabilities[0] === "MUSICIAN"
          ? "CREATOR"
          : "MUSICIAN"
        : null;

  if (missing) {
    const copy = COPY[missing];
    return (
      <PageShell title={copy.title} body={copy.body} size="medium">
        <AddCapabilityCard role={missing} cta={copy.cta} next={next} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="What do you want to do first?"
      body="Pick the one you need now. You can add the other later without a second account."
      size="medium"
    >
      <RoleOnboardingPicker />
    </PageShell>
  );
}
