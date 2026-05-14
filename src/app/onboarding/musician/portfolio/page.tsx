import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import { PortfolioForm } from "./_form";
import { savePortfolioAction } from "./actions";

export default async function PortfolioPage() {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/portfolio");
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect("/onboarding/musician/basics");
  }

  return <PortfolioForm action={savePortfolioAction} initialData={profile} />;
}
