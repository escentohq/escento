import { redirect } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { requireRole } from "@/lib/auth-guards";
import { getGig } from "@/lib/api/gigs";
import { GigForm } from "../../_gig-form";
import { updateGigAction } from "./actions";

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

  const gig = await getGig(id);
  if (!gig || gig.creatorId !== session.user.id) redirect("/gigs/manage");

  return (
    <PageShell
      eyebrow="Backstage"
      title="Edit Gig"
      body="Fine-tune the project details, timeline, or sound requirements."
      size="medium"
    >
      <GigForm
        initial={{
          title: gig.title,
          description: gig.description,
          projectType: gig.projectType,
          location: gig.location ?? "",
          locationDisplayName: gig.locationDisplayName ?? gig.location ?? "",
          locationPlaceId: gig.locationPlaceId ?? "",
          locationLat: gig.locationLat === null ? "" : String(gig.locationLat),
          locationLng: gig.locationLng === null ? "" : String(gig.locationLng),
          locationCity: gig.locationCity ?? "",
          locationState: gig.locationState ?? "",
          locationCountry: gig.locationCountry ?? "",
          locationProvider: gig.locationProvider ?? "",
          providerPlaceId: gig.providerPlaceId ?? gig.locationPlaceId ?? "",
          locationVisibility: gig.locationVisibility,
          isRemote: gig.isRemote,
          compensationType: gig.compensationType,
          compensationDetails: gig.compensationDetails ?? "",
          deadline: gig.deadline ?? "",
          instrumentsCsv: gig.instruments?.join(", ") ?? "",
          genresCsv: gig.genres?.join(", ") ?? "",
        }}
        action={(state, fd) => updateGigAction(id, state, fd)}
        submitLabel="Save Changes"
        pendingLabel="Saving..."
        cancelHref={`/gigs/${id}`}
      />
    </PageShell>
  );
}
