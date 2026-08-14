import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth-guards";
import { hasProfileForUser } from "@/lib/api/profiles";
import { getUnreadConversationCountForUser } from "@/lib/api/messaging";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json({ signedIn: false }, { headers: { "Cache-Control": "private, no-store" } });
    }

    const [hasProfile, unreadConversationCount] = await Promise.all([
      session.user.role === "MUSICIAN" ? hasProfileForUser(session.user.id) : false,
      getUnreadConversationCountForUser(session.user.id).catch(() => 0),
    ]);

    return NextResponse.json({
      signedIn: true,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      role: session.user.role,
      musicianProfilePath: session.user.role === "MUSICIAN"
        ? hasProfile ? "/profile/edit" : "/profile/create"
        : null,
      isCreator: session.user.role === "CREATOR",
      unreadConversationCount,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[navigation] identity failed:", error);
    return NextResponse.json({ signedIn: false }, { headers: { "Cache-Control": "private, no-store" } });
  }
}
