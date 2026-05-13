import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";

type Props = {
  signedIn: boolean;
  email?: string | null;
  role?: string | null;
  musicianProfilePath?: "/profile/create" | "/profile/edit" | null;
  isCreator?: boolean;
};

export function NavBar({ signedIn, email, role, musicianProfilePath, isCreator }: Props) {
  const appLinks = (
    <>
      <Link href="/musicians" className="whitespace-nowrap transition-colors hover:text-[#0055FF]">Browse Musicians</Link>
      <Link href="/gigs" className="whitespace-nowrap transition-colors hover:text-[#0055FF]">Browse Gigs</Link>
      {musicianProfilePath && (
        <Link href={musicianProfilePath} className="whitespace-nowrap transition-colors hover:text-[#0055FF]">
          {musicianProfilePath === "/profile/create" ? "Create Profile" : "Edit Profile"}
        </Link>
      )}
      {isCreator && (
        <>
          <Link href="/gigs/manage" className="whitespace-nowrap transition-colors hover:text-[#0055FF]">Manage</Link>
          <Link href="/gigs/create" className="whitespace-nowrap transition-colors hover:text-[#0055FF]">Post a Gig</Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#F1F5F9] bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:py-4">
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/" className="text-base font-black tracking-tight text-[#0F172A]">
            Motivo
          </Link>
          <div className="hidden items-center gap-6 text-sm font-bold text-[#475569] lg:flex">
            {appLinks}
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
          {!signedIn ? (
            <>
              <Link
                href="/signin"
                prefetch={false}
                className="inline-flex min-h-11 items-center rounded-full border-2 border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#0F172A] transition-colors hover:border-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                prefetch={false}
                className="hidden min-h-11 items-center rounded-full bg-[#0F172A] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 sm:inline-flex"
              >
                Sign up
              </Link>
            </>
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
              <SignOutButton className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-[#E2E8F0] px-4 py-2 text-xs font-bold text-[#0F172A] transition-colors hover:border-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-70" />
            </>
          )}
        </div>
      </nav>
      <div className="border-t border-[#F1F5F9] lg:hidden">
        <div className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-4 py-3 text-sm font-bold text-[#475569] sm:px-6">
          {appLinks}
        </div>
      </div>
    </header>
  );
}
