import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import { getUnreadConversationCountForUser } from "@/lib/api/messaging";
import { resolveMusicianProfileNavigation } from "@/lib/profile-progress";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json({ signedIn: false }, { headers: { "Cache-Control": "private, no-store" } });
    }

    const [profile, unreadConversationCount] = await Promise.all([
      session.user.role === "MUSICIAN" ? getProfileByUserId(session.user.id) : null,
      getUnreadConversationCountForUser(session.user.id).catch(() => 0),
    ]);
    const musicianProfileNavigation =
      session.user.role === "MUSICIAN" ? resolveMusicianProfileNavigation(profile) : null;

    return NextResponse.json({
      signedIn: true,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      role: session.user.role,
      musicianProfilePath: musicianProfileNavigation?.href ?? null,
      musicianProfileLabel: musicianProfileNavigation?.label ?? null,
      musicianProfileMode: musicianProfileNavigation?.mode ?? null,
      isCreator: session.user.role === "CREATOR",
      unreadConversationCount,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[navigation] identity failed:", error);
    return NextResponse.json({ signedIn: false }, { headers: { "Cache-Control": "private, no-store" } });
  }
}
