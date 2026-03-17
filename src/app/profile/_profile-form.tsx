"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ProfileFormState = {
  displayName: string;
  bio: string;
  school: string;
  location: string;
  isRemote: boolean;
  seekingPaid: boolean;
  seekingUnpaid: boolean;
  yearsExperience: string;
  availabilityText: string;
  contactEmail: string;
  instagramUrl: string;
  youtubeUrl: string;
  spotifyUrl: string;
  soundcloudUrl: string;
  websiteUrl: string;
  instrumentsCsv: string;
  genresCsv: string;
};

const inputBase = "input-base";

export function ProfileForm({
  mode,
  initial,
  action,
}: {
  mode: "create" | "edit";
  initial: Partial<ProfileFormState>;
  action: (fd: FormData) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  const header = useMemo(
    () =>
      mode === "create" ? "Create Your Musician Profile" : "Edit Your Profile",
    [mode],
  );

  return (
    <div className="py-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="card p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">{header}</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Creators will use this to discover and contact you. Keep it clear
              and skimmable.
            </p>
          </div>

          <form
            action={async (fd) => {
              setSaving(true);
              try {
                await action(fd);
              } finally {
                setSaving(false);
              }
            }}
            className="space-y-8"
          >
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-200">
                  Basic info
                </h2>
                <span className="text-xs text-zinc-500">Required *</span>
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  Display name <span className="text-violet-300">*</span>
                </label>
                <input
                  name="displayName"
                  defaultValue={initial.displayName ?? ""}
                  className={inputBase}
                  placeholder="e.g. Maya Singh"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">Bio</label>
                <textarea
                  name="bio"
                  defaultValue={initial.bio ?? ""}
                  className={`${inputBase} min-h-[120px]`}
                  placeholder="What do you play, what do you like working on, and what makes you easy to work with?"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-zinc-300">School</label>
                  <input
                    name="school"
                    defaultValue={initial.school ?? ""}
                    className={inputBase}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-300">Location</label>
                  <input
                    name="location"
                    defaultValue={initial.location ?? ""}
                    className={inputBase}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-zinc-200">
                Work preferences
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    name="isRemote"
                    defaultChecked={initial.isRemote ?? true}
                    className="accent-violet-500"
                  />
                  Remote-friendly
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    name="seekingPaid"
                    defaultChecked={initial.seekingPaid ?? true}
                    className="accent-violet-500"
                  />
                  Open to paid
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    name="seekingUnpaid"
                    defaultChecked={initial.seekingUnpaid ?? true}
                    className="accent-violet-500"
                  />
                  Open to unpaid
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-zinc-300">
                    Years of experience
                  </label>
                  <input
                    name="yearsExperience"
                    defaultValue={initial.yearsExperience ?? ""}
                    className={inputBase}
                    placeholder="Optional (number)"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-300">Availability</label>
                  <input
                    name="availabilityText"
                    defaultValue={initial.availabilityText ?? ""}
                    className={inputBase}
                    placeholder="e.g. Weekends + evenings, 2 weeks notice"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-zinc-200">
                Instruments & genres
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-zinc-300">
                    Instruments <span className="text-violet-300">*</span>
                  </label>
                  <input
                    name="instrumentsCsv"
                    defaultValue={initial.instrumentsCsv ?? ""}
                    className={inputBase}
                    placeholder="Comma-separated (e.g. Guitar, Vocals, Piano)"
                    required
                  />
                  <p className="mt-1.5 text-xs text-zinc-500">
                    Comma-separated (e.g. Guitar, Vocals, Piano).
                  </p>
                </div>
                <div>
                  <label className="text-sm text-zinc-300">
                    Genres <span className="text-violet-300">*</span>
                  </label>
                  <input
                    name="genresCsv"
                    defaultValue={initial.genresCsv ?? ""}
                    className={inputBase}
                    placeholder="Comma-separated (e.g. Indie, Hip-hop, Ambient)"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-zinc-200">
                Portfolio links
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-zinc-300">YouTube</label>
                  <input
                    name="youtubeUrl"
                    defaultValue={initial.youtubeUrl ?? ""}
                    className={inputBase}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-300">SoundCloud</label>
                  <input
                    name="soundcloudUrl"
                    defaultValue={initial.soundcloudUrl ?? ""}
                    className={inputBase}
                    placeholder="https://soundcloud.com/..."
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-300">Spotify</label>
                  <input
                    name="spotifyUrl"
                    defaultValue={initial.spotifyUrl ?? ""}
                    className={inputBase}
                    placeholder="https://open.spotify.com/..."
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-300">Website</label>
                  <input
                    name="websiteUrl"
                    defaultValue={initial.websiteUrl ?? ""}
                    className={inputBase}
                    placeholder="https://..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-zinc-300">Instagram</label>
                  <input
                    name="instagramUrl"
                    defaultValue={initial.instagramUrl ?? ""}
                    className={inputBase}
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-zinc-200">Contact</h2>
              <div>
                <label className="text-sm text-zinc-300">
                  Contact email <span className="text-violet-300">*</span>
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  defaultValue={initial.contactEmail ?? ""}
                  className={inputBase}
                  placeholder="e.g. maya@school.edu"
                  required
                />
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/"
                className="text-sm text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </Link>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Saving…" : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

