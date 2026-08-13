import Link from "next/link";
import { EscentoWordmark } from "./brand";
import { UserMenu } from "./_user-menu";

type Props = {
  signedIn: boolean;
  email?: string | null;
  role?: string | null;
  name?: string | null;
  image?: string | null;
  musicianProfilePath?: "/profile/create" | "/profile/edit" | null;
  isCreator?: boolean;
  unreadConversationCount?: number;
};

export function NavBar({
  signedIn,
  email,
  role,
  name,
  image,
  musicianProfilePath,
  isCreator,
  unreadConversationCount = 0,
}: Props) {
  const publicLinks = (
    <>
      <Link href="/musicians" className="whitespace-nowrap transition-colors hover:text-[#0055FF]">Browse Musicians</Link>
      <Link href="/gigs" className="whitespace-nowrap transition-colors hover:text-[#0055FF]">Browse Gigs</Link>
      {!signedIn ? (
        <Link href="/help" className="whitespace-nowrap transition-colors hover:text-[#0055FF]">Help</Link>
      ) : null}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#CBD5E1] bg-white">
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
            aria-label="Escento home"
            className="text-[#0F172A] transition-opacity hover:opacity-80"
          >
            <EscentoWordmark className="text-lg" />
          </Link>
          <div className="hidden items-center gap-6 text-sm font-semibold text-[#475569] lg:flex">
            {publicLinks}
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
          {!signedIn ? (
            <>
              <Link
                href="/signin"
                prefetch={false}
                className="inline-flex min-h-11 items-center border border-[#0F172A] bg-white px-4 py-2 text-xs font-semibold text-[#0F172A] transition-colors hover:bg-[#0F172A] hover:text-white focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                prefetch={false}
                className="hidden min-h-11 items-center border border-[#0055FF] bg-[#0055FF] px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-[#0F172A] hover:bg-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 sm:inline-flex"
              >
                Sign up
              </Link>
            </>
          ) : (
            <UserMenu
              email={email}
              name={name}
              image={image}
              role={role}
              musicianProfilePath={musicianProfilePath}
              isCreator={isCreator}
              unreadConversationCount={unreadConversationCount}
            />
          )}
        </div>
      </nav>
      <div className="border-t border-[#CBD5E1] lg:hidden">
        <div className="mx-auto flex max-w-[1280px] gap-5 overflow-x-auto px-4 py-3 text-sm font-semibold text-[#475569] sm:px-6">
          {publicLinks}
        </div>
      </div>
    </header>
  );
}
