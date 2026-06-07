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
  ShieldCheck,
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
  isAdmin?: boolean;
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
  isAdmin = false,
}: UserMenuProps) {
  const avatarContent = image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt="" className="h-full w-full rounded-full object-cover" />
  ) : name ? (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0055FF] text-xs font-bold text-white">
      {getInitials(name)}
    </div>
  ) : (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#F1F5F9]">
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
          className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#E2E8F0] bg-white transition-colors hover:border-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
        >
          <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
            {avatarContent}
          </span>
          {unreadConversationCount > 0 ? (
            <span
              aria-hidden
              className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF3366] px-1 text-[10px] font-black leading-none text-white ring-2 ring-white"
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
          className="z-50 min-w-[220px] rounded-2xl border border-[#F1F5F9] bg-white p-1.5 shadow-xl shadow-[#0F172A]/8 animate-in fade-in slide-in-from-top-2"
        >
          <DropdownMenu.Label className="flex flex-col gap-1 px-3 py-2">
            {name && <div className="text-sm font-bold text-[#0F172A]">{name}</div>}
            <div className="text-xs text-[#475569]">{email}</div>
            {role && (
              <div className="inline-flex w-fit rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                {role.toLowerCase()}
              </div>
            )}
          </DropdownMenu.Label>

          <DropdownMenu.Separator className="my-1.5 border-t border-[#F1F5F9]" />

          {isAdmin ? (
            <DropdownMenu.Item asChild>
              <Link
                href="/admin"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] focus:bg-[#F8FAFC] focus:outline-none cursor-pointer select-none"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            </DropdownMenu.Item>
          ) : null}

          <DropdownMenu.Item asChild>
            <Link
              href="/messages"
              className="flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] focus:bg-[#F8FAFC] focus:outline-none cursor-pointer select-none"
            >
              <span className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4" />
                Messages
              </span>
              {unreadConversationCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF3366] px-1 text-[10px] font-black leading-none text-white">
                  {unreadConversationCount > 9 ? "9+" : unreadConversationCount}
                </span>
              ) : null}
            </Link>
          </DropdownMenu.Item>

          {musicianProfilePath && (
            <DropdownMenu.Item asChild>
              <Link
                href={musicianProfilePath}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] focus:bg-[#F8FAFC] focus:outline-none cursor-pointer select-none"
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
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] focus:bg-[#F8FAFC] focus:outline-none cursor-pointer select-none"
                >
                  <LayoutList className="h-4 w-4" />
                  Manage Gigs
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item asChild>
                <Link
                  href="/gigs/create"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] focus:bg-[#F8FAFC] focus:outline-none cursor-pointer select-none"
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
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] focus:bg-[#F8FAFC] focus:outline-none cursor-pointer select-none"
            >
              <Settings className="h-4 w-4" />
              Account Settings
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href="/help"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] focus:bg-[#F8FAFC] focus:outline-none cursor-pointer select-none"
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
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-[#FF3366] transition-colors hover:bg-[#FF3366]/10 focus:bg-[#FF3366]/10 focus:outline-none cursor-pointer select-none disabled:opacity-60 disabled:cursor-wait"
    >
      <LogOut className="h-4 w-4" />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
