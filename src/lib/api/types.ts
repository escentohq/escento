export interface Tag {
  id: string;
  name: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  supabaseUserId: string | null;
  role: "MUSICIAN" | "CREATOR" | null;
  isFake: boolean;
}

export interface Gig {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  projectType: string;
  location: string | null;
  isRemote: boolean;
  compensationType: string;
  compensationDetails: string | null;
  deadline: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  instruments?: string[];
  genres?: string[];
  creator?: { name: string | null; email: string };
}

export interface MusicianProfile {
  id: string;
  userId: string;
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
  updatedAt: string;
  instruments?: string[];
  genres?: string[];
}

export interface CreateGigInput {
  creatorId: string;
  title: string;
  description: string;
  projectType: string;
  location: string | null;
  isRemote: boolean;
  compensationType: string;
  compensationDetails: string | null;
  deadline: Date | string | null;
}

export interface UpdateGigInput {
  title?: string;
  description?: string;
  projectType?: string;
  location?: string | null;
  isRemote?: boolean;
  compensationType?: string;
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

export interface CreateUserInput {
  email: string;
  name: string | null;
  image: string | null;
  supabaseUserId: string | null;
  isFake?: boolean;
}

export interface UpdateUserInput {
  email?: string;
  name?: string | null;
  image?: string | null;
  supabaseUserId?: string;
  role?: "MUSICIAN" | "CREATOR" | null;
  isFake?: boolean;
}
