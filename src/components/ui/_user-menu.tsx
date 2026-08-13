"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  User,
  Settings,
  Pencil,
  Plus,
  LayoutList,
  PlusCircle,
  LogOut,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { signOutAction } from "@/app/account/actions";

type UserMenuProps = {
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string | null;
  musicianProfilePath?: "/profile/create" | "/profile/edit" | null;
  isCreator?: boolean;
  unreadConversationCount?: number;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserMenu({
  email,
  name,
  image,
  role,
  musicianProfilePath,
  isCreator,
  unreadConversationCount = 0,
}: UserMenuProps) {
  const avatarContent = image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt="" className="media-avatar h-full w-full object-cover" />
  ) : name ? (
    <div className="media-avatar flex h-full w-full items-center justify-center bg-[#0055FF] text-xs font-bold text-white">
      {getInitials(name)}
    </div>
  ) : (
    <div className="media-avatar flex h-full w-full items-center justify-center bg-[#F1F5F9]">
      <User className="h-5 w-5 text-[#475569]" />
    </div>
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={
            unreadConversationCount > 0
              ? `Account menu, ${unreadConversationCount} unread message${unreadConversationCount === 1 ? "" : "s"}`
              : "Account menu"
          }
          className="media-avatar relative flex h-9 w-9 items-center justify-center border border-[#CBD5E1] bg-white transition-colors hover:border-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
        >
          <span className="media-avatar flex h-full w-full items-center justify-center overflow-hidden">
            {avatarContent}
          </span>
          {unreadConversationCount > 0 ? (
            <span
              aria-hidden
              className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center bg-[#FF3366] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
            >
              {unreadConversationCount > 9 ? "9+" : unreadConversationCount}
            </span>
          ) : null}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="surface-overlay z-50 min-w-[220px] border border-[#0F172A] bg-white p-1.5"
        >
          <DropdownMenu.Label className="flex flex-col gap-1 px-3 py-2">
            {name && <div className="text-sm font-bold text-[#0F172A]">{name}</div>}
            <div className="text-xs text-[#475569]">{email}</div>
            {role && (
              <div className="inline-flex w-fit border border-[#CBD5E1] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                {role.toLowerCase()}
              </div>
            )}
          </DropdownMenu.Label>

          <DropdownMenu.Item asChild>
            <Link
              href="/messages"
              className="flex cursor-pointer select-none items-center justify-between gap-2.5 px-3 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9] focus:bg-[#F1F5F9] focus:outline-none"
            >
              <span className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4" />
                Messages
              </span>
              {unreadConversationCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center bg-[#FF3366] px-1 text-[10px] font-bold leading-none text-white">
                  {unreadConversationCount > 9 ? "9+" : unreadConversationCount}
                </span>
              ) : null}
            </Link>
          </DropdownMenu.Item>

          {musicianProfilePath && (
            <DropdownMenu.Item asChild>
              <Link
                href={musicianProfilePath}
                className="flex cursor-pointer select-none items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9] focus:bg-[#F1F5F9] focus:outline-none"
              >
                {musicianProfilePath === "/profile/create" ? (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Profile
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </Link>
            </DropdownMenu.Item>
          )}

          {isCreator && (
            <>
              <DropdownMenu.Item asChild>
                <Link
                  href="/gigs/manage"
                  className="flex cursor-pointer select-none items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9] focus:bg-[#F1F5F9] focus:outline-none"
                >
                  <LayoutList className="h-4 w-4" />
                  Manage Gigs
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item asChild>
                <Link
                  href="/gigs/create"
                  className="flex cursor-pointer select-none items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9] focus:bg-[#F1F5F9] focus:outline-none"
                >
                  <PlusCircle className="h-4 w-4" />
                  Post a Gig
                </Link>
              </DropdownMenu.Item>
            </>
          )}

          <DropdownMenu.Separator className="my-1.5 border-t border-[#F1F5F9]" />

          <DropdownMenu.Item asChild>
            <Link
              href="/account"
              className="flex cursor-pointer select-none items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9] focus:bg-[#F1F5F9] focus:outline-none"
            >
              <Settings className="h-4 w-4" />
              Account Settings
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href="/help"
              className="flex cursor-pointer select-none items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9] focus:bg-[#F1F5F9] focus:outline-none"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1.5 border-t border-[#F1F5F9]" />

          <form id="sign-out-form" action={signOutAction} className="contents" />
          <DropdownMenu.Item asChild>
            <SignOutButton />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      form="sign-out-form"
      disabled={pending}
      className="flex w-full cursor-pointer select-none items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[#FF3366] transition-colors hover:bg-[#FF3366]/10 focus:bg-[#FF3366]/10 focus:outline-none disabled:cursor-wait disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
