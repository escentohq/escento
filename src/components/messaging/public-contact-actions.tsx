"use client";

import { useEffect, useState } from "react";

import { BlockUserButton } from "@/components/messaging/block-user-button";
import { ConnectButton } from "@/components/messaging/connect-button";
import { ReportButton } from "@/components/reports/report-button";
import type { MessagingBlockStatus, MessagingRelationship } from "@/lib/api/types";

type Context = {
  signedIn: boolean;
  currentUserId?: string;
  role?: string | null;
  relationship?: MessagingRelationship | null;
  blockStatus?: MessagingBlockStatus | null;
  unavailable?: boolean;
};

function useContactContext(recipientId: string) {
  const [context, setContext] = useState<Context | null>(null);
  useEffect(() => {
    let active = true;
    void fetch(`/api/messaging/context?recipientId=${encodeURIComponent(recipientId)}`, { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<Context> : Promise.reject())
      .then((next) => { if (active) setContext(next); })
      .catch(() => { if (active) setContext({ signedIn: false, unavailable: true }); });
    return () => { active = false; };
  }, [recipientId]);
  return context;
}

function ContactControls({
  recipientId,
  callbackUrl,
  connectLabel,
  introMessage,
  context,
}: {
  recipientId: string;
  callbackUrl: string;
  connectLabel?: string;
  introMessage?: string;
  context: Context | null;
}) {
  const relationship = context?.relationship ?? null;
  const blockStatus = context?.blockStatus ?? null;
  if (relationship?.status === "self") return null;

  return (
    <>
      <ConnectButton
        recipientId={recipientId}
        relationship={relationship}
        blockStatus={blockStatus}
        signedIn={Boolean(context?.signedIn)}
        callbackUrl={callbackUrl}
        connectLabel={connectLabel}
        introMessage={introMessage}
        disabledReason={context?.unavailable ? "Messaging is unavailable right now." : null}
      />
      {context?.signedIn && !context.unavailable ? (
        <BlockUserButton userId={recipientId} initiallyBlocked={Boolean(blockStatus?.blockedByMe)} />
      ) : null}
    </>
  );
}

export function MusicianContactActions({
  recipientId,
  profileId,
  profileName,
}: {
  recipientId: string;
  profileId: string;
  profileName: string;
}) {
  const context = useContactContext(recipientId);
  if (context?.relationship?.status === "self") return null;

  return (
    <>
      <div className="border-t-4 border-brand bg-ink p-6 text-white">
        <span className="text-meta uppercase text-on-ink-muted">Contact</span>
        <h2 className="mt-3 text-section-heading">Message this musician</h2>
        <p className="mt-3 text-secondary text-on-ink-body">Send a request. If they accept, a message thread opens.</p>
        <ContactControls recipientId={recipientId} callbackUrl={`/musicians/${profileId}`} context={context} />
      </div>
      {context?.role === "CREATOR" ? (
        <div className="flex justify-end">
          <ReportButton targetType="musician_profile" targetId={profileId} targetLabel={profileName} />
        </div>
      ) : null}
    </>
  );
}

export function GigContactActions({
  recipientId,
  gigId,
  gigTitle,
}: {
  recipientId: string;
  gigId: string;
  gigTitle: string;
}) {
  const context = useContactContext(recipientId);
  const self = context?.relationship?.status === "self";
  return (
    <>
      {!self ? (
        <ContactControls
          recipientId={recipientId}
          callbackUrl={`/gigs/${gigId}`}
          connectLabel="Contact Creator"
          introMessage={`Reached out about your gig: ${gigTitle}`}
          context={context}
        />
      ) : null}
      {context?.role === "MUSICIAN" && !self ? (
        <div className="mt-6 flex justify-end">
          <ReportButton targetType="gig" targetId={gigId} targetLabel={gigTitle} />
        </div>
      ) : null}
    </>
  );
}
