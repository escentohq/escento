import { PageShell } from "@/components/ui/page-shell";
import { SupportForm } from "./_support-form";

export default function HelpPage() {
  return (
    <PageShell
      eyebrow="Support"
      title="How can we help?"
      body="Need assistance? Reach out to the Motivo team and we'll do our best to get back to you as soon as possible."
      size="medium"
    >
      <SupportForm />
    </PageShell>
  );
}

