import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getAdminAccess } from "@/lib/admin-auth";

// In production, the admin area is hidden from anyone without access: unauthorized
// requests get a 404 instead of revealing that /admin exists. In development the
// per-page AdminUnavailable screen is preserved so the access state is visible while debugging.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") {
    const access = await getAdminAccess();
    if (!access.ok) notFound();
  }

  return <>{children}</>;
}
