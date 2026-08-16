# Global Shell, Navigation, and Shared UI

## Feature Summary
The global shell wraps every page in metadata, body styling, a session-aware navbar, a footer, and shared Tailwind utility classes. It is the cross-feature UI layer that makes role-based navigation possible.

## Product Intent
- Always expose discovery routes: browse musicians and browse gigs.
- Show musician profile creation/edit links only to musicians.
- Show creator management and posting links only to creators.
- Keep global UI lightweight and predictable.

## Routes and Files
- `src/app/layout.tsx`
- `src/components/ui/nav-bar.tsx`
- `src/components/ui/footer.tsx`
- `src/app/globals.css`
- `src/app/not-found.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/ui/primary-cta.tsx`
- `src/components/ui/secondary-cta.tsx`

## Relevant Source Code

```tsx
// src/app/layout.tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  let musicianProfilePath: "/profile/create" | "/profile/edit" | null = null;
  if (session?.user?.role === "MUSICIAN" && session.user.id) {
    const existing = await db.musicianProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    musicianProfilePath = existing ? "/profile/edit" : "/profile/create";
  }

  const isCreator = session?.user?.role === "CREATOR";

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-[#FAFAFA] text-[#0F172A] antialiased">
        <NavBar signedIn={!!session?.user} email={session?.user?.email} role={session?.user?.role} musicianProfilePath={musicianProfilePath} isCreator={isCreator} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

```tsx
// src/components/ui/nav-bar.tsx
export function NavBar({ signedIn, email, role, musicianProfilePath, isCreator }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#F1F5F9] bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-base font-black tracking-tight text-[#0F172A]">Escento</Link>
        <div className="hidden items-center gap-6 text-sm font-bold text-[#475569] md:flex">
          <Link href="/musicians">Browse Musicians</Link>
          <Link href="/gigs">Browse Gigs</Link>
          {musicianProfilePath && <Link href={musicianProfilePath}>{musicianProfilePath === "/profile/create" ? "Create profile" : "Edit profile"}</Link>}
          {isCreator && <>
            <Link href="/gigs/manage">Manage</Link>
            <Link href="/gigs/create">Post a Gig</Link>
          </>}
        </div>
      </nav>
    </header>
  );
}
```

```css
/* src/app/globals.css */
.input-base {
  @apply mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 text-zinc-100 placeholder:text-zinc-500 shadow-sm transition-colors focus:border-violet-500/70 focus:outline-0;
}

.btn-primary {
  @apply inline-flex items-center justify-center rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm transition-colors hover:bg-violet-400 disabled:pointer-events-none disabled:opacity-60;
}

.card {
  @apply rounded-2xl border border-zinc-800 bg-zinc-950/50 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_4px_24px_rgba(0,0,0,0.4)];
}
```

```tsx
// src/app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-2xl">
        <EmptyState eyebrow="404 Error" title="Page not found" body="This page doesn't exist or may have moved." cta={<PrimaryCta href="/">Return home</PrimaryCta>} />
      </div>
    </div>
  );
}
```

## How It Works
`RootLayout` is a Server Component. It reads the session once, determines whether a signed-in musician should see `Create profile` or `Edit profile`, then passes plain props to `NavBar`. The navbar itself is a simple presentational component with conditional links.

The global CSS file defines legacy utility classes used by current directory, form, and detail pages. Newer landing components use brighter design tokens and separate CTA components.

## Implementation Details for an LLM
When adding new role-aware navigation, add the data decision in `layout.tsx` and pass primitive props into `NavBar`. Do not query Prisma inside the navbar. For shared UI, prefer moving duplicated primitives into `src/components/ui` instead of keeping route-local `_ui.tsx` copies.

## Issues and Improvements
- `globals.css` still uses legacy dark `zinc`/`violet` form tokens while the app shell has moved brighter.
- `gigs/_ui.tsx` and `musicians/_ui.tsx` duplicate `Chip`, `SectionCard`, and `PrimaryLink`.
- Mobile navigation hides core browse links and has no menu yet.
- The root layout queries for musician profile existence on every request by musicians; this is acceptable now but can be cached or derived from session metadata later.
