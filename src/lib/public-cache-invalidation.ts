import { updateTag } from "next/cache";

import {
  GENRES_TAG,
  INSTRUMENTS_TAG,
  PUBLIC_GIGS_TAG,
  PUBLIC_HOME_TAG,
  PUBLIC_MUSICIANS_TAG,
  publicGigTag,
  publicMusicianTag,
} from "@/lib/cache-tags";

// These helpers are called only after authorized Server Action mutations.
export function invalidatePublicProfile(id?: string) {
  updateTag(PUBLIC_MUSICIANS_TAG);
  updateTag(PUBLIC_HOME_TAG);
  updateTag(INSTRUMENTS_TAG);
  updateTag(GENRES_TAG);
  if (id) updateTag(publicMusicianTag(id));
}

export function invalidatePublicGig(id?: string) {
  updateTag(PUBLIC_GIGS_TAG);
  updateTag(PUBLIC_HOME_TAG);
  updateTag(INSTRUMENTS_TAG);
  updateTag(GENRES_TAG);
  if (id) updateTag(publicGigTag(id));
}
