import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { db } from "@/lib/db";
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role !== "CREATOR") redirect("/");

  if (!isValidId(id)) redirect("/gigs/manage");

  const gig = await db.gig.findUnique({
    where: { id },
    include: {
      instruments: { include: { instrument: true } },
      genres: { include: { genre: true } },
    },
  });

  if (!gig || gig.creatorId !== session.user.id) redirect("/gigs/manage");

  const instrumentsCsv = gig.instruments.map((x) => x.instrument.name).join(", ");
  const genresCsv = gig.genres.map((x) => x.genre.name).join(", ");
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
    <div className="py-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6">
          <Link href="/gigs/manage" className="link-back">
            ← Back to manage gigs
          </Link>
        </div>
        <div className="card p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
              Edit gig
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Update the details below. Changes are visible immediately.
            </p>
          </div>
          <GigForm
            initial={initial}
            action={updateGig.bind(null, id)}
            submitLabel="Save changes"
            cancelHref="/gigs/manage"
          />
        </div>
      </div>
    </div>
  );
}
