// Types partagés entre frontend et backend

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  profile?: UserSportProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  location?: any;
  sports?: string[];
  skillLevel?: string;
  availability?: string[];
  enableGeolocation?: boolean;
  lastKnownPosition?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
}

export interface UserSportProfile {
  avatar?: string;
  favoriteSports: Sport[];
  skillLevels: SkillLevelBySport[];
  availability: UserAvailability;
  bio?: string;
  location?: {
    city: string;
    postalCode?: string;
  };
  notifications?: {
    events: boolean;
    messages: boolean;
    reminders: boolean;
  };
  enableGeolocation?: boolean;
  lastKnownPosition?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
}

export interface SkillLevelBySport {
  sport: Sport;
  level: SkillLevel;
}

export interface UserAvailability {
  weekdays: DayAvailability[];
  preferredTimes: TimeSlot[];
}

export interface DayAvailability {
  day: DayOfWeek;
  available: boolean;
  timeSlots?: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // Format: "HH:mm"
  endTime: string;   // Format: "HH:mm"
}

export enum DayOfWeek {
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
  Saturday = 'saturday',
  Sunday = 'sunday'
}

export interface UserRegistration {
  email: string;
  password: string;
  name: string;
  profile?: {
    favoriteSports?: Sport[];
    skillLevels?: SkillLevelBySport[];
    bio?: string;
    location?: {
      city: string;
      postalCode?: string;
    };
    availability?: {
      weekdays: DayAvailability[];
      preferredTimes: TimeSlot[];
    };
  };
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: Date;
  user: User;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  sport: Sport;
  location: EventLocation;
  maxParticipants: number;
  minParticipants: number;
  level: SkillLevel;
  startDate: Date;
  endDate: Date;
  startTime: string;
  duration: number;
  teamId?: string;
  createdById: string;
  participants: EventParticipant[];
  createdAt: Date;
  updatedAt: Date;
  status: EventStatus;
  price?: number;
  equipment?: string[];
  // Additional properties for frontend compatibility
  category?: 'sports' | 'social' | 'corporate';
  type?: string;
  date: Date; // Alias for startDate for backward compatibility
  imageUrl?: string;
  skillLevel?: SkillLevel; // Alias for level
  currentParticipants?: number;
  coordinates?: { lat: number; lng: number };
}

export interface EventFilters {
  sport?: Sport;
  city?: string;
  level?: SkillLevel;
  status?: EventStatus;
  maxPrice?: number;
  startDate?: Date;
  endDate?: Date;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface EventLocation {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  type: LocationType;
}

export enum Sport {
  Football = 'football',
  Basketball = 'basketball',
  Tennis = 'tennis',
  Volleyball = 'volleyball',
  Running = 'running',
  Cycling = 'cycling',
  Swimming = 'swimming',
  Badminton = 'badminton',
  TableTennis = 'table_tennis',
  Gymnastics = 'gymnastics',
  Hiking = 'hiking',
  Jogging = 'jogging',
  Dance = 'dance',
  Rugby = 'rugby',
  Handball = 'handball',
  Other = 'autre'
}

export enum SkillLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
  Mixed = 'mixed'
}

export enum EventStatus {
  Draft = 'draft',
  Published = 'published',
  Full = 'full',
  Cancelled = 'cancelled',
  Completed = 'completed'
}

export enum LocationType {
  Indoor = 'indoor',
  Outdoor = 'outdoor',
  Both = 'both'
}

// Types de statut
export type TeamRole = 'owner' | 'admin' | 'member';
export type ParticipationStatus = 'attending' | 'not_attending' | 'maybe' | 'pending';

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  status: ParticipationStatus;
  user: User;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form types
export interface CreateUserForm {
  email: string;
  name: string;
  avatar?: string;
}

export interface CreateTeamForm {
  name: string;
  description?: string;
}

export interface CreateEventForm {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  teamId: string;
}

export interface UpdateProfileForm {
  name: string;
  email: string;
  avatar?: string;
}

// Message types
export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: User;
  receiverId?: string;
  receiver?: User;
  conversationId?: string;
  conversation?: Conversation;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  isDeleted: boolean;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'event';
  eventId?: string;
  event?: Event;
  messages: Message[];
  participants: ConversationParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user: User;
  joinedAt: Date;
  lastReadAt: Date;
}

export interface UserSearchResult {
  id: string;
  email: string;
  username: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}
