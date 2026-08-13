import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Escento Privacy Policy - Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper px-6 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Legal
          </span>
          <h1 className="mt-4 text-page-title text-ink">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-muted">
            Last updated: May 20, 2026
          </p>
        </div>

        {/* Overview */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">Overview</h2>
          <p className="mb-4 text-muted">
            This Privacy Notice for Escento (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) describes how
            and why we might access, collect, store, use, and/or share
            (&ldquo;process&rdquo;) your personal information when you use our services,
            including when you:
          </p>
          <ul className="ml-5 list-disc space-y-2 text-muted">
            <li>Visit our website at https://escento.com/</li>
            <li>
              Use Escento - a local marketplace platform that connects musicians
              with clients, event organizers, and creators seeking live music
              talent for weddings, events, podcasts, films, and other projects
            </li>
            <li>
              Engage with us in other related ways, including any marketing or
              events
            </li>
          </ul>
        </section>

        {/* Agreement to Privacy Policy */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">
            Agreement to Privacy Policy
          </h2>
          <p className="text-muted">
            By creating an account on Escento, using our Services, or accessing
            our website, you acknowledge that you have read this Privacy Policy
            and agree to be bound by its terms. If you do not agree with our
            policies and practices, please do not use our Services.
          </p>
        </section>

        {/* Product Description */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">
            Product Description
          </h2>
          <p className="text-muted">
            Escento is a local marketplace platform that connects musicians with
            clients, event organizers, and creators seeking live music talent
            for weddings, events, podcasts, films, and other projects. The
            platform allows musicians to create public profiles with their bio,
            instruments, genres, and portfolio links. Clients can browse
            musician profiles, post gigs, and initiate bookings. Users create
            accounts and can manage their profiles, apply to opportunities, or
            post gigs. Escento facilitates discovery and booking coordination
            between musicians and creators.
          </p>
        </section>

        {/* What Information Do We Collect */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">
            What Information Do We Collect?
          </h2>

          <h3 className="mb-3 mt-6 text-item-heading text-ink">
            Personal Information You Disclose
          </h3>
          <p className="mb-4 text-muted">
            We collect personal information that you voluntarily provide to us
            when you register on the Services. The personal information we
            collect may include:
          </p>
          <ul className="ml-5 list-disc space-y-2 text-muted">
            <li>Names</li>
            <li>Phone numbers</li>
            <li>Email addresses</li>
            <li>Mailing addresses</li>
            <li>Job titles</li>
            <li>Usernames</li>
            <li>Contact preferences</li>
            <li>Contact or authentication data</li>
          </ul>

          <h3 className="mb-3 mt-6 text-item-heading text-ink">
            Sensitive Information
          </h3>
          <p className="mb-4 text-muted">
            When necessary, with your consent or as otherwise permitted by
            applicable law, we process student data and account login
            information.
          </p>

          <h3 className="mb-3 mt-6 text-item-heading text-ink">
            Payment Data
          </h3>
          <p className="mb-4 text-muted">
            We may collect data necessary to process your payment if you choose
            to make purchases, such as your payment instrument number and
            security code. All payment data is handled and stored by Stripe. You
            may find their privacy notice at:{" "}
            <a
              href="https://stripe.com/privacy"
              className="text-brand hover:underline"
            >
              https://stripe.com/privacy
            </a>
          </p>

          <h3 className="mb-3 mt-6 text-item-heading text-ink">
            Information Automatically Collected
          </h3>
          <p className="mb-4 text-muted">
            Some information is collected automatically when you visit our
            Services, such as:
          </p>
          <ul className="ml-5 list-disc space-y-2 text-muted">
            <li>IP address and browser characteristics</li>
            <li>Operating system and language preferences</li>
            <li>Device information and location data</li>
            <li>Log and usage data about your activity</li>
          </ul>
        </section>

        {/* How Do We Process */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">
            How Do We Process Your Information?
          </h2>
          <p className="mb-4 text-muted">We process your information to:</p>
          <ul className="ml-5 list-disc space-y-2 text-muted">
            <li>Facilitate account creation and authentication</li>
            <li>Deliver and facilitate delivery of services</li>
            <li>Respond to user inquiries and provide support</li>
            <li>Fulfill and manage your orders</li>
            <li>Enable user-to-user communications</li>
            <li>Request feedback and contact you about usage</li>
            <li>Send marketing and promotional communications</li>
            <li>Deliver targeted advertising</li>
            <li>Protect our Services and prevent fraud</li>
            <li>Evaluate and improve our Services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        {/* Sharing Information */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">
            When and With Whom Do We Share Your Personal Information?
          </h2>
          <p className="mb-4 text-muted">
            We may share information in the following situations:
          </p>
          <ul className="ml-5 list-disc space-y-2 text-muted">
            <li>
              <strong>Business Transfers:</strong> We may share or transfer your
              information in connection with any merger, sale of company assets,
              financing, or acquisition
            </li>
            <li>
              <strong>Affiliates:</strong> We may share your information with
              our affiliates, in which case we will require them to honor this
              Privacy Notice
            </li>
            <li>
              <strong>Business Partners:</strong> We may share your information
              with business partners to offer you certain products, services, or
              promotions
            </li>
            <li>
              <strong>Other Users:</strong> Personal information shared on the
              Services may be viewed by all users and made publicly available
            </li>
          </ul>
        </section>

        {/* Third-Party Websites */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">
            Third-Party Websites
          </h2>
          <p className="text-muted">
            The Services may link to third-party websites, online services, or
            mobile applications. We are not responsible for the safety of any
            information you share with these third parties. We cannot guarantee
            the safety and privacy of data provided to any third-party websites.
            Any data collected by third parties is not covered by this Privacy
            Notice.
          </p>
        </section>

        {/* Cookies */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">
            Cookies and Tracking Technologies
          </h2>
          <p className="mb-4 text-muted">
            We may use cookies and similar tracking technologies (like web
            beacons and pixels) to gather information when you interact with our
            Services. Some online tracking technologies help us maintain the
            security of our Services and your account, prevent crashes, fix
            bugs, save your preferences, and assist with basic site functions.
          </p>
          <p className="text-muted">
            We also permit third parties and service providers to use online
            tracking technologies on our Services for analytics and advertising,
            including to help manage and display advertisements tailored to your
            interests.
          </p>
        </section>

        {/* Social Media Login */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">
            Social Media Login
          </h2>
          <p className="mb-4 text-muted">
            Our Services offer you the ability to register and log in using your
            third-party social media account details (like your Google,
            Facebook, or other social media logins). Where you choose to do
            this, we will receive certain profile information about you from
            your social media provider, which may include your name, email
            address, friends list, and profile picture.
          </p>
          <p className="text-muted">
            We do not control, and are not responsible for, other uses of your
            personal information by your third-party social media provider. We
            recommend reviewing their privacy notice to understand how they
            collect, use, and share your personal information.
          </p>
        </section>

        {/* Data Retention */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">
            How Long Do We Keep Your Information?
          </h2>
          <p className="text-muted">
            We keep your personal information for as long as it is necessary for
            the purposes set out in this Privacy Notice, unless a longer
            retention period is required by law. When we have no ongoing
            legitimate business need to process your personal information, we
            will delete or anonymize it.
          </p>
        </section>

        {/* Security */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">
            How Do We Keep Your Information Safe?
          </h2>
          <p className="text-muted">
            We have implemented appropriate technical and organizational
            security measures designed to protect the security of any personal
            information we process. However, no electronic transmission over the
            Internet or information storage technology can be guaranteed to be
            100% secure. We cannot promise or guarantee that hackers,
            cybercriminals, or other unauthorized third parties will not be able
            to defeat our security and improperly collect, access, steal, or
            modify your information.
          </p>
        </section>

        {/* Privacy Rights */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">
            Your Privacy Rights
          </h2>
          <p className="mb-4 text-muted">
            Depending on your location, you may have certain rights regarding
            your personal information, including:
          </p>
          <ul className="ml-5 list-disc space-y-2 text-muted">
            <li>
              <strong>Right to know</strong> whether or not we are processing
              your personal data
            </li>
            <li>
              <strong>Right to access</strong> your personal data
            </li>
            <li>
              <strong>Right to correct</strong> inaccuracies in your personal
              data
            </li>
            <li>
              <strong>Right to request deletion</strong> of your personal data
            </li>
            <li>
              <strong>Right to obtain a copy</strong> of the personal data you
              shared with us
            </li>
            <li>
              <strong>Right to non-discrimination</strong> for exercising your
              rights
            </li>
            <li>
              <strong>Right to opt out</strong> of targeted advertising and data
              sales
            </li>
          </ul>

          <h3 className="mb-3 mt-6 text-item-heading text-ink">
            How to Exercise Your Rights
          </h3>
          <p className="mb-4 text-muted">
            To exercise these rights, you can contact us at the email or address
            provided below. We will consider and act upon any request in
            accordance with applicable data protection laws.
          </p>

          <h3 className="mb-3 mt-6 text-item-heading text-ink">
            Account Information
          </h3>
          <p className="text-muted">
            If you would like to review or change the information in your
            account or terminate your account, you can log in to your account
            settings and update your user account. Upon your request to
            terminate your account, we will deactivate or delete your account
            and information from our active databases. However, we may retain
            some information in our files to prevent fraud, troubleshoot
            problems, assist with investigations, enforce legal terms, or comply
            with legal requirements.
          </p>
        </section>

        {/* DNT */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">
            Do-Not-Track Features
          </h2>
          <p className="text-muted">
            Most web browsers include a Do-Not-Track (DNT) feature or setting
            you can activate to signal your privacy preference. At this stage,
            no uniform technology standard for recognizing DNT signals has been
            finalized. As such, we do not currently respond to DNT browser
            signals. If a standard is adopted that we must follow in the future,
            we will inform you in a revised version of this Privacy Notice.
          </p>
        </section>

        {/* Updates */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">
            Updates to This Notice
          </h2>
          <p className="text-muted">
            We may update this Privacy Notice from time to time. The updated
            version will be indicated by an updated &ldquo;Revised&rdquo; date. If we make
            material changes, we may notify you by prominently posting a notice
            or by directly sending you a notification. We encourage you to
            review this Privacy Notice frequently to be informed of how we are
            protecting your information.
          </p>
        </section>

        {/* Contact */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">Contact Us</h2>
          <p className="text-muted">
            If you have questions or comments about this notice, you may contact
            us at:
          </p>
          <p className="mt-4 text-muted">
            <strong>Escento</strong>
            <br />
            [Your Address]
            <br />
            [Your Email]
            <br />
            [Your Phone]
          </p>
        </section>

        {/* Review Data */}
        <section className="border-t border-rule py-8">
          <h2 className="mb-4 text-section-heading text-ink">
            Review, Update, or Delete Your Data
          </h2>
          <p className="mb-4 text-muted">
            Based on the applicable laws of your country or state of residence,
            you may have the right to request access to the personal information
            we collect from you, details about how we have processed it, correct
            inaccuracies, or delete your personal information. You may also have
            the right to withdraw your consent to our processing of your
            personal information.
          </p>
          <p className="text-muted">
            To request to review, update, or delete your personal information,
            please contact us using the information provided above.
          </p>
        </section>
      </div>
    </div>
  );
}
