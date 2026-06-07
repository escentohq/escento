import Link from "next/link";
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

function MessagesLink({ unreadConversationCount = 0 }: { unreadConversationCount?: number }) {
  return (
    <Link href="/messages" className="relative whitespace-nowrap pr-1 transition-colors hover:text-[#0055FF]">
      Messages
      {unreadConversationCount > 0 ? (
        <span
          aria-label={`${unreadConversationCount} unread`}
          className="absolute -right-2.5 -top-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF3366] px-1 text-[10px] font-black leading-none text-white ring-2 ring-white"
        >
          {unreadConversationCount > 9 ? "9+" : unreadConversationCount}
        </span>
      ) : null}
    </Link>
  );
}

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
      {signedIn ? <MessagesLink unreadConversationCount={unreadConversationCount} /> : null}
      <Link href="/help" className="whitespace-nowrap transition-colors hover:text-[#0055FF]">Help</Link>
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
            {publicLinks}
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
      <div className="border-t border-[#F1F5F9] lg:hidden">
        <div className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-4 py-3 text-sm font-bold text-[#475569] sm:px-6">
          {publicLinks}
        </div>
      </div>
    </header>
  );
}
