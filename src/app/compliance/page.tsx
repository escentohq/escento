import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Compliance",
  description: "Read Escento's compliance information.",
};

export default function CompliancePage() {
  return (
    <div className="bg-paper px-6 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Legal
          </span>
          <h1 className="mt-4 text-page-title text-ink">
            Compliance
          </h1>
          <p className="mt-4 text-sm text-muted">Last updated: May 20, 2026</p>
        </div>

        {/* Placeholder */}
        <section className="border-y border-rule py-8">
          <div className="max-w-2xl">
            <p className="text-body text-muted">Compliance information is being prepared.</p>
            <p className="mt-2 text-secondary text-muted">Contact support for questions about data handling or regulatory requirements.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
