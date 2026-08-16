"use client";

import type { MessagingBlockStatus, MessagingRelationship } from "@/lib/api/types";

export type ContactContext = {
  signedIn: boolean;
  currentUserId?: string;
  role?: string | null;
  relationship?: MessagingRelationship | null;
  blockStatus?: MessagingBlockStatus | null;
  unavailable?: boolean;
};

/**
 * A page can mount several contact controls for the same recipient (the contact
 * panel and the report button), and each mount otherwise fired its own uncached
 * request. Share the in-flight promise per recipient, the way navigation-state.ts
 * does for identity.
 *
 * This lives in its own module so `connect-button.tsx` can invalidate an entry
 * after a successful request without importing the component that renders it.
 */
const contextRequests = new Map<string, Promise<ContactContext>>();

export function loadContactContext(recipientId: string): Promise<ContactContext> {
  const existing = contextRequests.get(recipientId);
  if (existing) return existing;

  const request = fetch(`/api/messaging/context?recipientId=${encodeURIComponent(recipientId)}`, {
    cache: "no-store",
  })
    .then(async (response) =>
      response.ok ? (response.json() as Promise<ContactContext>) : Promise.reject(),
    )
    .catch((): ContactContext => {
      // Don't cache a failure — the next mount should be able to retry.
      contextRequests.delete(recipientId);
      return { signedIn: false, unavailable: true };
    });

  contextRequests.set(recipientId, request);
  return request;
}

/**
 * Drop the memoised answer for one recipient. Call this after a mutation that
 * changes the relationship, or the next mount replays the stale one.
 */
export function invalidateContactContext(recipientId: string): void {
  contextRequests.delete(recipientId);
}
