import { type Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { PageShell } from "@/components/ui/page-shell";
import { SITE_URL } from "@/lib/site";

import { RoleDefinitions } from "./_definitions";
import { FAQ_ITEMS, FAQ_SECTIONS } from "./_faq-content";

const description =
  "Answers about how Escento works: what it costs, how musicians get found, how creators post gigs, how messaging and reporting work, and how to delete an account.";

export const metadata: Metadata = {
  title: "FAQ",
  description,
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Escento FAQ",
    description,
    url: `${SITE_URL}/faq`,
    siteName: "Escento",
    type: "website",
  },
};

/**
 * Built from the same constant the page renders, so the structured data cannot
 * describe answers a visitor does not see. `answer` is plain text by contract in
 * `_faq-content.ts`, which is what lets it be serialized verbatim here.
 */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/faq`,
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <PageShell
        eyebrow="Support"
        title="Frequently asked questions"
        body="How Escento works for musicians and creators — what it costs, how people find each other, and what happens to your account and your data."
        size="medium"
      >
        <div className="flex flex-col gap-12">
          <RoleDefinitions />

          {FAQ_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-section-heading text-ink">{section.title}</h2>

              <div className="mt-6 border-t border-rule">
                {section.items.map((item) => (
                  // `open` by default: a collapsed answer is client state, and
                  // Google indexes the server HTML. Everything here ships expanded.
                  <details
                    key={item.id}
                    id={item.id}
                    open
                    className="group scroll-mt-24 border-b border-rule"
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
                      <h3 className="text-item-heading text-ink">{item.question}</h3>
                      <ChevronDown
                        aria-hidden="true"
                        className="mt-1 size-5 shrink-0 text-muted transition-transform group-open:rotate-180"
                      />
                    </summary>

                    <div className="pb-6">
                      <p className="max-w-2xl text-body text-muted">{item.answer}</p>

                      {item.links?.length ? (
                        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                          {item.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="text-secondary text-brand hover:underline"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </p>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <section className="border border-border-strong bg-surface p-6 md:p-8">
            <h2 className="text-item-heading text-ink">Still need help?</h2>
            <p className="mt-2 max-w-2xl text-body text-muted">
              If your question is not here, send us the details and we will look into it.
            </p>
            <Link href="/help" className="control-primary mt-5">
              Contact support
            </Link>
          </section>
        </div>
      </PageShell>
    </>
  );
}
