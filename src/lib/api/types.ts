export interface Tag {
  id: string;
  name: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: "MUSICIAN" | "CREATOR" | null;
}

export interface Gig {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  projectType: "FILM" | "LIVE_EVENT" | "PODCAST" | "GAME" | "YOUTUBE" | "OTHER";
  location: string | null;
  isRemote: boolean;
  compensationType: "PAID" | "UNPAID" | "NEGOTIABLE";
  compensationDetails: string | null;
  deadline: string | null;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  instruments?: string[];
  genres?: string[];
  creator?: { name: string | null; email: string };
}

export interface MusicianProfile {
  id: string;
  userId: string;
  image: string | null;
  displayName: string;
  bio: string | null;
  school: string | null;
  location: string | null;
  isRemote: boolean;
  seekingPaid: boolean;
  seekingUnpaid: boolean;
  yearsExperience: number | null;
  availabilityText: string | null;
  contactEmail: string;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  soundcloudUrl: string | null;
  websiteUrl: string | null;
  createdAt: string;
  updatedAt: string;
  instruments?: string[];
  genres?: string[];
}

export interface CreateGigInput {
  title: string;
  description: string;
  projectType: "FILM" | "LIVE_EVENT" | "PODCAST" | "GAME" | "YOUTUBE" | "OTHER";
  location: string | null;
  isRemote: boolean;
  compensationType: "PAID" | "UNPAID" | "NEGOTIABLE";
  compensationDetails: string | null;
  deadline: Date | string | null;
}

export interface UpdateGigInput {
  title?: string;
  description?: string;
  projectType?: "FILM" | "LIVE_EVENT" | "PODCAST" | "GAME" | "YOUTUBE" | "OTHER";
  location?: string | null;
  isRemote?: boolean;
  compensationType?: "PAID" | "UNPAID" | "NEGOTIABLE";
  compensationDetails?: string | null;
  deadline?: Date | string | null;
}

export interface CreateProfileInput {
  displayName: string;
  bio: string | null;
  school: string | null;
  location: string | null;
  isRemote: boolean;
  seekingPaid: boolean;
  seekingUnpaid: boolean;
  yearsExperience: number | null;
  availabilityText: string | null;
  contactEmail: string;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  soundcloudUrl: string | null;
  websiteUrl: string | null;
}

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string | null;
  school?: string | null;
  location?: string | null;
  isRemote?: boolean;
  seekingPaid?: boolean;
  seekingUnpaid?: boolean;
  yearsExperience?: number | null;
  availabilityText?: string | null;
  contactEmail?: string;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  spotifyUrl?: string | null;
  soundcloudUrl?: string | null;
  websiteUrl?: string | null;
}
