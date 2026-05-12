# Musician Profile Form, Create, and Edit

## Feature Summary
This feature lets a musician create and maintain their single public profile. The shared client form collects identity, preferences, instruments, genres, portfolio links, and contact email; server actions validate and persist the profile plus tag joins.

## Product Intent
- Give musicians a simple profile that creators can skim and contact.
- Make instruments and genres filterable.
- Keep portfolio link-only for MVP.
- Enforce one profile per musician.

## Routes and Files
- `/profile/create`
- `/profile/edit`
- `src/app/profile/_profile-form.tsx`
- `src/app/profile/create/page.tsx`
- `src/app/profile/create/actions.ts`
- `src/app/profile/edit/page.tsx`
- `src/app/profile/edit/actions.ts`

## Relevant Source Code

```tsx
// src/app/profile/create/page.tsx
export default async function CreateProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role !== "MUSICIAN") redirect("/");

  const existing = await db.musicianProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (existing) redirect("/profile/edit");

  return <ProfileForm mode="create" initial={{ isRemote: true, seekingPaid: true, seekingUnpaid: true }} action={createMusicianProfile} />;
}
```

```tsx
// src/app/profile/edit/page.tsx
const profile = await db.musicianProfile.findUnique({
  where: { userId: session.user.id },
  include: {
    instruments: { include: { instrument: true } },
    genres: { include: { genre: true } },
  },
});

if (!profile) redirect("/profile/create");

const instrumentsCsv = profile.instruments.map((x) => x.instrument.name).join(", ");
const genresCsv = profile.genres.map((x) => x.genre.name).join(", ");

return <ProfileForm mode="edit" initial={{ displayName: profile.displayName, bio: profile.bio ?? "", instrumentsCsv, genresCsv }} action={updateMusicianProfile} />;
```

```tsx
// src/app/profile/_profile-form.tsx
export function ProfileForm({ mode, initial, action }: {
  mode: "create" | "edit";
  initial: Partial<ProfileFormState>;
  action: (fd: FormData) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const header = useMemo(() => mode === "create" ? "Create Your Musician Profile" : "Edit Your Profile", [mode]);

  return (
    <form action={async (fd) => {
      setSaving(true);
      try { await action(fd); } finally { setSaving(false); }
    }} className="space-y-8">
      <input name="displayName" defaultValue={initial.displayName ?? ""} required />
      <textarea name="bio" defaultValue={initial.bio ?? ""} />
      <input name="instrumentsCsv" defaultValue={initial.instrumentsCsv ?? ""} required />
      <input name="genresCsv" defaultValue={initial.genresCsv ?? ""} required />
      <input type="email" name="contactEmail" defaultValue={initial.contactEmail ?? ""} required />
      <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save Profile"}</button>
    </form>
  );
}
```

```ts
// Shared parsing pattern in create/edit actions
function parseCsv(input: string) {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\s+/g, " "));
}
```

```ts
// src/app/profile/create/actions.ts
await db.$transaction(async (tx) => {
  const ensuredInstruments = await Promise.all(
    instruments.map(async (name) => {
      const existing = await tx.instrument.findFirst({ where: { name } });
      return existing ?? tx.instrument.create({ data: { name } });
    }),
  );

  await tx.musicianProfile.create({
    data: {
      userId: session.user.id,
      displayName,
      bio,
      school,
      location,
      isRemote,
      seekingPaid,
      seekingUnpaid,
      yearsExperience,
      availabilityText,
      contactEmail,
      instagramUrl,
      youtubeUrl,
      spotifyUrl,
      soundcloudUrl,
      websiteUrl,
      instruments: { create: ensuredInstruments.map((inst) => ({ instrumentId: inst.id })) },
      genres: { create: ensuredGenres.map((g) => ({ genreId: g.id })) },
    },
  });
});
```

```ts
// src/app/profile/edit/actions.ts
await tx.musicianInstrument.deleteMany({ where: { musicianProfileId: profile.id } });
await tx.musicianGenre.deleteMany({ where: { musicianProfileId: profile.id } });
await tx.musicianProfile.update({
  where: { id: profile.id },
  data: {
    displayName,
    bio,
    school,
    location,
    isRemote,
    seekingPaid,
    seekingUnpaid,
    yearsExperience,
    availabilityText,
    contactEmail,
    instruments: { create: ensuredInstruments.map((inst) => ({ instrumentId: inst.id })) },
    genres: { create: ensuredGenres.map((g) => ({ genreId: g.id })) },
  },
});
```

## How It Works
Create and edit pages are Server Components. Both require an authenticated `MUSICIAN`. Create redirects to edit if a profile already exists. Edit redirects to create if no profile exists.

The shared form is a client component because it tracks a `saving` state around the server action. Fields are posted as plain `FormData`. CSV fields are parsed into arrays, normalized for whitespace, and used to create or reuse `Instrument` and `Genre` rows.

Create wraps tag creation and profile creation in one transaction. Edit wraps tag creation, deletion of old joins, and profile update in one transaction.

## Implementation Details for an LLM
Preserve the one-profile-per-user invariant. Any new fields must be added to the Prisma model, both action parsers, the edit initial value mapper, and the shared form. If adding repeatable portfolio items, prefer a dedicated relation UI instead of cramming more CSV into the profile form.

## Issues and Improvements
- Validation errors throw server errors instead of rendering inline field messages.
- Inputs use placeholders but lack `htmlFor`/`id` pairs, which should be improved for accessibility.
- CSV tag creation is case-sensitive and can race under concurrency.
- The edit action deletes and recreates joins; acceptable for MVP, but diffing joins would preserve future metadata like proficiency.
- `seekingPaid` and `seekingUnpaid` can both be false, creating an odd preference state.

