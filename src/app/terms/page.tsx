import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Escento Terms of Use - Our terms and conditions for using the platform.",
};

export default function TermsPage() {
  return (
    <div className="bg-paper px-6 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Legal
          </span>
          <h1 className="mt-4 text-page-title text-ink">
            Terms of Use
          </h1>
          <p className="mt-4 text-sm text-muted">Last updated: May 20, 2026</p>
        </div>

        {/* Placeholder */}
        <section className="border-y border-rule py-8">
          <div className="max-w-2xl">
            <p className="text-body text-muted">The Terms of Use are being prepared.</p>
            <p className="mt-2 text-secondary text-muted">Contact support if you need the current terms before creating an account.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
