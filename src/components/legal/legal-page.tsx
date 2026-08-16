import type { ReactNode } from "react";

import { SITE_URL } from "@/lib/site";

export const LEGAL_UPDATED_ON = "August 16, 2026";
export const LEGAL_CONTACT_EMAIL = "support@escento.com";
export const LEGAL_HELP_HREF = "/help";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-paper px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12">
          <h1 className="text-page-title text-ink">{title}</h1>
          <p className="mt-4 text-sm text-muted">Last updated: {LEGAL_UPDATED_ON}</p>
        </div>
        <div className="space-y-0 text-body text-muted [&_a]:text-brand [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:mb-4 [&_h2]:mt-0 [&_h2]:text-section-heading [&_h2]:text-ink [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-item-heading [&_h3]:text-ink [&_li]:leading-relaxed [&_p]:leading-relaxed [&_section]:border-t [&_section]:border-rule [&_section]:py-8 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
          {children}
        </div>
        <p className="border-t border-rule pt-8 text-sm text-muted">
          Questions:{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-brand underline-offset-4 hover:underline">
            {LEGAL_CONTACT_EMAIL}
          </a>{" "}
          or the{" "}
          <a href={LEGAL_HELP_HREF} className="text-brand underline-offset-4 hover:underline">
            help form
          </a>
          . Site:{" "}
          <a href={SITE_URL} className="text-brand underline-offset-4 hover:underline">
            {SITE_URL}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
