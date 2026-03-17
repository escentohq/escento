"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { db } from "@/lib/db";

function parseCsv(input: string) {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\s+/g, " "));
}

function nonEmptyOrNull(value: FormDataEntryValue | null) {
  const v = typeof value === "string" ? value.trim() : "";
  return v.length ? v : null;
}

function strOrEmpty(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function createMusicianProfile(fd: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role !== "MUSICIAN") redirect("/");

  const existing = await db.musicianProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (existing) redirect("/profile/edit");

  const displayName = strOrEmpty(fd.get("displayName")).trim();
  const bio = nonEmptyOrNull(fd.get("bio"));
  const school = nonEmptyOrNull(fd.get("school"));
  const location = nonEmptyOrNull(fd.get("location"));

  const isRemote = fd.get("isRemote") === "on";
  const seekingPaid = fd.get("seekingPaid") === "on";
  const seekingUnpaid = fd.get("seekingUnpaid") === "on";

  const yearsExperienceRaw = strOrEmpty(fd.get("yearsExperience")).trim();
  const yearsExperience = yearsExperienceRaw.length
    ? Number.parseInt(yearsExperienceRaw, 10)
    : null;

  const availabilityText = nonEmptyOrNull(fd.get("availabilityText"));
  const contactEmail = strOrEmpty(fd.get("contactEmail")).trim();

  const instruments = parseCsv(strOrEmpty(fd.get("instrumentsCsv")));
  const genres = parseCsv(strOrEmpty(fd.get("genresCsv")));

  const instagramUrl = nonEmptyOrNull(fd.get("instagramUrl"));
  const youtubeUrl = nonEmptyOrNull(fd.get("youtubeUrl"));
  const spotifyUrl = nonEmptyOrNull(fd.get("spotifyUrl"));
  const soundcloudUrl = nonEmptyOrNull(fd.get("soundcloudUrl"));
  const websiteUrl = nonEmptyOrNull(fd.get("websiteUrl"));

  if (!displayName) throw new Error("Display name is required.");
  if (!contactEmail) throw new Error("Contact email is required.");
  if (!instruments.length) throw new Error("At least one instrument required.");
  if (!genres.length) throw new Error("At least one genre required.");
  if (yearsExperienceRaw.length && Number.isNaN(yearsExperience)) {
    throw new Error("Years of experience must be a number.");
  }

  await db.$transaction(async (tx) => {
    const ensuredInstruments = await Promise.all(
      instruments.map(async (name) => {
        const existing = await tx.instrument.findFirst({ where: { name } });
        return existing ?? tx.instrument.create({ data: { name } });
      }),
    );
    const ensuredGenres = await Promise.all(
      genres.map(async (name) => {
        const existing = await tx.genre.findFirst({ where: { name } });
        return existing ?? tx.genre.create({ data: { name } });
      }),
    );

    await tx.musicianProfile.create({
      data: {
        userId: session.user.id,
        displayName,
        bio,
        school,
        location,
        isRemote,
        seekingPaid,
        seekingUnpaid,
        yearsExperience,
        availabilityText,
        contactEmail,
        instagramUrl,
        youtubeUrl,
        spotifyUrl,
        soundcloudUrl,
        websiteUrl,
        instruments: {
          create: ensuredInstruments.map((inst) => ({
            instrumentId: inst.id,
          })),
        },
        genres: {
          create: ensuredGenres.map((g) => ({
            genreId: g.id,
          })),
        },
      },
    });
  });

  redirect("/profile/edit");
}

