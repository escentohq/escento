import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import { Sidebar } from "./_sidebar";

interface EditProfileLayoutProps {
  children: React.ReactNode;
}

export default async function EditProfileLayout({
  children,
}: EditProfileLayoutProps) {
  const session = await requireRole("MUSICIAN", "/profile/edit");
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect("/onboarding/musician/basics");
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0F172A]">Your Profile</h1>
          <p className="mt-2 text-sm text-[#64748B]">Manage your public profile information</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <Sidebar currentTab="basics" />
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
