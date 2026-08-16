/**
 * The FAQ, as data.
 *
 * Both the visible page and the `FAQPage` JSON-LD are generated from this one
 * constant, which is the point: structured data that drifts from the text a
 * visitor sees is a Google manual-action risk, and a hand-maintained second copy
 * always drifts eventually. `e2e/faq.spec.ts` asserts the rendered question count
 * and the JSON-LD entry count both match this array.
 *
 * `answer` is therefore plain text with no markup — it is serialized verbatim
 * into JSON-LD. Cross-links live in `links`, rendered after the paragraph, so
 * the indexed answer and the visible answer stay byte-identical.
 *
 * Content rules: keep answers under about 50 words, phrased the way a user types
 * the question into Google, with the first sentence answering it directly —
 * that sentence is what gets lifted into the SERP. Describe only shipped behavior.
 */

export type FaqLink = {
  href: string;
  label: string;
};

export type FaqItem = {
  /** Stable kebab-case slug. Doubles as the heading anchor — do not rename casually. */
  id: string;
  question: string;
  answer: string;
  links?: FaqLink[];
};

export type FaqSection = {
  id: string;
  title: string;
  items: FaqItem[];
};

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "general",
    title: "General",
    items: [
      {
        id: "what-is-escento",
        question: "What is Escento?",
        answer:
          "Escento helps musicians find gigs and helps creators find musicians. Anyone can browse. You need an account to publish a listing or send a request.",
        links: [
          { href: "/musicians", label: "Browse musicians" },
          { href: "/gigs", label: "Browse gigs" },
        ],
      },
      {
        id: "is-escento-free",
        question: "Is Escento free to use?",
        answer:
          "Yes. Escento has no fees, subscriptions, or commission. Escento does not process payments, so you arrange payment directly with the other person.",
      },
      {
        id: "who-can-use-escento",
        question: "Who is Escento for?",
        answer:
          "Escento is for musicians and people hiring them. That includes performers, producers, filmmakers, podcasters, game developers, and event organizers. Choose one role when you sign up.",
        links: [{ href: "/signup", label: "Create an account" }],
      },
      {
        id: "where-does-escento-work",
        question: "What cities does Escento cover?",
        answer:
          "Escento starts in 12 US markets, but you can enter any city. Directory searches cover 5 to 100 miles from a city. Remote listings are not limited by distance.",
      },
    ],
  },
  {
    id: "musicians",
    title: "For musicians",
    items: [
      {
        id: "how-do-i-create-a-musician-profile",
        question: "How do I create a musician profile?",
        answer:
          "Sign up, choose Musician, and add your name, bio, instruments, genres, location, availability, and work links. Your profile is listed after the first step. You can finish it later.",
        links: [
          { href: "/signup", label: "Create an account" },
          { href: "/musicians", label: "See the directory" },
        ],
      },
      {
        id: "how-do-musicians-get-found",
        question: "How do musicians get found on Escento?",
        answer:
          "Creators can search by keyword, instrument, genre, location, distance, and remote availability. Results show recently updated profiles first.",
        links: [{ href: "/musicians", label: "Browse musicians" }],
      },
      {
        id: "what-instruments-and-genres-can-i-list",
        question: "What instruments and genres can I add to my profile?",
        answer:
          "Add instruments and genres as a comma-separated list. Escento combines common variants, such as “sax” and Saxophone, to keep filters consistent.",
      },
      {
        id: "is-my-email-address-public",
        question: "Is my email address visible on my profile?",
        answer:
          "No. Your email address is not included in your public profile. People contact you by sending a request, which you can accept or decline.",
      },
      {
        id: "how-do-musicians-get-contacted",
        question: "How do I get contacted for a gig?",
        answer:
          "A creator can send a request from your profile. You can accept or decline it. Accepting opens a direct conversation. You can also send a request from an open gig.",
        links: [{ href: "/gigs", label: "Browse open gigs" }],
      },
    ],
  },
  {
    id: "creators",
    title: "For creators",
    items: [
      {
        id: "how-do-i-post-a-gig",
        question: "How do I post a gig?",
        answer:
          "Sign up, choose Creator, and describe the project. Add the project type, location or remote status, pay, deadline, instruments, and genres. The gig is listed when you publish it.",
        links: [
          { href: "/signup", label: "Create an account" },
          { href: "/gigs", label: "See the gig directory" },
        ],
      },
      {
        id: "what-goes-in-a-gig-listing",
        question: "What information should a gig listing include?",
        answer:
          "Include what you are making, which musicians you need, where the work happens, the pay, and the deadline. Specific instrument and genre tags help musicians find the listing.",
      },
      {
        id: "how-do-i-close-or-delete-a-gig",
        question: "How do I close or delete a gig?",
        answer:
          "Open Manage gigs. Marking a gig filled removes it from the directory, but its direct link still works and you can reopen it. Deleting a gig is permanent.",
        links: [{ href: "/gigs", label: "Browse gigs" }],
      },
      {
        id: "how-do-creators-contact-musicians",
        question: "How do I contact a musician about my project?",
        answer:
          "Open a musician profile and send a request with a short project note. If they accept, a direct conversation opens. You do not need to post a gig first.",
        links: [{ href: "/musicians", label: "Browse musicians" }],
      },
    ],
  },
  {
    id: "account-and-safety",
    title: "Account and safety",
    items: [
      {
        id: "how-do-i-sign-in",
        question: "How do I sign in to Escento?",
        answer:
          "Sign in with email and password or Google. You can request a password-reset link from the sign-in page. Browsing does not require an account.",
        links: [{ href: "/signup", label: "Create an account" }],
      },
      {
        id: "can-i-change-my-role",
        question: "Can I switch between a musician and a creator account?",
        answer:
          "No. You choose Musician or Creator once. Contact support if you chose the wrong role.",
        links: [{ href: "/help", label: "Contact support" }],
      },
      {
        id: "how-does-messaging-work",
        question: "How does messaging work on Escento?",
        answer:
          "Messaging starts with a request. If the recipient accepts, a private one-to-one conversation opens. Escento emails you about new requests and messages. You can block someone at any time.",
      },
      {
        id: "how-do-i-report-a-listing",
        question: "How do I report a profile or a gig?",
        answer:
          "Signed-in users can report a profile or gig they do not own. Add a short explanation. An admin will review the report and can hide the listing.",
        links: [{ href: "/help", label: "Contact support" }],
      },
      {
        id: "how-do-i-delete-my-account",
        question: "How do I delete my Escento account?",
        answer:
          "Open Account settings and choose Delete account. This permanently removes your listings, messages, requests, blocks, profile picture, and sign-in credentials. It cannot be undone.",
        links: [{ href: "/help", label: "Contact support" }],
      },
    ],
  },
];

/** Flat list in page order — what the JSON-LD and the drift test both count. */
export const FAQ_ITEMS: FaqItem[] = FAQ_SECTIONS.flatMap((section) => section.items);
