import { type Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Escento collects, uses, shares, and deletes personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <section>
        <h2>Scope</h2>
        <p>
          This policy describes the personal information Escento actually collects when you use{" "}
          <a href="https://www.escento.com">www.escento.com</a>: accounts, public profiles and
          gigs, messaging, support, and the operators who keep the service running. It does not
          cover websites you link to from a profile or gig.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <h3>You give us</h3>
        <ul>
          <li>Account: name, email, password (if you do not use Google), role, profile picture.</li>
          <li>
            Musician profile: display name, optional bio, school, location, remote and paid/unpaid
            preferences, years of experience, availability, portfolio links, instruments, and
            genres.
          </li>
          <li>
            Gig: title, description, project type, location or remote, pay type and details,
            deadline, instruments, and genres.
          </li>
          <li>Messages and connection-request notes between users.</li>
          <li>Reports you file about a profile, gig, or person, and messages you send to support.</li>
        </ul>
        <p className="mt-4">
          We do not collect phone numbers, mailing addresses, or job titles. We do not take
          payment information. There is no checkout.
        </p>

        <h3>Google sign-in</h3>
        <p>
          If you sign in with Google, we receive the name, email, and profile photo Google sends
          for that sign-in. We do not request your Google contacts, friends list, or other Google
          data.
        </p>

        <h3>Location lookup</h3>
        <p>
          When you type a city into a profile, gig, or directory filter, the request is sent to
          Geoapify so we can store a place name and coordinates. We do not continuously track your
          device.
        </p>

        <h3>Collected automatically</h3>
        <p>
          Vercel, which hosts the site, and Vercel Analytics / Speed Insights record standard
          request and performance data (for example pages viewed and coarse device information).
          We use session cookies so you stay signed in. We do not run advertising pixels or
          sell lists to advertisers.
        </p>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>Create and keep your account, and show you the right tools for your role.</li>
          <li>Publish the public parts of profiles and open gigs so people can find each other.</li>
          <li>Deliver connection requests and messages, including email notices when those fire.</li>
          <li>Receive support mail and content reports, and let operators moderate the service.</li>
          <li>Keep the site up, debug it, and understand which pages are slow or unused.</li>
        </ul>
        <p className="mt-4">
          We do not send marketing newsletters, and we do not use your data for targeted
          advertising.
        </p>
      </section>

      <section>
        <h2>What is public</h2>
        <p>
          A musician profile that meets the listing threshold is visible to anyone, including
          people who are not signed in. An open gig is visible the same way. A closed gig stays
          reachable from a direct link as a filled record. Your email is not shown on those
          pages. Messages are visible only to the people in the conversation and to operators
          when they need them to run support or safety.
        </p>
      </section>

      <section>
        <h2>Who we share it with</h2>
        <p>We share information with the processors that run the product, not with advertisers:</p>
        <ul>
          <li>Supabase — authentication, database, and profile-picture storage.</li>
          <li>Vercel — hosting, analytics, and speed insights.</li>
          <li>Resend — transactional email (welcome, messaging notices, support, reports).</li>
          <li>Geoapify — place lookup when you enter a location.</li>
          <li>Google — only if you choose Google sign-in.</li>
        </ul>
        <p className="mt-4">
          Other users see what you publish and what you send them. We may disclose information if
          the law requires it, or if we transfer the service to a successor who continues it.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          We keep account and listing data while the account exists. When you delete your
          account, we remove the account row, public listings, messages and requests you were
          part of, and the profile picture. Auth and file storage are cleaned up as part of that
          process. Operators may retain a limited record of a report or a safety action if they
          need it to investigate abuse. Hosting and email logs follow those providers&apos; own
          retention.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can edit your name, picture, profile, and gigs while signed in. You can delete your
          account from <Link href="/account">Account</Link>. You can close a gig so it leaves the
          open directory. You can ask us to correct or delete data we hold by writing to
          support. We do not sell personal information.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          Escento is not directed at children under 18. We do not knowingly collect personal
          information from them. If you think we have, contact support and we will delete it.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If this policy changes, we will update the date at the top of the page. If a change is
          material, we will say so on the site.
        </p>
      </section>
    </LegalPage>
  );
}
