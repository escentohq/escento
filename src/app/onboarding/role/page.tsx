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
      eyebrow="Soundcheck"
      title="Choose your role"
      body="Pick the side you are using today. Motivo keeps the tools focused around that choice."
      size="medium"
    >
      <RoleOnboardingPicker />
    </PageShell>
  );
}
