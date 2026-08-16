import { type Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that apply when you use Escento.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <section>
        <h2>What Escento is</h2>
        <p>
          Escento is a directory and messaging service for student musicians and student creators.
          Musicians publish a profile. Creators publish gigs. Anyone can browse. Signed-in users can
          send a connection request and, if it is accepted, message each other.
        </p>
        <p className="mt-4">
          Escento does not take payment, hold funds, write contracts, or guarantee that anyone will
          be hired. Work that starts on Escento is arranged off the service, between the people
          involved.
        </p>
      </section>

      <section>
        <h2>Eligibility</h2>
        <p>
          You must be at least 18 and able to form a binding contract. The service is intended for
          university students and recent graduates in the United States. If you create an account
          for an organization, you confirm you have authority to bind it.
        </p>
      </section>

      <section>
        <h2>Accounts</h2>
        <p>
          You need an account to publish a profile or gig, or to message anyone. You may sign up
          with email and a password, or with Google. You choose one role — Musician or Creator —
          once. That choice cannot be switched in the current product.
        </p>
        <p className="mt-4">
          Keep your sign-in details to yourself. You are responsible for activity on your account.
          You can update your name and profile picture, and you can delete your account, from{" "}
          <Link href="/account">Account</Link>. Deletion removes your account, public listings,
          messages, and profile picture, subject to the{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>
          Do not use Escento to harass, impersonate, scam, spam, or post anything illegal. Do not
          scrape the directories or try to access another account. The{" "}
          <Link href="/compliance">Acceptable Use</Link> page is part of these terms.
        </p>
      </section>

      <section>
        <h2>Your content</h2>
        <p>
          You keep what you post: profile text, photos, gig copy, messages, and reports. You grant
          Escento a non-exclusive license to host, display, and transmit that content so the
          service can run — including showing public profiles and open gigs to people who are not
          signed in.
        </p>
        <p className="mt-4">
          You confirm you have the rights to what you post, and that it is accurate enough to be
          useful. We may hide or remove content that breaks these terms or the Acceptable Use
          rules, including after a report.
        </p>
      </section>

      <section>
        <h2>Off-platform work</h2>
        <p>
          If you agree to a gig, pay, schedule, or deliver work, you do that off Escento. We are
          not a party to those arrangements and we do not mediate payment disputes. Say what the
          project actually is. Do not use a listing to collect personal data you do not need.
        </p>
      </section>

      <section>
        <h2>Termination</h2>
        <p>
          You can delete your account at any time. We can suspend or delete an account, or hide
          content, if we believe these terms or the Acceptable Use rules were broken, or if we
          have to in order to protect other users or the service. We will try to say why when we
          can.
        </p>
      </section>

      <section>
        <h2>Disclaimers and liability</h2>
        <p>
          Escento is provided as is. We do not warrant that a listing is current, that a person is
          who they say they are, or that the service will be uninterrupted. To the fullest extent
          the law allows, Escento is not liable for off-platform arrangements, user content, or
          indirect or consequential damages. Our total liability for a claim about the service is
          limited to fifty US dollars.
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of the State of Texas, United States, without
          regard to conflict-of-law rules. Courts in Travis County, Texas have exclusive
          jurisdiction, unless applicable law requires otherwise.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          We may update these terms. The date at the top of this page will change. If a change is
          material, we will say so on the site. Continued use after an update means you accept the
          new terms.
        </p>
      </section>
    </LegalPage>
  );
}
