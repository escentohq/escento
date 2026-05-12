// TEMPLATE — DO NOT LINK FROM GALLERY.
// Copy this folder to `app/mockups/<your-slug>/` and matching
// `components/mockups/<your-slug>/` then customize.
//
// Slug convention: `<author>-<NN>` e.g. `you-03`, `partner-07`.
//
// Rules:
//   1. Only import from `components/mockups/<your-slug>/*` or
//      `components/mockups/_shared/*`. Never cross-import other mockups.
//   2. Page-local state/animations stay in your folder.
//   3. When promoted to real landing: move components out, drop slug prefix,
//      delete this route.

import { Hero } from "@/components/mockups/_template/Hero";
import { Features } from "@/components/mockups/_template/Features";
import { CTA } from "@/components/mockups/_template/CTA";

export default function TemplateMockup() {
  return (
    <main>
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}
