import { NextResponse } from "next/server";

import { getActiveView } from "@/lib/active-view";
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

    const isMusician = session.user.capabilities.includes("MUSICIAN");
    const [profile, unreadConversationCount, activeView] = await Promise.all([
      isMusician ? getProfileByUserId(session.user.id) : null,
      getUnreadConversationCountForUser(session.user.id).catch(() => 0),
      getActiveView(),
    ]);
    const musicianProfileNavigation = isMusician
      ? resolveMusicianProfileNavigation(profile)
      : null;

    return NextResponse.json({
      signedIn: true,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      // `role` is the immutable first claim, kept in the payload so a
      // sessionStorage blob written before this change still renders.
      role: session.user.role,
      capabilities: session.user.capabilities,
      activeView,
      musicianProfilePath: musicianProfileNavigation?.href ?? null,
      musicianProfileLabel: musicianProfileNavigation?.label ?? null,
      musicianProfileMode: musicianProfileNavigation?.mode ?? null,
      isCreator: session.user.capabilities.includes("CREATOR"),
      unreadConversationCount,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[navigation] identity failed:", error);
    return NextResponse.json({ signedIn: false }, { headers: { "Cache-Control": "private, no-store" } });
  }
}
