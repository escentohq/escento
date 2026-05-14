import { requireSignedIn } from "@/lib/auth-guards";
import { getUserById } from "@/lib/api/users";
import { PageShell } from "@/components/ui/page-shell";
import { SectionCard } from "@/components/ui/section-card";
import { UpdateNameForm } from "./_update-name-form";
import { DeleteAccountButton } from "./_delete-account-button";
import { deleteAccountAction } from "./actions";

export default async function AccountPage() {
  const session = await requireSignedIn("/account");
  const user = await getUserById(session.user.id);

  if (!user) {
    throw new Error("User not found");
  }

  return (
    <PageShell size="narrow" eyebrow="Backstage" title="Your Account">
      <div className="space-y-8">
        <SectionCard eyebrow="Profile" title="Your Account">
          <div className="space-y-6">
            <UpdateNameForm initialName={user.name ?? ""} />

            <div>
              <label className="block text-sm font-bold text-[#0F172A]">
                Email
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#475569] disabled:cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-[#64748B]">
                Email is managed by your sign-in provider.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0F172A]">
                Role
              </label>
              <div className="mt-2 flex items-center">
                <span className="text-sm text-[#475569] capitalize">
                  {user.role?.toLowerCase() || "No role"}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Danger Zone"
          title="Delete Account"
          className="border border-[#FF3366]/30"
        >
          <div className="space-y-4">
            <p className="text-sm text-[#475569]">
              Once you delete your account, there is no going back. All your data
              will be permanently removed.
            </p>
            <DeleteAccountButton deleteAction={deleteAccountAction} />
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
