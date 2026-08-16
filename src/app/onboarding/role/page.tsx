import { redirect } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { getCurrentSession } from "@/lib/auth-guards";
import { RoleOnboardingPicker } from "./_role-picker";

export default async function RoleOnboardingPage() {
  const session = await getCurrentSession();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/onboarding/role");
  if (session.user.role) redirect("/");

  return (
    <PageShell
      eyebrow="Choose a role"
      title="How will you use Escento?"
      body="Choose once. You cannot switch roles from your account later."
      size="medium"
    >
      <RoleOnboardingPicker />
    </PageShell>
  );
}
