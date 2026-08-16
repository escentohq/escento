import type { Metadata } from "next";

import { PageShell } from "@/components/ui/page-shell";
import { SupportForm } from "./_support-form";

export const metadata: Metadata = {
  title: "Contact support",
  description: "Send Escento a question about your account, profile, gig, or messages.",
};

export default function HelpPage() {
  return (
    <PageShell
      title="Contact support"
      body="Tell us what you need help with. Include any relevant account or listing details."
      size="medium"
    >
      <SupportForm />
    </PageShell>
  );
}
