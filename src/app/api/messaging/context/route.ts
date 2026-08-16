import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth-guards";
import {
  getMessagingBlockStatusForUser,
  getMessagingRelationshipForUser,
} from "@/lib/api/messaging";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const recipientId = request.nextUrl.searchParams.get("recipientId") ?? "";
  if (!recipientId || recipientId.length > 128) {
    return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
  }

  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ signedIn: false }, { headers: { "Cache-Control": "private, no-store" } });
  }

  if (session.user.id === recipientId) {
    return NextResponse.json({
      signedIn: true,
      currentUserId: session.user.id,
      role: session.user.role,
      relationship: { status: "self" },
      blockStatus: { blockedByMe: false, blockedMe: false },
    }, { headers: { "Cache-Control": "private, no-store" } });
  }

  try {
    const [relationship, blockStatus] = await Promise.all([
      getMessagingRelationshipForUser(session.user.id, recipientId),
      getMessagingBlockStatusForUser(session.user.id, recipientId),
    ]);
    return NextResponse.json({
      signedIn: true,
      currentUserId: session.user.id,
      role: session.user.role,
      relationship,
      blockStatus,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[messaging-context] lookup failed:", error);
    return NextResponse.json({
      signedIn: true,
      currentUserId: session.user.id,
      role: session.user.role,
      unavailable: true,
    }, { headers: { "Cache-Control": "private, no-store" } });
  }
}
