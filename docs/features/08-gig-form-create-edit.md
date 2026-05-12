# Gig Form, Create, and Edit

## Feature Summary
This feature lets creators post and update structured gig listings. The shared form captures project details, requirements, logistics, deadline, compensation, and tag CSVs. Server actions validate ownership and persist gig records plus tag joins.

## Product Intent
- Give musicians enough structure to judge fit quickly.
- Let creators publish in minutes.
- Keep edit rights restricted to the gig owner.

## Routes and Files
- `/gigs/create`
- `/gigs/[id]/edit`
- `src/app/gigs/_gig-form.tsx`
- `src/app/gigs/create/page.tsx`
- `src/app/gigs/create/actions.ts`
- `src/app/gigs/[id]/edit/page.tsx`
- `src/app/gigs/[id]/edit/actions.ts`

## Relevant Source Code

```tsx
// src/app/gigs/_gig-form.tsx
export type GigFormInitial = {
  title: string;
  description: string;
  projectType: string;
  location: string;
  isRemote: boolean;
  compensationType: string;
  compensationDetails: string;
  deadline: string;
  instrumentsCsv: string;
  genresCsv: string;
};

export function GigForm({ initial = emptyInitial, action, submitLabel, cancelHref }: {
  initial?: Partial<GigFormInitial>;
  action: (fd: FormData) => Promise<void>;
  submitLabel: string;
  cancelHref: string;
}) {
  const values = { ...emptyInitial, ...initial };
  return (
    <form action={action} className="space-y-8">
      <input name="title" defaultValue={values.title} required />
      <textarea name="description" defaultValue={values.description} required />
      <select name="projectType" required defaultValue={values.projectType}>
        <option value="FILM">Film</option>
        <option value="LIVE_EVENT">Live event</option>
        <option value="PODCAST">Podcast</option>
        <option value="GAME">Game</option>
        <option value="YOUTUBE">YouTube</option>
        <option value="OTHER">Other</option>
      </select>
      <input name="instrumentsCsv" defaultValue={values.instrumentsCsv} />
      <input name="genresCsv" defaultValue={values.genresCsv} />
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}
```

```tsx
// src/app/gigs/create/page.tsx
export default async function CreateGigPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role !== "CREATOR") redirect("/");

  return <GigForm action={createGig} submitLabel="Publish Gig" cancelHref="/gigs" />;
}
```

```ts
// src/app/gigs/create/actions.ts
export async function createGig(fd: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role !== "CREATOR") redirect("/");

  const title = strOrEmpty(fd.get("title")).trim();
  const description = strOrEmpty(fd.get("description")).trim();
  const projectType = strOrEmpty(fd.get("projectType")).trim();
  const compensationType = strOrEmpty(fd.get("compensationType")).trim();

  if (!title) throw new Error("Title is required.");
  if (!description) throw new Error("Description is required.");
  if (!projectType) throw new Error("Project type is required.");
  if (!compensationType) throw new Error("Compensation type is required.");
}
```

```tsx
// src/app/gigs/[id]/edit/page.tsx
const gig = await db.gig.findUnique({
  where: { id },
  include: {
    instruments: { include: { instrument: true } },
    genres: { include: { genre: true } },
  },
});

if (!gig || gig.creatorId !== session.user.id) redirect("/gigs/manage");

<GigForm initial={initial} action={updateGig.bind(null, id)} submitLabel="Save changes" cancelHref="/gigs/manage" />
```

```ts
// src/app/gigs/[id]/edit/actions.ts
const gig = await db.gig.findUnique({
  where: { id: gigId },
  select: { creatorId: true },
});
if (!gig || gig.creatorId !== session.user.id) redirect("/gigs/manage");

await tx.gigInstrument.deleteMany({ where: { gigId } });
await tx.gigGenre.deleteMany({ where: { gigId } });
await tx.gig.update({ where: { id: gigId }, data: { title, description, projectType: projectType as never } });
```

## How It Works
Create and edit pages are server-gated to `CREATOR`. Create posts a new gig and redirects to its detail page. Edit loads the gig, verifies ownership, maps existing join rows into CSV strings, binds the gig ID into the update action, and redirects to the detail page after saving.

Both actions use the same parsing pattern as musician profiles: trim strings, parse optional dates, parse CSV tags, ensure tag rows exist, then create join rows. Edit deletes old joins and recreates them.

## Implementation Details for an LLM
Any new gig field requires updates in the Prisma schema, `GigFormInitial`, `emptyInitial`, create action parser, edit initial mapper, edit action parser, directory cards, detail page, and possibly filters.

## Issues and Improvements
- `projectType as never` and `compensationType as never` bypass stronger typing. Validate against enum values explicitly.
- Form validation errors are thrown, not displayed inline.
- No pending submit state exists for gig form.
- Tag creation duplicates case variants.
- Edit deletes/recreates tag joins, which is simple but loses future join-level metadata.

