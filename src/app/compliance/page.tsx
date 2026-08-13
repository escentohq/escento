import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Compliance",
  description: "Escento Compliance - Data protection and regulatory compliance information.",
};

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] px-6 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
            Legal
          </span>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-[#0F172A]">
            Compliance
          </h1>
          <p className="mt-4 text-sm text-[#94A3B8]">Last updated: May 20, 2026</p>
        </div>

        {/* Placeholder */}
        <section className=" bg-white p-6 shadow-sm">
          <div className=" border-2 border-dashed border-[#E2E8F0] p-8 text-center">
            <p className="text-[#94A3B8]">Compliance information coming soon.</p>
            <p className="mt-2 text-sm text-[#CBD5E1]">Replace this section with your compliance HTML</p>
          </div>
        </section>
      </div>
    </div>
  );
}
