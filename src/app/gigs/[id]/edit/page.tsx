import Link from "next/link";
import { redirect } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { requireRole } from "@/lib/auth-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GigForm } from "../../_gig-form";
import { updateGig } from "./actions";

function isValidId(id: string) {
  return id.length > 0 && id.length < 64;
}

export default async function EditGigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireRole("CREATOR", `/gigs/${id}/edit`);

  if (!isValidId(id)) redirect("/gigs/manage");

  const supabase = await createSupabaseServerClient();
  const { data: gig } = await supabase
    .from("gig")
    .select("*, gig_instrument(*, instrument(*)), gig_genre(*, genre(*))")
    .eq("id", id)
    .single();

  if (!gig || gig.creator_id !== session.user.id) redirect("/gigs/manage");

  const instrumentsCsv = (gig.gig_instrument || []).map((x: any) => x.instrument?.name).join(", ");
  const genresCsv = (gig.gig_genre || []).map((x: any) => x.genre?.name).join(", ");
  const deadlineValue =
    gig.deadline instanceof Date
      ? gig.deadline.toISOString().slice(0, 10)
      : "";

  const initial = {
    title: gig.title,
    description: gig.description,
    projectType: gig.projectType,
    location: gig.location ?? "",
    isRemote: gig.isRemote,
    compensationType: gig.compensationType,
    compensationDetails: gig.compensationDetails ?? "",
    deadline: deadlineValue,
    instrumentsCsv,
    genresCsv,
  };

  return (
    <PageShell
      eyebrow="Backstage"
      title="Edit Gig"
      body="Update the listing. Changes go live as soon as you save."
      size="medium"
      action={<Link href="/gigs/manage" className="btn-secondary">Manage gigs</Link>}
    >
      <GigForm
        initial={initial}
        action={updateGig.bind(null, id)}
        submitLabel="Update Gig"
        pendingLabel="Saving..."
        cancelHref="/gigs/manage"
      />
    </PageShell>
  );
}
