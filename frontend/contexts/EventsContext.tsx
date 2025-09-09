'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Event, Sport, SkillLevel } from '@/shared/types';

// Export Event type for components
export type { Event };

// Specialized event types for different categories
export interface SportsEvent extends Event {
  category: 'sports';
  sport: Sport;
  skillLevel: SkillLevel;
  currentParticipants: number;
  type: string;
}

export interface SocialEvent extends Event {
  category: 'social';
  cost?: number;
  ageRange?: string;
  registrationRequired?: boolean;
}

export interface CorporateEvent extends Event {
  category: 'corporate';
  company: string;
  department?: string;
  isPublic: boolean;
}

// Union type for all event categories
export type EventWithCategory = SportsEvent | SocialEvent | CorporateEvent;
import { eventService } from '@/backend/services/eventService';
import { useAuth } from '@/frontend/hooks/useAuth';

// Types pour les filtres
export interface EventFilters {
  search: string;
  sport?: Sport;
  level?: SkillLevel;
  maxPrice?: number;
  dateRange: {
    start?: Date;
    end?: Date;
  };
  location: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

// Types pour les options d'affichage
export interface ViewOptions {
  layout: 'grid' | 'list' | 'calendar';
  sortBy: 'date' | 'title' | 'popularity' | 'created';
  sortOrder: 'asc' | 'desc';
  itemsPerPage: number;
}

// Interface du contexte
interface EventsContextType {
  // Données
  events: Event[];
  nearbyEvents: EventWithDistance[];
  loading: boolean;
  error: string | null;
  
  // Filtres et recherche
  filters: EventFilters;
  setFilters: (filters: Partial<EventFilters>) => void;
  clearFilters: () => void;
  
  // Options d'affichage
  viewOptions: ViewOptions;
  setViewOptions: (options: Partial<ViewOptions>) => void;
  
  // Actions CRUD
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  
  // Utilitaires
  filteredEvents: Event[];
  suggestedEvents: Event[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  refreshEvents: () => void;
  loadNearbyEvents: (lat?: number, lng?: number, radius?: number) => Promise<void>;
  userPosition: { lat: number; lng: number } | null;
}

// Event avec distance
export interface EventWithDistance extends Event {
  distance?: number;
  distanceFormatted?: string;
  coordinates?: { lat: number; lng: number };
}

// Valeurs par défaut
const defaultFilters: EventFilters = {
  search: '',
  sport: undefined,
  level: undefined,
  maxPrice: undefined,
  dateRange: {},
  location: ''
};

const getDefaultItemsPerPage = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768 ? 3 : 25;
  }
  return 25; // Défaut côté serveur
};

const defaultViewOptions: ViewOptions = {
  layout: 'grid',
  sortBy: 'date',
  sortOrder: 'asc',
  itemsPerPage: getDefaultItemsPerPage()
};

// Création du contexte
const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Provider du contexte
export function EventsProvider({ children }: { children: ReactNode }) {
  // États
  const [events, setEvents] = useState<Event[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<EventWithDistance[]>([]);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<EventFilters>(defaultFilters);
  const [viewOptions, setViewOptionsState] = useState<ViewOptions>(defaultViewOptions);
  const [isMobile, setIsMobile] = useState(false);
  
  // Détecter les changements de taille d'écran pour ajuster la pagination
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Ajuster automatiquement itemsPerPage si nécessaire
      const newItemsPerPage = mobile ? 3 : 25;
      if (viewOptions.itemsPerPage !== newItemsPerPage) {
        setViewOptionsState(prev => ({
          ...prev,
          itemsPerPage: newItemsPerPage
        }));
      }
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [viewOptions.itemsPerPage]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { user, isAuthenticated } = useAuth();

  // Charger les événements au démarrage
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventList = await eventService.getEvents();
      setEvents(eventList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const loadEventsWithFilters = async (filters: EventFilters) => {
    try {
      setLoading(true);
      setError(null);
      const eventList = await eventService.getEvents({
        sport: filters.sport,
        level: filters.level,
        maxPrice: filters.maxPrice,
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        latitude: filters.latitude,
        longitude: filters.longitude,
        radius: filters.radius,
        city: filters.location
      });
      setEvents(eventList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  // Gestion des filtres avec support de la géolocalisation
  const setFilters = (newFilters: Partial<EventFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset à la première page lors du changement de filtre
    
    // Si filtres géographiques appliqués, refetch les événements avec ces paramètres
    if (newFilters.latitude && newFilters.longitude) {
      loadEventsWithFilters({ ...filters, ...newFilters });
    }
  };

  const clearFilters = () => {
    setFiltersState(defaultFilters);
    setCurrentPage(1);
  };

  // Gestion des options d'affichage
  const setViewOptions = (newOptions: Partial<ViewOptions>) => {
    setViewOptionsState(prev => ({ ...prev, ...newOptions }));
  };

  // Filtrage des événements
  const filteredEvents = React.useMemo(() => {
    let filtered = [...events];

    // Recherche textuelle
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchLower) ||
        (event.description && event.description.toLowerCase().includes(searchLower)) ||
        event.location.city.toLowerCase().includes(searchLower) ||
        event.sport.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par sport
    if (filters.sport) {
      filtered = filtered.filter(event => event.sport === filters.sport);
    }

    // Filtre par niveau
    if (filters.level) {
      filtered = filtered.filter(event => event.level === filters.level);
    }

    // Filtre par prix maximum
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(event => (event.price || 0) <= filters.maxPrice!);
    }

    // Filtre par localisation
    if (filters.location) {
      filtered = filtered.filter(event =>
        event.location.city.toLowerCase().includes(filters.location.toLowerCase())
      );
    }


    // Filtre par date
    if (filters.dateRange.start) {
      filtered = filtered.filter(event => event.startDate >= filters.dateRange.start!);
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(event => event.startDate <= filters.dateRange.end!);
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (viewOptions.sortBy) {
        case 'date':
          comparison = a.startDate.getTime() - b.startDate.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        default:
          comparison = 0;
      }

      return viewOptions.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [events, filters, viewOptions.sortBy, viewOptions.sortOrder]);

  // Événements suggérés basés sur le profil utilisateur
  const suggestedEvents = React.useMemo(() => {
    if (!isAuthenticated || !user?.profile) {
      return [];
    }

    const userFavoriteSports = user.profile.favoriteSports || [];
    const userSkillLevels = user.profile.skillLevels || [];
    const userCity = user.profile.location?.city;

    // Filtrer les événements selon les préférences utilisateur
    let suggestions = events.filter(event => {
      // Événements dans les sports favoris
      const isFavoriteSport = userFavoriteSports.includes(event.sport);
      
      // Événements dans la même ville ou niveau compatible
      const isSameCity = userCity ? event.location.city === userCity : true;
      const userSkillForSport = userSkillLevels.find(sl => sl.sport === event.sport);
      const isCompatibleLevel = !userSkillForSport || 
        event.level === 'mixed' || 
        userSkillForSport.level === event.level;

      return isFavoriteSport && isSameCity && isCompatibleLevel;
    });

    // Si pas assez de suggestions avec les sports favoris, ajouter des événements similaires
    if (suggestions.length < 5) {
      const additionalEvents = events.filter(event => {
        const notAlreadyIncluded = !suggestions.find(s => s.id === event.id);
        const isSameCity = userCity ? event.location.city === userCity : true;
        return notAlreadyIncluded && isSameCity;
      });
      
      suggestions = [...suggestions, ...additionalEvents].slice(0, 5);
    }

    // Trier par date de début
    return suggestions
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 4);
  }, [events, user, isAuthenticated]);

  // Calcul de pagination
  const totalPages = Math.ceil(filteredEvents.length / viewOptions.itemsPerPage);

  // Actions CRUD
  const addEvent = async (newEvent: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Créer l'événement via l'API avec toutes les données
      const createdEvent = await eventService.createEvent({
        title: newEvent.title,
        description: newEvent.description,
        sport: newEvent.sport,
        location: newEvent.location,
        maxParticipants: newEvent.maxParticipants || 10,
        minParticipants: newEvent.minParticipants || 2,
        level: newEvent.level,
        startDate: newEvent.startDate,
        endDate: newEvent.endDate,
        price: newEvent.price,
        equipment: newEvent.equipment || [],
        // Nouvelles données ajoutées
        category: newEvent.category,
        type: newEvent.type,
        skillLevel: newEvent.skillLevel,
        currentParticipants: newEvent.currentParticipants,
        createdById: newEvent.createdById,
        participants: newEvent.participants,
        status: newEvent.status
      });

      // Ajouter l'événement créé à la liste locale
      setEvents(prev => [...prev, createdEvent]);
      
      return createdEvent;
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      throw error;
    }
  };

  const updateEvent = (id: string, updatedEvent: Partial<Event>) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === id 
          ? { ...event, ...updatedEvent, updatedAt: new Date() }
          : event
      )
    );
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const refreshEvents = () => {
    loadEvents();
  };

  // Charger les événements proches
  const loadNearbyEvents = async (lat?: number, lng?: number, radius: number = 10) => {
    try {
      const token = localStorage.getItem('authToken');
      let url = '/api/events/nearby?';
      
      if (lat && lng) {
        url += `lat=${lat}&lng=${lng}&radius=${radius}`;
        setUserPosition({ lat, lng });
      } else {
        // Utiliser la position de l'utilisateur stockée
        url += `radius=${radius}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load nearby events');
      }
      
      const nearbyData = await response.json();
      
      // Transformer les dates
      const transformedEvents = nearbyData.map((event: any) => ({
        ...event,
        startDate: new Date(event.date || event.startDate),
        endDate: new Date(event.endDate || event.date),
        date: new Date(event.date),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt)
      }));
      
      setNearbyEvents(transformedEvents);
    } catch (error) {
      console.error('Error loading nearby events:', error);
    }
  };

  // Valeur du contexte
  const contextValue: EventsContextType = {
    // Données
    events,
    nearbyEvents,
    loading,
    error,
    
    // Filtres et recherche
    filters,
    setFilters,
    clearFilters,
    
    // Options d'affichage
    viewOptions,
    setViewOptions,
    
    // Actions CRUD
    addEvent,
    updateEvent,
    deleteEvent,
    
    // Utilitaires
    filteredEvents,
    suggestedEvents,
    totalPages,
    currentPage,
    setCurrentPage,
    refreshEvents,
    loadNearbyEvents,
    userPosition
  };

  return (
    <EventsContext.Provider value={contextValue}>
      {children}
    </EventsContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
