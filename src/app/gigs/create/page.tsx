import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { GigForm } from "../_gig-form";
import { createGig } from "./actions";

export default async function CreateGigPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role !== "CREATOR") redirect("/");

  return (
    <div className="py-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="card p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
              Post a Gig
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Keep it clear and structured so musicians can respond fast.
            </p>
          </div>
          <GigForm
            action={createGig}
            submitLabel="Publish Gig"
            cancelHref="/gigs"
          />
        </div>
      </div>
    </div>
  );
}

