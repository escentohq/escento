# Gig Management, Close, and Delete

## Feature Summary
The manage page is the creator-only dashboard for viewing owned gigs, editing them, marking them filled, deleting them, and opening their public detail pages.

## Product Intent
- Give creators a simple operational surface for listings.
- Support the full MVP lifecycle: create, edit, close, delete.
- Keep ownership checks on the server for every mutation.

## Routes and Files
- `/gigs/manage`
- `src/app/gigs/manage/page.tsx`
- `src/app/gigs/manage/actions.ts`
- `src/app/gigs/manage/DeleteGigButton.tsx`
- `/gigs/[id]/edit`

## Relevant Source Code

```tsx
// src/app/gigs/manage/page.tsx
export default async function ManageGigsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role !== "CREATOR") redirect("/");

  const gigs = await db.gig.findMany({
    where: { creatorId: session.user.id },
    include: {
      instruments: { include: { instrument: true } },
      genres: { include: { genre: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}
```

```tsx
// Action buttons
<Link href={`/gigs/${g.id}/edit`} className="btn-ghost">Edit</Link>
{!isClosed && (
  <form action={closeGig.bind(null, g.id)} className="inline">
    <button type="submit" className="btn-ghost">Mark filled</button>
  </form>
)}
<DeleteGigButton gigId={g.id} />
<Link href={`/gigs/${g.id}`}>View →</Link>
```

```ts
// src/app/gigs/manage/actions.ts
async function ensureCreatorOwnsGig(gigId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role !== "CREATOR") redirect("/");

  const gig = await db.gig.findUnique({
    where: { id: gigId },
    select: { creatorId: true },
  });
  if (!gig || gig.creatorId !== session.user.id) redirect("/gigs/manage");
  return session;
}

export async function closeGig(gigId: string) {
  await ensureCreatorOwnsGig(gigId);
  await db.gig.update({ where: { id: gigId }, data: { status: "CLOSED" } });
  redirect("/gigs/manage");
}
```

```tsx
// src/app/gigs/manage/DeleteGigButton.tsx
"use client";

export function DeleteGigButton({ gigId }: { gigId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => {
        if (!confirm("Delete this gig? This cannot be undone.")) return;
        startTransition(() => deleteGig(gigId));
      }}
      disabled={isPending}
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
```

## How It Works
The page requires an authenticated `CREATOR` and lists only gigs owned by that user. The close and delete actions share `ensureCreatorOwnsGig`, which repeats auth, role, and ownership validation before changing data.

Closing sets `status` to `CLOSED`; it does not delete the record. Deleting removes gig tag joins in a transaction before deleting the gig itself. The delete button is client-side because it uses browser `confirm()` and `useTransition`.

## Implementation Details for an LLM
Keep destructive and ownership-sensitive operations in server actions. Never trust the `gigId` passed from the client. Use the shared ownership helper pattern for any future creator-only gig action.

## Issues and Improvements
- Closing is irreversible in the UI; add a reopen action if needed.
- Delete uses native `confirm()`, which is acceptable for MVP but not polished.
- No optimistic UI or toast feedback after close/delete.
- No bulk management or archive view.
- `deleteGig` manually removes joins because schema lacks cascade deletes.

