import Link from "next/link";
import { Search } from "lucide-react";

import { AdminNav, AdminSetupRequired, AdminUnavailable } from "@/components/admin/admin-display";
import { AdminSupportMessageForm } from "@/components/admin/admin-support-message-form";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { getAdminAccess } from "@/lib/admin-auth";
import {
  getSupportConversationForAdmin,
  searchUsersForSupport,
  type SupportConversationForAdmin,
  type SupportUserSearchResult,
} from "@/lib/api/support-account";

function displayUserName(user: { name: string | null; email: string | null; id: string }) {
  return user.name || user.email || user.id;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; userId?: string }>;
}) {
  const access = await getAdminAccess();
  if (!access.ok) return <AdminUnavailable reason={access.reason} />;

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const selectedUserId = params.userId?.trim() ?? "";

  let users: SupportUserSearchResult[] = [];
  let conversation: SupportConversationForAdmin | null = null;

  try {
    users = await searchUsersForSupport(query);
    if (selectedUserId) {
      conversation = await getSupportConversationForAdmin(selectedUserId);
    }
  } catch (error) {
    console.error("[admin-support] support data failed", error);
    return <AdminSetupRequired />;
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="Motivo support"
      body="Message users as the official Motivo support account. Normal user messaging rules remain unchanged."
    >
      <AdminNav />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl border border-[#F1F5F9] bg-white p-5 shadow-sm">
          <form action="/admin/support" className="mb-5">
            <label htmlFor="support-user-search" className="text-sm font-bold text-[#0F172A]">
              Search users
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="support-user-search"
                name="q"
                defaultValue={query}
                placeholder="Name, email, or user ID"
                className="min-h-11 min-w-0 flex-1 rounded-2xl border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#0F172A] shadow-sm focus:border-[#0055FF] focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20"
              />
              <button
                type="submit"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-white transition-colors hover:bg-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
                aria-label="Search support users"
              >
                <Search className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {users.length === 0 ? (
              <p className="rounded-2xl bg-[#F8FAFC] p-4 text-sm font-medium text-[#64748B]">
                No users found.
              </p>
            ) : (
              users.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/support?${new URLSearchParams({
                    ...(query ? { q: query } : {}),
                    userId: user.id,
                  }).toString()}`}
                  className={`block rounded-2xl border p-4 transition-colors hover:border-[#0055FF] hover:bg-[#F8FAFC] ${
                    selectedUserId === user.id ? "border-[#0055FF]/40 bg-[#0055FF]/5" : "border-[#F1F5F9]"
                  }`}
                >
                  <p className="truncate text-sm font-black text-[#0F172A]">{displayUserName(user)}</p>
                  <p className="mt-1 truncate text-xs font-medium text-[#64748B]">{user.email || user.id}</p>
                  {user.role ? <p className="mt-2 text-xs font-bold text-[#0055FF]">{user.role}</p> : null}
                </Link>
              ))
            )}
          </div>
        </aside>

        <section className="min-w-0 rounded-3xl border border-[#F1F5F9] bg-white shadow-sm">
          {!conversation ? (
            <div className="p-6">
              <EmptyState
                eyebrow="Support"
                title="Choose a user"
                body="Search for a user to view or start their official Motivo support conversation."
              />
            </div>
          ) : (
            <>
              <header className="border-b border-[#F1F5F9] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
                      Motivo Support
                    </span>
                    <h2 className="mt-2 truncate text-2xl font-black text-[#0F172A]">
                      {displayUserName(conversation.targetUser)}
                    </h2>
                    <p className="mt-1 truncate text-sm font-medium text-[#64748B]">
                      {conversation.targetUser.email || conversation.targetUser.id}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Chip tone="blue">Official</Chip>
                    <Chip tone="neutral">Send as Motivo</Chip>
                  </div>
                </div>
              </header>

              <div className="max-h-[620px] min-h-[420px] space-y-4 overflow-y-auto p-5">
                {conversation.messages.length === 0 ? (
                  <div className="rounded-3xl bg-[#F8FAFC] p-8 text-center">
                    <p className="text-sm font-bold text-[#0F172A]">No messages yet.</p>
                    <p className="mt-2 text-sm font-medium text-[#64748B]">
                      Send the first official Motivo support message.
                    </p>
                  </div>
                ) : (
                  conversation.messages.map((message) => {
                    const fromSupport = message.senderId === conversation.supportUser.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${fromSupport ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[82%] rounded-3xl px-4 py-3 ${
                            fromSupport
                              ? "bg-[#0F172A] text-white"
                              : "border border-[#F1F5F9] bg-[#F8FAFC] text-[#0F172A]"
                          }`}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <span className={`text-xs font-black ${fromSupport ? "text-white" : "text-[#0F172A]"}`}>
                              {fromSupport ? "Motivo" : displayUserName(conversation.targetUser)}
                            </span>
                            {fromSupport ? <Chip tone="blue">Official</Chip> : null}
                          </div>
                          <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
                            {message.body}
                          </p>
                          <p className={`mt-2 font-mono text-[10px] ${fromSupport ? "text-[#CBD5E1]" : "text-[#64748B]"}`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <AdminSupportMessageForm targetUserId={conversation.targetUser.id} />
            </>
          )}
        </section>
      </div>
    </PageShell>
  );
}
