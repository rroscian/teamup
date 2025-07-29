'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types pour les événements
export interface BaseEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  type: string;
  category: string;
  imageUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SportsEvent extends BaseEvent {
  sport: string;
  maxParticipants: number;
  currentParticipants: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  equipment?: string[];
}

export interface SocialEvent extends BaseEvent {
  ageRange?: string;
  cost?: number;
  registrationRequired: boolean;
}

export interface CorporateEvent extends BaseEvent {
  company: string;
  department?: string;
  isPublic: boolean;
  contactEmail: string;
}

export type Event = SportsEvent | SocialEvent | CorporateEvent;

// Types pour les filtres
export interface EventFilters {
  search: string;
  category: string;
  type: string;
  dateRange: {
    start?: Date;
    end?: Date;
  };
  location: string;
  tags: string[];
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
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  
  // Utilitaires
  filteredEvents: Event[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  refreshEvents: () => void;
}

// Valeurs par défaut
const defaultFilters: EventFilters = {
  search: '',
  category: '',
  type: '',
  dateRange: {},
  location: '',
  tags: []
};

const defaultViewOptions: ViewOptions = {
  layout: 'grid',
  sortBy: 'date',
  sortOrder: 'asc',
  itemsPerPage: 12
};

// Création du contexte
const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Provider du contexte
export function EventsProvider({ children }: { children: ReactNode }) {
  // États
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<EventFilters>(defaultFilters);
  const [viewOptions, setViewOptionsState] = useState<ViewOptions>(defaultViewOptions);
  const [currentPage, setCurrentPage] = useState(1);

  // Gestion des filtres
  const setFilters = (newFilters: Partial<EventFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset à la première page lors du changement de filtre
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
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par catégorie
    if (filters.category) {
      filtered = filtered.filter(event => event.category === filters.category);
    }

    // Filtre par type
    if (filters.type) {
      filtered = filtered.filter(event => event.type === filters.type);
    }

    // Filtre par localisation
    if (filters.location) {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filtre par tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(event =>
        filters.tags.some(tag => event.tags.includes(tag))
      );
    }

    // Filtre par date
    if (filters.dateRange.start) {
      filtered = filtered.filter(event => event.date >= filters.dateRange.start!);
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(event => event.date <= filters.dateRange.end!);
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (viewOptions.sortBy) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
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

  // Calcul de pagination
  const totalPages = Math.ceil(filteredEvents.length / viewOptions.itemsPerPage);

  // Actions CRUD
  const addEvent = (newEvent: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    const event: Event = {
      ...newEvent,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as Event;
    
    setEvents(prev => [...prev, event]);
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
    // TODO: Implémenter le rechargement depuis l'API
    setLoading(true);
    // Simulation d'un appel API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Valeur du contexte
  const contextValue: EventsContextType = {
    // Données
    events,
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
    totalPages,
    currentPage,
    setCurrentPage,
    refreshEvents
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
