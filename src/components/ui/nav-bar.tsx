import Link from "next/link";

type Props = {
  signedIn: boolean;
  email?: string | null;
  role?: string | null;
  musicianProfilePath?: "/profile/create" | "/profile/edit" | null;
  isCreator?: boolean;
};

export function NavBar({ signedIn, email, role, musicianProfilePath, isCreator }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#F1F5F9] bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-base font-black tracking-tight text-[#0F172A]">
            GigForge
          </Link>
          <div className="hidden items-center gap-6 text-sm font-bold text-[#475569] md:flex">
            <Link href="/musicians" className="transition-colors hover:text-[#0055FF]">Browse Musicians</Link>
            <Link href="/gigs" className="transition-colors hover:text-[#0055FF]">Browse Gigs</Link>
            {musicianProfilePath && (
              <Link href={musicianProfilePath} className="transition-colors hover:text-[#0055FF]">
                {musicianProfilePath === "/profile/create" ? "Create Profile" : "Edit Profile"}
              </Link>
            )}
            {isCreator && (
              <>
                <Link href="/gigs/manage" className="transition-colors hover:text-[#0055FF]">Manage</Link>
                <Link href="/gigs/create" className="transition-colors hover:text-[#0055FF]">Post a Gig</Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {!signedIn ? (
            <Link
              href="/signin"
              className="rounded-full border-2 border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#0F172A] transition-colors hover:border-[#0F172A]"
            >
              Sign in
            </Link>
          ) : (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-[#F1F5F9] bg-white px-3 py-1.5 text-xs text-[#475569] sm:flex">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#0055FF]" />
                <span className="max-w-[160px] truncate font-bold">{email ?? "Signed in"}</span>
                {role && (
                  <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#64748B]">
                    {role.toLowerCase()}
                  </span>
                )}
              </div>
              <Link
                href="/api/auth/signout"
                className="rounded-full border-2 border-[#E2E8F0] px-4 py-2 text-xs font-bold text-[#0F172A] transition-colors hover:border-[#0F172A]"
              >
                Sign out
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
