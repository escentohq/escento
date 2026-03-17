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

export async function createGig(fd: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role !== "CREATOR") redirect("/");

  const title = strOrEmpty(fd.get("title")).trim();
  const description = strOrEmpty(fd.get("description")).trim();
  const projectType = strOrEmpty(fd.get("projectType")).trim();

  const location = nonEmptyOrNull(fd.get("location"));
  const isRemote = fd.get("isRemote") === "on";

  const compensationType = strOrEmpty(fd.get("compensationType")).trim();
  const compensationDetails = nonEmptyOrNull(fd.get("compensationDetails"));

  const deadlineRaw = strOrEmpty(fd.get("deadline")).trim();
  const deadline = deadlineRaw.length ? new Date(deadlineRaw) : null;

  const instruments = parseCsv(strOrEmpty(fd.get("instrumentsCsv")));
  const genres = parseCsv(strOrEmpty(fd.get("genresCsv")));

  if (!title) throw new Error("Title is required.");
  if (!description) throw new Error("Description is required.");
  if (!projectType) throw new Error("Project type is required.");
  if (!compensationType) throw new Error("Compensation type is required.");

  if (deadlineRaw.length && Number.isNaN(deadline?.getTime())) {
    throw new Error("Deadline must be a valid date.");
  }

  const gig = await db.$transaction(async (tx) => {
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
  
    return tx.gig.create({
      data: {
        creatorId: session.user.id,
        title,
        description,
        projectType: projectType as never,
        location,
        isRemote,
        compensationType: compensationType as never,
        compensationDetails,
        deadline,
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
      select: { id: true },
    });
  });
  
  redirect(`/gigs/${gig.id}`);
}

