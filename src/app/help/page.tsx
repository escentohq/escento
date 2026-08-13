import { PageShell } from "@/components/ui/page-shell";
import { SupportForm } from "./_support-form";

export default function HelpPage() {
  return (
    <PageShell
      eyebrow="Support"
      title="Contact support"
      body="Tell us what went wrong and include the account or listing details we need to investigate."
      size="medium"
    >
      <SupportForm />
    </PageShell>
  );
}
