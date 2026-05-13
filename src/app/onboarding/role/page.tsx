import { Music, Video } from "lucide-react";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { PageShell } from "@/components/ui/page-shell";
import { getServerSession } from "next-auth";
import { setRole } from "./actions";

export default async function RoleOnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin?callbackUrl=/onboarding/role");
  if (session.user.role) redirect("/");

  return (
    <PageShell
      eyebrow="Soundcheck"
      title="Choose your role"
      body="Pick the side you are using today. Motivo keeps the tools focused around that choice."
      size="medium"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <form action={async () => { "use server"; await setRole("MUSICIAN"); }}>
          <button type="submit" className="group flex h-full min-h-64 w-full flex-col items-start rounded-3xl border border-[#F1F5F9] bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0055FF]/10 focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0055FF]/10 text-[#0055FF]">
              <Music className="h-7 w-7" aria-hidden />
            </span>
            <span className="mt-8 text-2xl font-black tracking-tight text-[#0F172A]">I’m a Musician</span>
            <span className="mt-3 text-base font-medium leading-relaxed text-[#475569]">
              Build a profile, list your sound, and get found by creators.
            </span>
            <span className="mt-auto pt-8 text-sm font-black text-[#0055FF]">Take the stage →</span>
          </button>
        </form>

        <form action={async () => { "use server"; await setRole("CREATOR"); }}>
          <button type="submit" className="group flex h-full min-h-64 w-full flex-col items-start rounded-3xl border border-[#F1F5F9] bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#FF3366]/10 focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF3366]/10 text-[#FF3366]">
              <Video className="h-7 w-7" aria-hidden />
            </span>
            <span className="mt-8 text-2xl font-black tracking-tight text-[#0F172A]">I’m a Creator</span>
            <span className="mt-3 text-base font-medium leading-relaxed text-[#475569]">
              Post a gig, name the brief, and find the right musician.
            </span>
            <span className="mt-auto pt-8 text-sm font-black text-[#FF3366]">Run the set →</span>
          </button>
        </form>
      </div>
    </PageShell>
  );
}

