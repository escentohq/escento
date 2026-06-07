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
  locationDisplayName: string | null;
  locationPlaceId: string | null;
  locationLat: number | null;
  locationLng: number | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  locationProvider: string | null;
  providerPlaceId: string | null;
  locationVisibility: "public_region" | "private";
  isRemote: boolean;
  isPublic: boolean;
  isVerified: boolean;
  moderationReason: string | null;
  deletedAt: string | null;
  distanceMiles?: number | null;
  compensationType: "PAID" | "UNPAID" | "NEGOTIABLE";
  compensationDetails: string | null;
  deadline: string | null;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  instruments?: string[];
  genres?: string[];
  creator?: { name: string | null; email: string | null };
}

export interface MusicianProfile {
  id: string;
  userId: string;
  image: string | null;
  displayName: string;
  bio: string | null;
  school: string | null;
  location: string | null;
  locationDisplayName: string | null;
  locationPlaceId: string | null;
  locationLat: number | null;
  locationLng: number | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  locationProvider: string | null;
  providerPlaceId: string | null;
  locationVisibility: "public_region" | "private";
  isRemote: boolean;
  isPublic: boolean;
  isVerified: boolean;
  moderationReason: string | null;
  deletedAt: string | null;
  distanceMiles?: number | null;
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
  locationDisplayName: string | null;
  locationPlaceId: string | null;
  locationLat: number | null;
  locationLng: number | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  locationProvider: string | null;
  providerPlaceId: string | null;
  locationVisibility: "public_region" | "private";
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
  locationDisplayName?: string | null;
  locationPlaceId?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  locationCity?: string | null;
  locationState?: string | null;
  locationCountry?: string | null;
  locationProvider?: string | null;
  providerPlaceId?: string | null;
  locationVisibility?: "public_region" | "private";
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
  locationDisplayName: string | null;
  locationPlaceId: string | null;
  locationLat: number | null;
  locationLng: number | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  locationProvider: string | null;
  providerPlaceId: string | null;
  locationVisibility: "public_region" | "private";
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
  locationDisplayName?: string | null;
  locationPlaceId?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  locationCity?: string | null;
  locationState?: string | null;
  locationCountry?: string | null;
  locationProvider?: string | null;
  providerPlaceId?: string | null;
  locationVisibility?: "public_region" | "private";
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

export type ConnectionRequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";

export type ConversationType = "direct";

export interface MessagingUserSummary {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: "MUSICIAN" | "CREATOR" | null;
}

export interface ConnectionRequest {
  id: string;
  requesterId: string;
  recipientId: string;
  status: ConnectionRequestStatus;
  introMessage: string | null;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  requester?: MessagingUserSummary;
  recipient?: MessagingUserSummary;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: string;
  lastReadAt: string | null;
  deletedAt: string | null;
  user?: MessagingUserSummary;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sender?: MessagingUserSummary;
}

export interface ConversationSummary {
  id: string;
  type: ConversationType;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  createdBy: string;
  sourceRequestId: string | null;
  participants: ConversationParticipant[];
  otherParticipant: ConversationParticipant | null;
  lastMessage: MessageRecord | null;
  unreadCount: number;
}

export interface ConversationDetail extends ConversationSummary {
  messages: MessageRecord[];
}

export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
  blockedUser?: MessagingUserSummary;
}

export type MessagingRelationship =
  | { status: "self" }
  | { status: "none" }
  | { status: "pending_outgoing"; request: ConnectionRequest }
  | { status: "pending_incoming"; request: ConnectionRequest }
  | { status: "connected"; conversationId: string };

export interface MessagingBlockStatus {
  blockedByMe: boolean;
  blockedMe: boolean;
}
