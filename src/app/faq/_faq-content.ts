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
 * Content rules (from the ticket): 40–90 words, phrased the way a user types the
 * question into Google, and the first sentence answers it directly, because that
 * sentence is what gets lifted into the SERP. Describe only shipped behavior.
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
          "Escento is a free directory where musicians and creators find each other for gigs and collaborations. Musicians publish a profile listing their instruments, genres, and location. Creators post gigs describing the project and who they need. Either side can browse the other without an account, then send a connection request to start a conversation. It is not a social network — there are no feeds, followers, or ratings.",
        links: [
          { href: "/musicians", label: "Browse musicians" },
          { href: "/gigs", label: "Browse gigs" },
        ],
      },
      {
        id: "is-escento-free",
        question: "Is Escento free to use?",
        answer:
          "Yes. Escento is free for both musicians and creators, with no fees, subscriptions, or commission. Creating a profile, posting a gig, browsing, and messaging all cost nothing. Escento does not process payments, so anything you are paid for a gig is arranged directly between you and the person you work with. Gig listings mark compensation as paid, unpaid, or negotiable so you know before you reach out.",
      },
      {
        id: "who-can-use-escento",
        question: "Who is Escento for?",
        answer:
          "Escento is open to anyone making music or making something that needs music — students, hobbyists, semi-pros, and working professionals alike. Musicians are performers, instrumentalists, vocalists, and producers looking for gigs and collaborations. Creators are filmmakers, podcasters, YouTubers, game developers, and event organizers who need music for a project. There is no application or approval step: you pick one side, musician or creator, when you sign up.",
        links: [{ href: "/signup", label: "Create an account" }],
      },
      {
        id: "where-does-escento-work",
        question: "What cities does Escento cover?",
        answer:
          "Escento starts in twelve US markets: Austin, Round Rock, Frisco, Dallas, Fort Worth, Houston, San Antonio, Los Angeles, New York, Nashville, Atlanta, and Chicago. You can still enter any city when you set your location. Both directories let you search within a radius of 5 to 100 miles of a city, and musicians and gigs can be marked remote, which makes distance irrelevant.",
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
          "Sign up, choose the musician role, and Escento walks you through four short steps: identity (display name and bio), craft (instruments and genres), context (school, location, years of experience, availability), and reach (remote and pay preferences, plus portfolio links). Your profile appears in the musician directory as soon as you save the first step, and you can go back and fill in the rest whenever you want.",
        links: [
          { href: "/signup", label: "Create an account" },
          { href: "/musicians", label: "See the directory" },
        ],
      },
      {
        id: "how-do-musicians-get-found",
        question: "How do musicians get found on Escento?",
        answer:
          "Creators find you by browsing the musician directory and filtering it. They can search by keyword, filter by instrument and genre, narrow to a distance radius around a city, and include or exclude remote musicians. Search matches your name, bio, school, availability, location, and tags. Results are ordered by when a profile was last updated, so keeping yours current keeps you near the top.",
        links: [{ href: "/musicians", label: "Browse musicians" }],
      },
      {
        id: "what-instruments-and-genres-can-i-list",
        question: "What instruments and genres can I add to my profile?",
        answer:
          "Add any instrument or genre you want — they are free-form tags, entered as a comma-separated list. Escento recognizes common names and merges the obvious variants, so “sax” becomes Saxophone and “keys” becomes Piano, which keeps filtering accurate. Twelve instruments and eleven genres are canonical, covering guitar, drums, vocals, producer, jazz, hip hop, and film scoring among others, and anything outside that list is created on demand.",
      },
      {
        id: "is-my-email-address-public",
        question: "Is my email address visible on my profile?",
        answer:
          "No. Escento never shows your email address on your public profile, and the public profile data the directory loads does not include it. The contact email on your profile comes from your account and is used only inside Escento. Everyone reaches you through a connection request instead, so you decide who gets to message you before any conversation starts.",
      },
      {
        id: "how-do-musicians-get-contacted",
        question: "How do I get contacted for a gig?",
        answer:
          "Signed-in creators send you a connection request from your public profile, usually with a short intro message. Escento emails you, and the request waits in your inbox until you accept or decline it. Accepting opens a direct conversation where you can work out the details. You can also browse open gigs yourself and send the first request to a creator whose project fits you.",
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
          "Sign up, choose the creator role, and create a gig. You describe the project, pick a project type, set a location or mark it remote, say whether the work is paid, unpaid, or negotiable, and tag the instruments and genres you need. The gig goes live in the gig directory right away and stays open until you mark it filled or delete it.",
        links: [
          { href: "/signup", label: "Create an account" },
          { href: "/gigs", label: "See the gig directory" },
        ],
      },
      {
        id: "what-goes-in-a-gig-listing",
        question: "What information should a gig listing include?",
        answer:
          "A gig has a title, a description, a project type (film, live event, podcast, game, YouTube, or other), a location or remote flag, a compensation type with optional details, an optional deadline, and instrument and genre tags. Those tags are what musicians filter on, so naming the instruments you actually need is the single biggest thing you can do to get relevant responses.",
      },
      {
        id: "how-do-i-close-or-delete-a-gig",
        question: "How do I close or delete a gig?",
        answer:
          "Open your gig management page, where every gig you own has edit, mark filled, and delete actions. Marking a gig filled takes it out of the public gig directory; the page stays reachable by direct link and shows as filled, and you can reopen it later. Deleting removes the listing permanently and cannot be undone, so mark a gig filled if you might repost it.",
        links: [{ href: "/gigs", label: "Browse gigs" }],
      },
      {
        id: "how-do-creators-contact-musicians",
        question: "How do I contact a musician about my project?",
        answer:
          "Browse the musician directory, open a profile, and send a connection request with a short note about your project. The musician accepts or declines it; accepting opens a direct conversation where you can share the details. You can send requests whether or not you have posted a gig, and musicians who find your listing can send you a request first.",
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
          "Sign in with an email address and password, or with Google. Those are the only two options today. If you forget your password you can request a reset link from the sign-in page and set a new one from your account settings. Browsing the musician and gig directories needs no account at all — you only sign in to create a listing or message someone.",
        links: [{ href: "/signup", label: "Create an account" }],
      },
      {
        id: "can-i-change-my-role",
        question: "Can I switch between a musician and a creator account?",
        answer:
          "No. You choose one role, musician or creator, the first time you sign in, and Escento does not support switching between them or holding both. Musicians build a public profile and receive connection requests; creators post gigs and reach out to musicians. There is no self-serve way to change your role, so contact support if you picked the wrong one.",
        links: [{ href: "/help", label: "Contact support" }],
      },
      {
        id: "how-does-messaging-work",
        question: "How does messaging work on Escento?",
        answer:
          "Messaging starts with a connection request. A signed-in user sends the request with an optional intro message, and the recipient accepts or declines it from their requests inbox. Only after it is accepted does a direct one-to-one conversation open. Escento emails you when a request or a new message arrives, and you can block someone at any point to stop further requests and messages.",
      },
      {
        id: "how-do-i-report-a-listing",
        question: "How do I report a profile or a gig?",
        answer:
          "Every public musician profile and gig listing has a report action for signed-in users. Creators report musician profiles and musicians report gigs, and you cannot report your own listing. Describe what is wrong and add any supporting detail, and the report goes to a moderation queue where an admin can hide the listing. For anything else, including account problems, use the help page.",
        links: [{ href: "/help", label: "Contact support" }],
      },
      {
        id: "how-do-i-delete-my-account",
        question: "How do I delete my Escento account?",
        answer:
          "Open your account settings and use the delete account action. Deletion is permanent and immediate: it removes your profile or your gigs, your conversations and messages, your connection requests, your blocks, your profile picture, and your sign-in credentials. There is no recovery and no grace period, so save anything you want to keep first. Contact support if you hit a problem deleting.",
        links: [{ href: "/help", label: "Contact support" }],
      },
    ],
  },
];

/** Flat list in page order — what the JSON-LD and the drift test both count. */
export const FAQ_ITEMS: FaqItem[] = FAQ_SECTIONS.flatMap((section) => section.items);
