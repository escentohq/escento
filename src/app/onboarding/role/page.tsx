import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { setRole } from "./actions";

export default async function RoleOnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role) redirect("/");

  return (
    <div className="mx-auto max-w-xl py-8">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          Choose your role
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          This helps GigForge show the right tools for you.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <form
            action={async () => {
              "use server";
              await setRole("MUSICIAN");
            }}
            className="flex-1"
          >
            <button type="submit" className="btn-primary w-full">
              I’m a Musician
            </button>
          </form>
          <form
            action={async () => {
              "use server";
              await setRole("CREATOR");
            }}
            className="flex-1"
          >
            <button type="submit" className="btn-primary w-full">
              I’m a Creator
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
