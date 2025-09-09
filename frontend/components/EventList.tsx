'use client';

import React, { useState, useEffect } from 'react';
import { Event, Sport, SkillLevel, EventStatus } from '@/shared/types';
import { useEvents } from '@/frontend/hooks/useEvents';
import { EventCard } from '@/frontend/components/EventCard';
import { Button } from '@/frontend/components/Button';
import { Input } from '@/frontend/components/Input';
import { useGeolocation, calculateDistance } from '@/frontend/hooks/useGeolocation';
import { useToast } from '@/frontend/contexts/ToastContext';

interface EventListProps {
  city?: string;
  sport?: Sport;
  showUpcoming?: boolean;
}

export function EventList({ city, sport, showUpcoming = false }: EventListProps) {
  const { 
    events, 
    loading, 
    error, 
    fetchEvents, 
    fetchUpcomingEvents,
    fetchEventsByCity,
    joinEvent,
    leaveEvent 
  } = useEvents();

  const [filterCity, setFilterCity] = useState(city || '');
  const [filterSport, setFilterSport] = useState<Sport | ''>('');
  const [filterLevel, setFilterLevel] = useState<SkillLevel | ''>('');
  const [filterStatus, setFilterStatus] = useState<EventStatus | ''>('');
  const [filterNearby, setFilterNearby] = useState(false);
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set());
  
  // Géolocalisation
  const { position, error: geoError, loading: geoLoading, requestPermission } = useGeolocation(false);
  const { showWarning } = useToast();

  useEffect(() => {
    if (showUpcoming) {
      fetchUpcomingEvents();
    } else if (city) {
      fetchEventsByCity(city);
    } else {
      fetchEvents();
    }
  }, []);

  const handleFilter = async () => {
    const filters: any = {};
    if (filterCity) filters.city = filterCity;
    if (filterSport) filters.sport = filterSport;
    if (filterLevel) filters.level = filterLevel;
    if (filterStatus) filters.status = filterStatus;

    // Si le filtre "Autour de moi" est activé
    if (filterNearby) {
      if (!position) {
        // Demander la permission de géolocalisation
        const permissionGranted = await requestPermission();
        if (!permissionGranted || geoError) {
          showWarning('Cette fonctionnalité n\'est disponible qu\'avec la géolocalisation activée.');
          setFilterNearby(false);
          return;
        }
        // Si on n'a toujours pas la position, on ne peut pas filtrer
        if (!position) {
          showWarning('Impossible d\'obtenir votre position. Veuillez réessayer.');
          setFilterNearby(false);
          return;
        }
      }
      
      // Ajouter les coordonnées utilisateur pour le filtrage côté serveur
      filters.latitude = position.lat;
      filters.longitude = position.lng;
      filters.radius = 10; // 10 km
    }

    fetchEvents(filters);
  };

  // Filtrage côté client si nécessaire (backup)
  const filterEventsByDistance = (eventsToFilter: Event[]) => {
    if (!filterNearby || !position) {
      return eventsToFilter;
    }

    return eventsToFilter.filter(event => {
      if (!event.location.latitude || !event.location.longitude) {
        return false; // Exclure les événements sans géolocalisation
      }
      
      const distance = calculateDistance(
        position.lat,
        position.lng,
        event.location.latitude,
        event.location.longitude
      );
      
      return distance <= 10; // 10 km
    });
  };

  const handleJoin = async (eventId: string) => {
    try {
      await joinEvent(eventId);
      setJoinedEvents(prev => new Set(prev).add(eventId));
      // Refresh events to get updated participant count
      handleFilter();
    } catch (err) {
      console.error('Failed to join event:', err);
    }
  };

  const handleLeave = async (eventId: string) => {
    try {
      await leaveEvent(eventId);
      setJoinedEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
      // Refresh events to get updated participant count
      handleFilter();
    } catch (err) {
      console.error('Failed to leave event:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Erreur lors du chargement des événements</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h3 className="font-semibold text-lg">Filtrer les événements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ville</label>
            <Input
              type="text"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              placeholder="Ex: Paris"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sport</label>
            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value as Sport | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Tous les sports</option>
              {Object.values(Sport).map(s => (
                <option key={s} value={s}>
                  {s === Sport.Football ? 'Football' :
                   s === Sport.Basketball ? 'Basketball' :
                   s === Sport.Tennis ? 'Tennis' :
                   s === Sport.Volleyball ? 'Volleyball' :
                   s === Sport.Running ? 'Course à pied' :
                   s === Sport.Cycling ? 'Cyclisme' :
                   s === Sport.Swimming ? 'Natation' :
                   s === Sport.Badminton ? 'Badminton' :
                   s === Sport.TableTennis ? 'Tennis de table' :
                   s === Sport.Gymnastics ? 'Gymnastique' :
                   s === Sport.Hiking ? 'Randonnée' :
                   s === Sport.Jogging ? 'Jogging' :
                   s === Sport.Dance ? 'Danse' :
                   s === Sport.Rugby ? 'Rugby' :
                   s === Sport.Handball ? 'Handball' : 'Autre'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Niveau</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as SkillLevel | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Tous niveaux</option>
              <option value={SkillLevel.Beginner}>Débutant</option>
              <option value={SkillLevel.Intermediate}>Intermédiaire</option>
              <option value={SkillLevel.Advanced}>Avancé</option>
              <option value={SkillLevel.Mixed}>Mixte</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as EventStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Tous les statuts</option>
              <option value={EventStatus.Published}>Ouvert</option>
              <option value={EventStatus.Full}>Complet</option>
              <option value={EventStatus.Cancelled}>Annulé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Proximité</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="filterNearby"
                checked={filterNearby}
                onChange={(e) => setFilterNearby(e.target.checked)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="filterNearby" className="text-sm font-medium">
                Autour de moi (10 km)
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleFilter}>Appliquer les filtres</Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setFilterCity('');
              setFilterSport('');
              setFilterLevel('');
              setFilterStatus('');
              setFilterNearby(false);
              fetchEvents();
            }}
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filterEventsByDistance(events).length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            {filterNearby && !position ? (
              <div>
                <p>Géolocalisation requise pour afficher les événements à proximité</p>
                <Button 
                  onClick={async () => {
                    const permissionGranted = await requestPermission();
                    if (permissionGranted && !geoError) {
                      handleFilter();
                    }
                  }}
                  className="mt-2"
                  disabled={geoLoading}
                >
                  {geoLoading ? 'Localisation...' : 'Activer la géolocalisation'}
                </Button>
              </div>
            ) : (
              'Aucun événement trouvé'
            )}
          </div>
        ) : (
          filterEventsByDistance(events).map(event => (
            <EventCard
              key={event.id}
              event={event}
              onJoin={handleJoin}
              onLeave={handleLeave}
              isJoined={joinedEvents.has(event.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
