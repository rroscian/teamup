import { Event, EventStatus, Sport, SkillLevel, LocationType, EventLocation } from '@/shared/types';

// Simulated event data
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Match de Football Amical',
    description: 'Venez jouer un match de foot décontracté entre amis!',
    sport: Sport.Football,
    location: {
      name: 'Stade Municipal',
      address: '123 rue du Sport',
      city: 'Paris',
      postalCode: '75001',
      latitude: 48.8566,
      longitude: 2.3522,
      type: LocationType.Outdoor
    },
    maxParticipants: 22,
    minParticipants: 10,
    level: SkillLevel.Mixed,
    startDate: new Date('2025-07-25T18:00:00'),
    endDate: new Date('2025-07-25T20:00:00'),
    createdById: '1',
    participants: [],
    createdAt: new Date('2025-07-19T10:00:00'),
    updatedAt: new Date('2025-07-19T10:00:00'),
    status: EventStatus.Published,
    price: 0,
    equipment: ['Chaussures de sport', 'Tenue de sport']
  },
  {
    id: '2',
    title: 'Tournoi de Tennis Double',
    description: 'Tournoi de tennis en double pour joueurs intermédiaires.',
    sport: Sport.Tennis,
    location: {
      name: 'Tennis Club Central',
      address: '45 avenue des Courts',
      city: 'Lyon',
      postalCode: '69000',
      latitude: 45.7640,
      longitude: 4.8357,
      type: LocationType.Outdoor
    },
    maxParticipants: 16,
    minParticipants: 8,
    level: SkillLevel.Intermediate,
    startDate: new Date('2025-07-28T14:00:00'),
    endDate: new Date('2025-07-28T18:00:00'),
    createdById: '2',
    participants: [],
    createdAt: new Date('2025-07-18T15:00:00'),
    updatedAt: new Date('2025-07-18T15:00:00'),
    status: EventStatus.Published,
    price: 15,
    equipment: ['Raquette de tennis', 'Balles de tennis']
  },
  {
    id: '3',
    title: 'Session Running Matinale',
    description: 'Jogging collectif de 10km dans le parc. Tous niveaux bienvenus!',
    sport: Sport.Running,
    location: {
      name: 'Parc de la Tête d\'Or',
      address: 'Place du Général Leclerc',
      city: 'Lyon',
      postalCode: '69006',
      latitude: 45.7772,
      longitude: 4.8558,
      type: LocationType.Outdoor
    },
    maxParticipants: 30,
    minParticipants: 5,
    level: SkillLevel.Mixed,
    startDate: new Date('2025-07-26T08:00:00'),
    endDate: new Date('2025-07-26T09:30:00'),
    createdById: '3',
    participants: [],
    createdAt: new Date('2025-07-17T20:00:00'),
    updatedAt: new Date('2025-07-17T20:00:00'),
    status: EventStatus.Published,
    price: 0,
    equipment: ['Chaussures de running', 'Bouteille d\'eau']
  },
  {
    id: '4',
    title: 'Basket 3x3 - Tournoi Urbain',
    description: 'Tournoi de basket 3 contre 3. Ambiance street et fair-play!',
    sport: Sport.Basketball,
    location: {
      name: 'Playground République',
      address: '89 rue de la République',
      city: 'Marseille',
      postalCode: '13001',
      latitude: 43.2965,
      longitude: 5.3698,
      type: LocationType.Outdoor
    },
    maxParticipants: 24,
    minParticipants: 12,
    level: SkillLevel.Advanced,
    startDate: new Date('2025-07-30T16:00:00'),
    endDate: new Date('2025-07-30T20:00:00'),
    createdById: '1',
    participants: [],
    createdAt: new Date('2025-07-19T12:00:00'),
    updatedAt: new Date('2025-07-19T12:00:00'),
    status: EventStatus.Published,
    price: 10,
    equipment: ['Baskets', 'Short', 'Maillot']
  }
];

export interface EventFilters {
  sport?: Sport;
  city?: string;
  level?: SkillLevel;
  startDate?: Date;
  endDate?: Date;
  status?: EventStatus;
  maxPrice?: number;
}

export interface CreateEventForm {
  title: string;
  description?: string;
  sport: Sport;
  location: EventLocation;
  maxParticipants: number;
  minParticipants: number;
  level: SkillLevel;
  startDate: Date;
  endDate: Date;
  price?: number;
  equipment?: string[];
  teamId?: string;
}

export const eventService = {
  // Get all events with optional filters
  async getEvents(filters?: EventFilters): Promise<Event[]> {
    let events = [...mockEvents];

    if (filters) {
      if (filters.sport) {
        events = events.filter(e => e.sport === filters.sport);
      }
      if (filters.city) {
        events = events.filter(e => e.location.city.toLowerCase() === filters.city?.toLowerCase());
      }
      if (filters.level) {
        events = events.filter(e => e.level === filters.level);
      }
      if (filters.status) {
        events = events.filter(e => e.status === filters.status);
      }
      if (filters.maxPrice !== undefined) {
        events = events.filter(e => (e.price || 0) <= filters.maxPrice!);
      }
      if (filters.startDate) {
        events = events.filter(e => new Date(e.startDate) >= filters.startDate!);
      }
      if (filters.endDate) {
        events = events.filter(e => new Date(e.endDate) <= filters.endDate!);
      }
    }

    return events;
  },

  // Get upcoming events (next 30 days)
  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return this.getEvents({
      startDate: now,
      endDate: thirtyDaysFromNow,
      status: EventStatus.Published
    });
  },

  // Get events by location (city)
  async getEventsByLocation(city: string): Promise<Event[]> {
    return this.getEvents({ city });
  },

  // Get event by ID
  async getEventById(id: string): Promise<Event | null> {
    return mockEvents.find(event => event.id === id) || null;
  },

  // Create a new event
  async createEvent(data: CreateEventForm, userId: string): Promise<Event> {
    const newEvent: Event = {
      id: String(mockEvents.length + 1),
      ...data,
      createdById: userId,
      participants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: EventStatus.Published
    };

    mockEvents.push(newEvent);
    return newEvent;
  },

  // Update an event
  async updateEvent(id: string, data: Partial<CreateEventForm>): Promise<Event | null> {
    const index = mockEvents.findIndex(e => e.id === id);
    if (index === -1) return null;

    mockEvents[index] = {
      ...mockEvents[index],
      ...data,
      updatedAt: new Date()
    };

    return mockEvents[index];
  },

  // Delete an event
  async deleteEvent(id: string): Promise<boolean> {
    const index = mockEvents.findIndex(e => e.id === id);
    if (index === -1) return false;

    mockEvents.splice(index, 1);
    return true;
  },

  // Join an event
  async joinEvent(eventId: string, userId: string): Promise<Event | null> {
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) return null;

    // Check if user already joined
    const alreadyJoined = event.participants.some(p => p.userId === userId);
    if (alreadyJoined) return event;

    // Check if event is full
    if (event.participants.length >= event.maxParticipants) {
      throw new Error('Event is full');
    }

    // Add participant
    event.participants.push({
      id: `${eventId}-${userId}`,
      eventId,
      userId,
      status: 'attending' as const,
      user: {} as any // In real app, would fetch user data
    });

    // Update status if full
    if (event.participants.length === event.maxParticipants) {
      event.status = EventStatus.Full;
    }

    event.updatedAt = new Date();
    return event;
  },

  // Leave an event
  async leaveEvent(eventId: string, userId: string): Promise<Event | null> {
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) return null;

    event.participants = event.participants.filter(p => p.userId !== userId);
    
    // Update status if was full
    if (event.status === EventStatus.Full && event.participants.length < event.maxParticipants) {
      event.status = EventStatus.Published;
    }

    event.updatedAt = new Date();
    return event;
  }
};
