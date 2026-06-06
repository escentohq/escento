import { CheckCircle2, XCircle } from "lucide-react";
import { redirect } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import { ProfileForm } from "../_profile-form";
import { updateMusicianProfileAction } from "./actions";

export default async function EditProfilePage() {
  const session = await requireRole("MUSICIAN", "/profile/edit");

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) redirect("/profile/create");

  const instrumentsCsv = (profile.instruments || []).join(", ");
  const genresCsv = (profile.genres || []).join(", ");

  const hasBio = Boolean(profile.bio && profile.bio.trim().length >= 50);
  const hasLink = Boolean(
    profile.instagramUrl || profile.youtubeUrl || profile.spotifyUrl ||
    profile.soundcloudUrl || profile.websiteUrl,
  );

  return (
    <PageShell
      eyebrow="Soundcheck"
      title="Edit Profile"
      body="Tune the details creators see before they reach out."
      size="medium"
    >
      {!profile.isVerified && (
        <div className="mb-6 rounded-2xl border border-[#FF3366]/20 bg-[#FF3366]/5 px-5 py-5">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
            Your profile is hidden
          </p>
          <p className="mt-1 text-sm font-medium text-[#475569]">
            Complete both steps below to appear in the musician directory.
          </p>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3">
              {hasBio
                ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0055FF]" aria-hidden />
                : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#FF3366]" aria-hidden />}
              <span className={`text-sm font-bold ${hasBio ? "text-[#0F172A]" : "text-[#475569]"}`}>
                Bio with at least 50 characters
                {!hasBio && profile.bio && (
                  <span className="ml-1 font-normal text-[#94A3B8]">({profile.bio.trim().length}/50)</span>
                )}
              </span>
            </li>
            <li className="flex items-start gap-3">
              {hasLink || profile.noPortfolioAttested
                ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0055FF]" aria-hidden />
                : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#FF3366]" aria-hidden />}
              <span className={`text-sm font-bold ${hasLink || profile.noPortfolioAttested ? "text-[#0F172A]" : "text-[#475569]"}`}>
                At least one portfolio link — or check &ldquo;I don&apos;t have links yet&rdquo; in the Links section
              </span>
            </li>
          </ul>
        </div>
      )}

      <ProfileForm
        mode="edit"
        initial={{
          displayName: profile.displayName,
          bio: profile.bio ?? "",
          school: profile.school ?? "",
          location: profile.location ?? "",
          isRemote: profile.isRemote,
          seekingPaid: profile.seekingPaid,
          seekingUnpaid: profile.seekingUnpaid,
          yearsExperience:
            profile.yearsExperience === null || profile.yearsExperience === undefined
              ? ""
              : String(profile.yearsExperience),
          availabilityText: profile.availabilityText ?? "",
          contactEmail: profile.contactEmail ?? "",
          instagramUrl: profile.instagramUrl ?? "",
          youtubeUrl: profile.youtubeUrl ?? "",
          spotifyUrl: profile.spotifyUrl ?? "",
          soundcloudUrl: profile.soundcloudUrl ?? "",
          websiteUrl: profile.websiteUrl ?? "",
          instrumentsCsv,
          genresCsv,
          noPortfolioAttested: profile.noPortfolioAttested,
        }}
        action={updateMusicianProfileAction}
      />
    </PageShell>
  );
}
