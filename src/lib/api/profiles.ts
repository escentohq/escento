import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureInstruments, ensureGenres } from "./tags";
import type { MusicianProfile, CreateProfileInput, UpdateProfileInput } from "./types";

function toProfile(raw: any): MusicianProfile {
  return {
    id: raw.id,
    userId: raw.user_id,
    displayName: raw.display_name,
    bio: raw.bio,
    school: raw.school,
    location: raw.location,
    isRemote: raw.is_remote,
    seekingPaid: raw.seeking_paid,
    seekingUnpaid: raw.seeking_unpaid,
    yearsExperience: raw.years_experience,
    availabilityText: raw.availability_text,
    contactEmail: raw.contact_email,
    instagramUrl: raw.instagram_url,
    youtubeUrl: raw.youtube_url,
    spotifyUrl: raw.spotify_url,
    soundcloudUrl: raw.soundcloud_url,
    websiteUrl: raw.website_url,
    profileImageUrl: raw.profile_image_url,
    resumePdfUrl: raw.resume_pdf_url,
    videoPortfolioUrl: raw.video_portfolio_url,
    willingToTravel: raw.willing_to_travel ?? false,
    travelRadiusMiles: raw.travel_radius_miles,
    tourStartDate: raw.tour_start_date,
    tourEndDate: raw.tour_end_date,
    minNoticeDays: raw.min_notice_days ?? 14,
    isSearchable: raw.is_searchable ?? true,
    allowEventInvitations: raw.allow_event_invitations ?? true,
    newsletterOptIn: raw.newsletter_opt_in ?? false,
    onboardingStep: raw.onboarding_step ?? 0,
    updatedAt: raw.updated_at,
    instruments: raw.musician_instrument?.map((x: any) => x.instrument?.name).filter(Boolean) ?? [],
    genres: raw.musician_genre?.map((x: any) => x.genre?.name).filter(Boolean) ?? [],
  };
}

export async function getProfile(id: string): Promise<MusicianProfile | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("musician_profile")
    .select("*, musician_instrument(*, instrument(*)), musician_genre(*, genre(*))")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ? toProfile(data) : null;
}

export async function getProfileByUserId(userId: string): Promise<MusicianProfile | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("musician_profile")
    .select("*, musician_instrument(*, instrument(*)), musician_genre(*, genre(*))")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ? toProfile(data) : null;
}

interface ListProfilesFilters {
  instrument?: string;
  genre?: string;
}

export async function listProfiles(filters?: ListProfilesFilters): Promise<MusicianProfile[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("musician_profile")
    .select("*, musician_instrument(*, instrument(*)), musician_genre(*, genre(*))")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  let profiles = (data || []).map(toProfile);

  if (filters?.instrument) {
    const instrument = filters.instrument;
    profiles = profiles.filter((p) => p.instruments?.includes(instrument));
  }

  if (filters?.genre) {
    const genre = filters.genre;
    profiles = profiles.filter((p) => p.genres?.includes(genre));
  }

  return profiles.slice(0, 50);
}

export async function createProfile(
  userId: string,
  input: CreateProfileInput,
  instrumentNames: string[],
  genreNames: string[],
): Promise<MusicianProfile> {
  const supabase = await createSupabaseServerClient();
  const [instruments, genres] = await Promise.all([
    ensureInstruments(instrumentNames),
    ensureGenres(genreNames),
  ]);

  const { data: profile, error: profileError } = await supabase
    .from("musician_profile")
    .insert({
      id: crypto.randomUUID(),
      user_id: userId,
      display_name: input.displayName,
      bio: input.bio,
      school: input.school,
      location: input.location,
      is_remote: input.isRemote,
      seeking_paid: input.seekingPaid,
      seeking_unpaid: input.seekingUnpaid,
      years_experience: input.yearsExperience,
      availability_text: input.availabilityText,
      contact_email: input.contactEmail,
      instagram_url: input.instagramUrl,
      youtube_url: input.youtubeUrl,
      spotify_url: input.spotifyUrl,
      soundcloud_url: input.soundcloudUrl,
      website_url: input.websiteUrl,
    })
    .select()
    .single();

  if (profileError) throw profileError;

  await Promise.all([
    ...instruments.map((inst) =>
      supabase.from("musician_instrument").insert({
        id: crypto.randomUUID(),
        musician_profile_id: profile.id,
        instrument_id: inst.id,
      })
    ),
    ...genres.map((genre) =>
      supabase.from("musician_genre").insert({
        id: crypto.randomUUID(),
        musician_profile_id: profile.id,
        genre_id: genre.id,
      })
    ),
  ]);

  return {
    id: profile.id,
    userId: profile.user_id,
    displayName: profile.display_name,
    bio: profile.bio,
    school: profile.school,
    location: profile.location,
    isRemote: profile.is_remote,
    seekingPaid: profile.seeking_paid,
    seekingUnpaid: profile.seeking_unpaid,
    yearsExperience: profile.years_experience,
    availabilityText: profile.availability_text,
    contactEmail: profile.contact_email,
    instagramUrl: profile.instagram_url,
    youtubeUrl: profile.youtube_url,
    spotifyUrl: profile.spotify_url,
    soundcloudUrl: profile.soundcloud_url,
    websiteUrl: profile.website_url,
    profileImageUrl: profile.profile_image_url || null,
    resumePdfUrl: profile.resume_pdf_url || null,
    videoPortfolioUrl: profile.video_portfolio_url || null,
    willingToTravel: profile.willing_to_travel ?? false,
    travelRadiusMiles: profile.travel_radius_miles || null,
    tourStartDate: profile.tour_start_date || null,
    tourEndDate: profile.tour_end_date || null,
    minNoticeDays: profile.min_notice_days ?? 14,
    isSearchable: profile.is_searchable ?? true,
    allowEventInvitations: profile.allow_event_invitations ?? true,
    newsletterOptIn: profile.newsletter_opt_in ?? false,
    onboardingStep: profile.onboarding_step ?? 0,
    updatedAt: profile.updated_at,
    instruments: instrumentNames,
    genres: genreNames,
  };
}

export async function updateProfile(
  id: string,
  input: UpdateProfileInput,
  instrumentNames?: string[],
  genreNames?: string[],
): Promise<MusicianProfile> {
  const supabase = await createSupabaseServerClient();

  const updateData: Record<string, any> = {};
  if (input.displayName !== undefined) updateData.display_name = input.displayName;
  if (input.bio !== undefined) updateData.bio = input.bio;
  if (input.school !== undefined) updateData.school = input.school;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.isRemote !== undefined) updateData.is_remote = input.isRemote;
  if (input.seekingPaid !== undefined) updateData.seeking_paid = input.seekingPaid;
  if (input.seekingUnpaid !== undefined) updateData.seeking_unpaid = input.seekingUnpaid;
  if (input.yearsExperience !== undefined) updateData.years_experience = input.yearsExperience;
  if (input.availabilityText !== undefined) updateData.availability_text = input.availabilityText;
  if (input.contactEmail !== undefined) updateData.contact_email = input.contactEmail;
  if (input.instagramUrl !== undefined) updateData.instagram_url = input.instagramUrl;
  if (input.youtubeUrl !== undefined) updateData.youtube_url = input.youtubeUrl;
  if (input.spotifyUrl !== undefined) updateData.spotify_url = input.spotifyUrl;
  if (input.soundcloudUrl !== undefined) updateData.soundcloud_url = input.soundcloudUrl;
  if (input.websiteUrl !== undefined) updateData.website_url = input.websiteUrl;
  if (input.profileImageUrl !== undefined) updateData.profile_image_url = input.profileImageUrl;
  if (input.resumePdfUrl !== undefined) updateData.resume_pdf_url = input.resumePdfUrl;
  if (input.videoPortfolioUrl !== undefined) updateData.video_portfolio_url = input.videoPortfolioUrl;
  if (input.willingToTravel !== undefined) updateData.willing_to_travel = input.willingToTravel;
  if (input.travelRadiusMiles !== undefined) updateData.travel_radius_miles = input.travelRadiusMiles;
  if (input.tourStartDate !== undefined) updateData.tour_start_date = input.tourStartDate;
  if (input.tourEndDate !== undefined) updateData.tour_end_date = input.tourEndDate;
  if (input.minNoticeDays !== undefined) updateData.min_notice_days = input.minNoticeDays;
  if (input.isSearchable !== undefined) updateData.is_searchable = input.isSearchable;
  if (input.allowEventInvitations !== undefined) updateData.allow_event_invitations = input.allowEventInvitations;
  if (input.newsletterOptIn !== undefined) updateData.newsletter_opt_in = input.newsletterOptIn;
  if (input.onboardingStep !== undefined) updateData.onboarding_step = input.onboardingStep;

  if (instrumentNames || genreNames) {
    await Promise.all([
      supabase.from("musician_instrument").delete().eq("musician_profile_id", id),
      supabase.from("musician_genre").delete().eq("musician_profile_id", id),
    ]);
  }

  const { error: updateError } = await supabase
    .from("musician_profile")
    .update(updateData)
    .eq("id", id);

  if (updateError) throw updateError;

  if (instrumentNames || genreNames) {
    const [instruments, genres] = await Promise.all([
      instrumentNames ? ensureInstruments(instrumentNames) : Promise.resolve([]),
      genreNames ? ensureGenres(genreNames) : Promise.resolve([]),
    ]);

    await Promise.all([
      ...instruments.map((inst) =>
        supabase.from("musician_instrument").insert({
          id: crypto.randomUUID(),
          musician_profile_id: id,
          instrument_id: inst.id,
        })
      ),
      ...genres.map((genre) =>
        supabase.from("musician_genre").insert({
          id: crypto.randomUUID(),
          musician_profile_id: id,
          genre_id: genre.id,
        })
      ),
    ]);
  }

  const { data } = await supabase
    .from("musician_profile")
    .select("*, musician_instrument(*, instrument(*)), musician_genre(*, genre(*))")
    .eq("id", id)
    .single();

  return toProfile(data);
}

export async function updateOnboardingStep(profileId: string, step: number): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("musician_profile")
    .update({ onboarding_step: step })
    .eq("id", profileId);
  if (error) throw error;
}

export async function saveMusicianRates(
  profileId: string,
  rates: { rateType: string; amount: number; currency: string; notes: string | null }[],
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.from("musician_rates").delete().eq("musician_profile_id", profileId);
  if (rates.length === 0) return;

  const rows = rates.map((r) => ({
    id: crypto.randomUUID(),
    musician_profile_id: profileId,
    rate_type: r.rateType,
    amount: r.amount,
    currency: r.currency,
    description: r.notes,
  }));

  const { error } = await supabase.from("musician_rates").insert(rows);
  if (error) throw error;
}

export async function getMusicianRates(
  profileId: string,
): Promise<{ id: string; rateType: string; amount: number; currency: string; description: string | null }[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("musician_rates")
    .select("*")
    .eq("musician_profile_id", profileId)
    .order("created_at");

  if (error) throw error;

  return (data || []).map((r: any) => ({
    id: r.id,
    rateType: r.rate_type,
    amount: r.amount,
    currency: r.currency,
    description: r.description,
  }));
}
