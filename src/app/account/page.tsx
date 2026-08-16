import { requireSignedIn } from "@/lib/auth-guards";
import { PageShell } from "@/components/ui/page-shell";
import { SectionCard } from "@/components/ui/section-card";
import { hasPublicName } from "@/lib/public-name";
import { UpdateProfilePictureForm } from "./_update-profile-picture-form";
import { UpdateNameForm } from "./_update-name-form";
import { DeleteAccountButton } from "./_delete-account-button";
import { deleteAccountAction } from "./actions";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const session = await requireSignedIn("/account");
  const { reason } = await searchParams;
  const needsName = reason === "name" || !hasPublicName(session.user.name);

  return (
    <PageShell size="narrow" eyebrow="Settings" title="Account settings">
      <div className="space-y-8">
        {needsName ? (
          <aside className="border-y border-rule bg-surface px-1 py-5 md:px-4">
            <p className="text-meta uppercase text-brand">Add a name</p>
            <p className="mt-2 text-body text-ink">
              Musicians see this name on your gigs and requests. Add one before you publish or contact anyone.
            </p>
          </aside>
        ) : null}
        <SectionCard title="Account details">
          <div className="space-y-6">
            <UpdateProfilePictureForm
              name={session.user.name}
              image={session.user.image}
            />

            <UpdateNameForm initialName={session.user.name ?? ""} />

            <div>
              <label htmlFor="account-email" className="block text-sm font-bold text-[#0F172A]">
                Email
              </label>
              <input
                id="account-email"
                type="email"
                disabled
                readOnly
                value={session.user.email ?? ""}
                className="mt-2 min-h-11 w-full border border-rule bg-[#F8FAFC] px-3 py-2.5 text-secondary text-muted disabled:cursor-not-allowed"
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
                  {session.user.role?.toLowerCase() || "No role"}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Account deletion"
          title="Delete account"
          className="[&>h2]:text-[#B42318] [&>span]:text-[#B42318]"
        >
          <div className="space-y-4">
            <p className="text-sm font-semibold text-[#B42318]">
              This permanently removes your account and all of its data. It cannot be undone.
            </p>
            <DeleteAccountButton deleteAction={deleteAccountAction} />
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
