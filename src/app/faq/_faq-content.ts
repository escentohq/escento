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
          "Escento is a free directory where musicians and creators find each other for gigs and collaborations. Musicians publish a profile; creators post gigs. Either side can browse without an account, then send a connection request to start a conversation. There are no feeds, followers, or ratings.",
        links: [
          { href: "/musicians", label: "Browse musicians" },
          { href: "/gigs", label: "Browse gigs" },
        ],
      },
      {
        id: "is-escento-free",
        question: "Is Escento free to use?",
        answer:
          "Yes. Escento is free for musicians and creators — no fees, subscriptions, or commission. Profiles, gigs, browsing, and messaging all cost nothing. Escento does not process payments, so pay is arranged directly between you and the person you work with. Listings mark work as paid, unpaid, or negotiable.",
      },
      {
        id: "who-can-use-escento",
        question: "Who is Escento for?",
        answer:
          "Escento is for anyone making music, or making something that needs music — students, hobbyists, and working professionals alike. Musicians are performers, instrumentalists, vocalists, and producers. Creators are filmmakers, podcasters, YouTubers, game developers, and event organizers. There is no application step: you pick one side when you sign up.",
        links: [{ href: "/signup", label: "Create an account" }],
      },
      {
        id: "where-does-escento-work",
        question: "What cities does Escento cover?",
        answer:
          "Escento starts in twelve US markets: Austin, Round Rock, Frisco, Dallas, Fort Worth, Houston, San Antonio, Los Angeles, New York, Nashville, Atlanta, and Chicago. You can still enter any city. Both directories search within 5 to 100 miles of a city, and remote listings ignore distance entirely.",
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
          "Sign up, choose the musician role, and Escento walks you through four short steps: identity (name and bio), craft (instruments and genres), context (location and experience), and reach (remote and pay preferences). Your profile goes live as soon as you save the first step — fill in the rest whenever.",
        links: [
          { href: "/signup", label: "Create an account" },
          { href: "/musicians", label: "See the directory" },
        ],
      },
      {
        id: "how-do-musicians-get-found",
        question: "How do musicians get found on Escento?",
        answer:
          "Creators find you by browsing and filtering the musician directory — keyword search, instrument, genre, distance from a city, and remote. Search matches your name, bio, school, availability, location, and tags. Results are ordered by when a profile was last updated, so keeping yours current keeps you near the top.",
        links: [{ href: "/musicians", label: "Browse musicians" }],
      },
      {
        id: "what-instruments-and-genres-can-i-list",
        question: "What instruments and genres can I add to my profile?",
        answer:
          "Add any instrument or genre you want — they are free-form tags, entered as a comma-separated list. Escento merges the obvious variants, so “sax” becomes Saxophone and “keys” becomes Piano, which keeps filtering accurate. Twelve instruments and eleven genres are canonical; anything outside that list is created on demand.",
      },
      {
        id: "is-my-email-address-public",
        question: "Is my email address visible on my profile?",
        answer:
          "No. Escento never shows your email address on your public profile, and the public profile data the directory loads does not include it. Everyone reaches you through a connection request instead, so you decide who gets to message you before any conversation starts.",
      },
      {
        id: "how-do-musicians-get-contacted",
        question: "How do I get contacted for a gig?",
        answer:
          "Signed-in creators send a connection request from your public profile, usually with a short intro message. Escento emails you, and the request waits in your inbox until you accept or decline it. Accepting opens a direct conversation. You can also browse open gigs and send the first request yourself.",
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
          "Sign up, choose the creator role, and create a gig. You describe the project, pick a project type, set a location or mark it remote, say whether the work is paid, unpaid, or negotiable, and tag the instruments and genres you need. It goes live in the directory right away.",
        links: [
          { href: "/signup", label: "Create an account" },
          { href: "/gigs", label: "See the gig directory" },
        ],
      },
      {
        id: "what-goes-in-a-gig-listing",
        question: "What information should a gig listing include?",
        answer:
          "A gig has a title, a description, a project type (film, live event, podcast, game, YouTube, or other), a location or remote flag, a compensation type, an optional deadline, and instrument and genre tags. Musicians filter on those tags, so naming the instruments you actually need gets the most relevant responses.",
      },
      {
        id: "how-do-i-close-or-delete-a-gig",
        question: "How do I close or delete a gig?",
        answer:
          "Open your gig management page, where every gig you own has edit, mark filled, and delete actions. Marking a gig filled takes it out of the public directory but keeps the page reachable by direct link, and you can reopen it later. Deleting is permanent and cannot be undone.",
        links: [{ href: "/gigs", label: "Browse gigs" }],
      },
      {
        id: "how-do-creators-contact-musicians",
        question: "How do I contact a musician about my project?",
        answer:
          "Browse the musician directory, open a profile, and send a connection request with a short note about your project. The musician accepts or declines it; accepting opens a direct conversation. You can send requests whether or not you have posted a gig, and musicians can send you one first.",
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
          "Sign in with an email address and password, or with Google — those are the only two options today. If you forget your password, request a reset link from the sign-in page. Browsing the directories needs no account; you sign in only to create a listing or message someone.",
        links: [{ href: "/signup", label: "Create an account" }],
      },
      {
        id: "can-i-change-my-role",
        question: "Can I switch between a musician and a creator account?",
        answer:
          "No. You choose one role, musician or creator, the first time you sign in, and Escento does not support switching between them or holding both. There is no self-serve way to change it, so contact support if you picked the wrong one.",
        links: [{ href: "/help", label: "Contact support" }],
      },
      {
        id: "how-does-messaging-work",
        question: "How does messaging work on Escento?",
        answer:
          "Messaging starts with a connection request. The recipient accepts or declines it from their requests inbox, and only then does a direct one-to-one conversation open. Escento emails you when a request or a new message arrives, and you can block someone at any point to stop both.",
      },
      {
        id: "how-do-i-report-a-listing",
        question: "How do I report a profile or a gig?",
        answer:
          "Every public musician profile and gig listing has a report action for signed-in users. Creators report profiles, musicians report gigs, and you cannot report your own listing. Describe what is wrong, and the report goes to a moderation queue where an admin can hide the listing.",
        links: [{ href: "/help", label: "Contact support" }],
      },
      {
        id: "how-do-i-delete-my-account",
        question: "How do I delete my Escento account?",
        answer:
          "Open your account settings and use the delete account action. Deletion is permanent and immediate: your profile or gigs, conversations and messages, connection requests, blocks, profile picture, and sign-in credentials are all removed. There is no recovery and no grace period, so save anything you want first.",
        links: [{ href: "/help", label: "Contact support" }],
      },
    ],
  },
];

/** Flat list in page order — what the JSON-LD and the drift test both count. */
export const FAQ_ITEMS: FaqItem[] = FAQ_SECTIONS.flatMap((section) => section.items);
