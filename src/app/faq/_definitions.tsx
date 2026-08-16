/**
 * The two words the rest of the page leans on. Every answer below says
 * "musician" or "creator" as if the reader already knows which one they are, so
 * this defines both before the questions start.
 *
 * Deliberately the one large blue moment on this surface — it is meant to be the
 * block you see before you read anything else. Not part of `_faq-content.ts`:
 * these are definitions, not Q&As, and they must stay out of the FAQPage JSON-LD.
 */

const ROLES = [
  {
    term: "Musician",
    definition:
      "You play, sing, produce, or compose. You publish a profile so creators can find you and offer you work.",
  },
  {
    term: "Creator",
    definition:
      "You are making a film, podcast, game, video, or event that needs music. You post gigs and reach out to musicians.",
  },
];

export function RoleDefinitions() {
  return (
    <section aria-labelledby="account-types" className="bg-brand p-6 md:p-8">
      <h2 id="account-types" className="text-meta uppercase text-on-brand-muted">
        Account types
      </h2>

      <dl className="mt-5 grid gap-6 md:grid-cols-2 md:gap-10">
        {ROLES.map(({ term, definition }) => (
          <div key={term}>
            <dt className="text-item-heading text-white">{term}</dt>
            <dd className="mt-2 max-w-md text-body text-on-brand-muted">{definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
