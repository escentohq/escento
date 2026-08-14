import { redirect } from "next/navigation";

import { getProfileByUserId } from "@/lib/api/profiles";
import { listGenres, listInstruments } from "@/lib/api/tags";
import { PageShell } from "@/components/ui/page-shell";
import { requireRole } from "@/lib/auth-guards";
import { ProfileForm } from "../_profile-form";
import { createMusicianProfileAction } from "./actions";

export default async function CreateProfilePage() {
  // Taxonomy depends on neither the session nor the profile; start it first so it
  // overlaps both reads. The no-op catch keeps a redirect from surfacing as an
  // unhandled rejection when we unwind before awaiting it.
  const tagsPromise = Promise.all([listInstruments(), listGenres()]);
  tagsPromise.catch(() => {});

  const session = await requireRole("MUSICIAN", "/profile/create");

  const existing = await getProfileByUserId(session.user.id);
  if (existing) redirect("/profile/edit");
  const [instruments, genres] = await tagsPromise;

  return (
    <PageShell
      eyebrow="On stage"
      title="Create Profile"
      body="Put your sound where creators can find it. Keep it specific and make it easy to start a conversation."
      size="medium"
    >
      <ProfileForm
        mode="create"
        initial={{ isRemote: true, seekingPaid: true, seekingUnpaid: true }}
        action={createMusicianProfileAction}
        instruments={instruments}
        genres={genres}
      />
    </PageShell>
  );
}
