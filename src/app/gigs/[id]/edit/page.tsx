import { redirect } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { requireRole } from "@/lib/auth-guards";
import { getGigForCreator } from "@/lib/api/gigs";
import { listGenres, listInstruments } from "@/lib/api/tags";
import { GigForm } from "../../_gig-form";
import { updateGigAction } from "./actions";
import { isUuid } from "@/lib/ids";

export default async function EditGigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Taxonomy depends on neither the session nor the gig; start it first so it overlaps
  // the auth check and the gig read. The no-op catch keeps a redirect from surfacing as
  // an unhandled rejection when we unwind before awaiting it.
  const tagsPromise = Promise.all([listInstruments(), listGenres()]);
  tagsPromise.catch(() => {});

  const session = await requireRole("CREATOR", `/gigs/${id}/edit`);

  if (!isUuid(id)) redirect("/gigs/manage");

  const gig = await getGigForCreator(id, session.user.id);
  if (!gig) redirect("/gigs/manage");
  const [instruments, genres] = await tagsPromise;
  const updateAction = updateGigAction.bind(null, id);

  return (
    <PageShell
      eyebrow="Your gig"
      title="Edit gig"
      body="Update the project details, requirements, pay, or deadline."
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
          status: gig.status,
          instrumentsCsv: gig.instruments?.join(", ") ?? "",
          genresCsv: gig.genres?.join(", ") ?? "",
        }}
        action={updateAction}
        submitLabel="Save changes"
        pendingLabel="Saving..."
        cancelHref={`/gigs/${id}`}
        instruments={instruments}
        genres={genres}
        showStatus
      />
    </PageShell>
  );
}
