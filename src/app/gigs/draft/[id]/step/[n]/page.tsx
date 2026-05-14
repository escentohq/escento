import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getGig } from "@/lib/api/gigs";
import { Step2Form } from "./_step-2-requirements";
import { Step3Form } from "./_step-3-creator-info";
import { updateGigDraftAction, publishGigAction } from "./actions";

interface DraftStepPageProps {
  params: Promise<{
    id: string;
    n: string;
  }>;
}

export default async function DraftStepPage({ params: paramsPromise }: DraftStepPageProps) {
  const params = await paramsPromise;
  const session = await requireRole("CREATOR", `/gigs/draft/${params.id}/step/${params.n}`);
  const gig = await getGig(params.id);

  if (!gig) {
    redirect("/gigs/manage");
  }

  if (gig.creatorId !== session.user.id) {
    redirect("/gigs/manage");
  }

  const stepNum = parseInt(params.n, 10);

  if (stepNum === 2) {
    return <Step2Form gigId={gig.id} initialData={gig} action={updateGigDraftAction} />;
  }

  if (stepNum === 3) {
    return <Step3Form gigId={gig.id} initialData={gig} action={publishGigAction} />;
  }

  redirect("/gigs/manage");
}
