import { redirect } from "next/navigation";

import { AdminNav, AdminSetupRequired, AdminUnavailable } from "@/components/admin/admin-display";
import { PageShell } from "@/components/ui/page-shell";
import { GigForm } from "@/app/gigs/_gig-form";
import { getAdminAccess } from "@/lib/admin-auth";
import { getAdminEditableGig } from "@/lib/api/admin-edits";
import { listGenres, listInstruments } from "@/lib/api/tags";
import { adminUpdateGigAction } from "./actions";

function isValidId(id: string) {
  return id.length > 0 && id.length < 128;
}

export default async function AdminEditGigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await getAdminAccess();
  if (!access.ok) return <AdminUnavailable reason={access.reason} />;

  const { id } = await params;
  if (!isValidId(id)) redirect("/admin/gigs");

  let gig;
  let instruments;
  let genres;
  try {
    [gig, instruments, genres] = await Promise.all([
      getAdminEditableGig(id),
      listInstruments(),
      listGenres(),
    ]);
  } catch (error) {
    console.error("[admin] gig edit data failed", error);
    return <AdminSetupRequired />;
  }

  if (!gig) redirect("/admin/gigs");

  return (
    <PageShell
      eyebrow="Admin"
      title={`Edit ${gig.title}`}
      body="Full admin edit access for this gig. Changes affect the public listing immediately."
      size="medium"
    >
      <AdminNav />
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
        action={(state, fd) => adminUpdateGigAction(id, state, fd)}
        submitLabel="Save Changes"
        pendingLabel="Saving..."
        cancelHref="/admin/gigs"
        instruments={instruments}
        genres={genres}
        showStatus
      />
    </PageShell>
  );
}
