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
  experienceLevel: string | null;
  ensembleSize: string | null;
  equipmentRequirements: string | null;
  creatorName: string | null;
  creatorPhone: string | null;
  creatorBio: string | null;
  creatorContactMethod: string | null;
  creatorContactLink: string | null;
  instruments?: string[];
  genres?: string[];
  applicationQuestions?: { text: string; type: string }[];
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
  profileImageUrl: string | null;
  resumePdfUrl: string | null;
  videoPortfolioUrl: string | null;
  willingToTravel: boolean;
  travelRadiusMiles: number | null;
  tourStartDate: string | null;
  tourEndDate: string | null;
  minNoticeDays: number;
  isSearchable: boolean;
  allowEventInvitations: boolean;
  newsletterOptIn: boolean;
  onboardingStep: number;
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
  status?: string;
  experienceLevel?: string | null;
  ensembleSize?: string | null;
  equipmentRequirements?: string | null;
  creatorName?: string | null;
  creatorPhone?: string | null;
  creatorBio?: string | null;
  creatorContactMethod?: string | null;
  creatorContactLink?: string | null;
}

export interface GigApplicationQuestion {
  id: string;
  gigId: string;
  text: string;
  questionType: string;
  sortOrder: number;
}

export interface MusicianRate {
  id: string;
  rateType: string;
  amount: number;
  currency: string;
  description: string | null;
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
  profileImageUrl?: string | null;
  resumePdfUrl?: string | null;
  videoPortfolioUrl?: string | null;
  willingToTravel?: boolean;
  travelRadiusMiles?: number | null;
  tourStartDate?: string | null;
  tourEndDate?: string | null;
  minNoticeDays?: number;
  isSearchable?: boolean;
  allowEventInvitations?: boolean;
  newsletterOptIn?: boolean;
  onboardingStep?: number;
}

export interface CreateUserInput {
  email: string;
  name: string | null;
  image: string | null;
  supabaseUserId: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string | null;
  image?: string | null;
  supabaseUserId?: string;
  role?: "MUSICIAN" | "CREATOR" | null;
}
