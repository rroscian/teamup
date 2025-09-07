import { Event, EventStatus, Sport, SkillLevel, LocationType, EventLocation } from '@/shared/types';

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
    try {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters?.sport) params.append('sport', filters.sport);
      if (filters?.city) params.append('city', filters.city);
      if (filters?.level) params.append('level', filters.level);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());

      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const events: Event[] = await response.json();
      
      // Transform dates from strings back to Date objects
      return events.map(event => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        date: new Date(event.date),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt)
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  },

  // Get upcoming events (next 30 days)
  async getUpcomingEvents(): Promise<Event[]> {
    try {
      const response = await fetch('/api/events?upcoming=true');
      if (!response.ok) {
        throw new Error(`Failed to fetch upcoming events: ${response.statusText}`);
      }

      const events: Event[] = await response.json();
      
      // Transform dates from strings back to Date objects
      return events.map(event => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        date: new Date(event.date),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt)
      }));
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw new Error('Failed to fetch upcoming events');
    }
  },

  // Get events by location (city)
  async getEventsByLocation(city: string): Promise<Event[]> {
    return this.getEvents({ city });
  },

  // Get event by ID
  async getEventById(id: string): Promise<Event | null> {
    try {
      const response = await fetch(`/api/events/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch event: ${response.statusText}`);
      }

      const event: Event = await response.json();
      
      // Transform dates from strings back to Date objects
      return {
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        date: new Date(event.date),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt)
      };
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      return null;
    }
  },

  // Create a new event
  async createEvent(data: CreateEventForm): Promise<Event> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          ...data,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.statusText}`);
      }

      const event: Event = await response.json();
      
      // Transform dates from strings back to Date objects
      return {
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        date: new Date(event.date),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt)
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  },

  // Update an event
  async updateEvent(id: string, data: Partial<CreateEventForm>): Promise<Event | null> {
    try {
      const updateData = { ...data };
      if (data.startDate) {
        updateData.startDate = data.startDate.toISOString() as any;
      }
      if (data.endDate) {
        updateData.endDate = data.endDate.toISOString() as any;
      }

      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to update event: ${response.statusText}`);
      }

      const event: Event = await response.json();
      
      // Transform dates from strings back to Date objects
      return {
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        date: new Date(event.date),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt)
      };
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  },

  // Delete an event
  async deleteEvent(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  },

  // Join an event
  async joinEvent(eventId: string): Promise<Event | null> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to join event: ${response.statusText}`);
      }

      const event: Event = await response.json();
      
      // Transform dates from strings back to Date objects
      return {
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        date: new Date(event.date),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt)
      };
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  },

  // Leave an event
  async leaveEvent(eventId: string): Promise<Event | null> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/events/${eventId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        return null;
      }

      const event: Event = await response.json();
      
      // Transform dates from strings back to Date objects
      return {
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        date: new Date(event.date),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt)
      };
    } catch (error) {
      console.error('Error leaving event:', error);
      return null;
    }
  }
};
