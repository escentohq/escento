import { type Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Acceptable Use",
  description: "What you may and may not do on Escento, and how we handle reports.",
};

export default function CompliancePage() {
  return (
    <LegalPage title="Acceptable Use">
      <section>
        <h2>Why this page exists</h2>
        <p>
          Signup asks you to agree to Escento&apos;s terms, privacy policy, and this page. This is
          not a certification, audit report, or regulatory filing. It is the rule set for using
          the directories and messaging, and a description of how we handle reports.
        </p>
      </section>

      <section>
        <h2>Allowed</h2>
        <ul>
          <li>Publish a musician profile or a gig that describes real work you can do or need.</li>
          <li>Browse anonymously. Send a connection request, and message someone who accepts.</li>
          <li>Arrange the actual job, pay, and schedule off Escento.</li>
          <li>Report a listing or account that looks harmful or fake.</li>
        </ul>
      </section>

      <section>
        <h2>Not allowed</h2>
        <ul>
          <li>Harassment, hate, sexual content involving minors, or threats.</li>
          <li>Impersonation, fake listings, or bait that is not a real project.</li>
          <li>Spam, scraping the directories, or automated account creation.</li>
          <li>Collecting payment details, government IDs, or other sensitive data through Escento.</li>
          <li>Using the service to run a marketplace for anything illegal.</li>
        </ul>
      </section>

      <section>
        <h2>Reports and moderation</h2>
        <p>
          Signed-in users can report a profile or a gig. Operators can hide a listing or an
          account, and they can write to people through the support account. Hidden listings
          leave public discovery. We may remove content or accounts that break these rules
          without a prior warning when the risk is obvious.
        </p>
      </section>

      <section>
        <h2>What we do not claim</h2>
        <p>
          Escento does not currently hold a SOC 2 report, an ISO certification, or a formal
          student-data compliance program. Hosting and authentication run on Vercel and
          Supabase. Read the <Link href="/privacy">Privacy Policy</Link> for the processors we
          actually use.
        </p>
      </section>
    </LegalPage>
  );
}
