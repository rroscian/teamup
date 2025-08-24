// Types partagés entre frontend et backend

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  profile?: UserSportProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSportProfile {
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
  teamId?: string;
  createdById: string;
  participants: EventParticipant[];
  createdAt: Date;
  updatedAt: Date;
  status: EventStatus;
  price?: number;
  equipment?: string[];
}

export interface EventFilters {
  sport?: Sport;
  city?: string;
  level?: SkillLevel;
  status?: EventStatus;
  maxPrice?: number;
  startDate?: Date;
  endDate?: Date;
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
  Other = 'other'
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
