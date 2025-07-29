import { useState, useCallback } from 'react';
import { Event, EventFilters, Sport, SkillLevel, EventStatus } from '@/shared/types';
import { useApi } from './useApi';

export function useEvents() {
  const { apiCall } = useApi();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse dates in event objects
  const parseEventDates = (event: any): Event => ({
    ...event,
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate),
    createdAt: new Date(event.createdAt),
    updatedAt: new Date(event.updatedAt)
  });

  // Fetch all events with optional filters
  const fetchEvents = useCallback(async (filters?: EventFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.sport) queryParams.append('sport', filters.sport);
      if (filters?.city) queryParams.append('city', filters.city);
      if (filters?.level) queryParams.append('level', filters.level);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters?.startDate) queryParams.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) queryParams.append('endDate', filters.endDate.toISOString());
      
      const url = `/api/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const data = await apiCall(url);
      
      if (data) {
        const parsedEvents = data.map(parseEventDates);
        setEvents(parsedEvents);
      }
    } catch (err) {
      setError('Failed to fetch events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Fetch upcoming events
  const fetchUpcomingEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiCall('/api/events?upcoming=true');
      if (data) {
        const parsedEvents = data.map(parseEventDates);
        setEvents(parsedEvents);
      }
    } catch (err) {
      setError('Failed to fetch upcoming events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Fetch events by city
  const fetchEventsByCity = useCallback(async (city: string) => {
    await fetchEvents({ city });
  }, [fetchEvents]);

  // Fetch a single event by ID
  const fetchEventById = useCallback(async (id: string): Promise<Event | null> => {
    try {
      const data = await apiCall(`/api/events/${id}`);
      return data ? parseEventDates(data) : null;
    } catch (err) {
      console.error('Failed to fetch event:', err);
      return null;
    }
  }, [apiCall]);

  // Create a new event
  const createEvent = useCallback(async (eventData: {
    title: string;
    description?: string;
    sport: Sport;
    location: {
      name: string;
      address: string;
      city: string;
      postalCode: string;
      latitude?: number;
      longitude?: number;
      type: string;
    };
    maxParticipants: number;
    minParticipants: number;
    level: SkillLevel;
    startDate: Date;
    endDate: Date;
    price?: number;
    equipment?: string[];
    teamId?: string;
  }): Promise<Event | null> => {
    try {
      const data = await apiCall('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      return data ? parseEventDates(data) : null;
    } catch (err) {
      console.error('Failed to create event:', err);
      return null;
    }
  }, [apiCall]);

  // Join an event
  const joinEvent = useCallback(async (eventId: string): Promise<Event | null> => {
    try {
      const data = await apiCall(`/api/events/${eventId}/join`, {
        method: 'POST',
      });
      
      if (data) {
        const updatedEvent = parseEventDates(data);
        // Update local state
        setEvents(prevEvents => 
          prevEvents.map(e => e.id === eventId ? updatedEvent : e)
        );
        return updatedEvent;
      }
      return null;
    } catch (err) {
      console.error('Failed to join event:', err);
      setError('Failed to join event');
      return null;
    }
  }, [apiCall]);

  // Leave an event
  const leaveEvent = useCallback(async (eventId: string): Promise<Event | null> => {
    try {
      const data = await apiCall(`/api/events/${eventId}/leave`, {
        method: 'POST',
      });
      
      if (data) {
        const updatedEvent = parseEventDates(data);
        // Update local state
        setEvents(prevEvents => 
          prevEvents.map(e => e.id === eventId ? updatedEvent : e)
        );
        return updatedEvent;
      }
      return null;
    } catch (err) {
      console.error('Failed to leave event:', err);
      setError('Failed to leave event');
      return null;
    }
  }, [apiCall]);

  // Update an event
  const updateEvent = useCallback(async (eventId: string, updates: Partial<Event>): Promise<Event | null> => {
    try {
      const data = await apiCall(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (data) {
        const updatedEvent = parseEventDates(data);
        // Update local state
        setEvents(prevEvents => 
          prevEvents.map(e => e.id === eventId ? updatedEvent : e)
        );
        return updatedEvent;
      }
      return null;
    } catch (err) {
      console.error('Failed to update event:', err);
      return null;
    }
  }, [apiCall]);

  // Delete an event
  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      await apiCall(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      
      // Remove from local state
      setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
      return true;
    } catch (err) {
      console.error('Failed to delete event:', err);
      return false;
    }
  }, [apiCall]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    fetchUpcomingEvents,
    fetchEventsByCity,
    fetchEventById,
    createEvent,
    joinEvent,
    leaveEvent,
    updateEvent,
    deleteEvent,
  };
}
