import { PageShell } from "@/components/ui/page-shell";
import { SupportForm } from "./_support-form";

export default function HelpPage() {
  return (
    <PageShell
      eyebrow="Support"
      title="Contact support"
      body="Tell us what you need help with. Include any relevant account or listing details."
      size="medium"
    >
      <SupportForm />
    </PageShell>
  );
}
