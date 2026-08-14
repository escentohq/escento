export const PUBLIC_MUSICIANS_TAG = "public:musicians";
export const PUBLIC_GIGS_TAG = "public:gigs";
export const PUBLIC_HOME_TAG = "public:home";
export const INSTRUMENTS_TAG = "taxonomy:instruments";
export const GENRES_TAG = "taxonomy:genres";

export function publicMusicianTag(id: string) {
  return `public:musician:${id}`;
}

export function publicGigTag(id: string) {
  return `public:gig:${id}`;
}
