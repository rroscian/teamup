'use client';

import React, { useState, useEffect } from 'react';
import { Event, Sport, SkillLevel, EventStatus } from '@/shared/types';
import { useEvents } from '@/frontend/hooks/useEvents';
import { EventCard } from '@/frontend/components/EventCard';
import { Button } from '@/frontend/components/Button';
import { Input } from '@/frontend/components/Input';

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
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (showUpcoming) {
      fetchUpcomingEvents();
    } else if (city) {
      fetchEventsByCity(city);
    } else {
      fetchEvents();
    }
  }, []);

  const handleFilter = () => {
    const filters: any = {};
    if (filterCity) filters.city = filterCity;
    if (filterSport) filters.sport = filterSport;
    if (filterLevel) filters.level = filterLevel;
    if (filterStatus) filters.status = filterStatus;

    fetchEvents(filters);
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
      <div className="flex justify-center items-center h-64">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                   s === Sport.TableTennis ? 'Tennis de table' : 'Autre'}
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
              fetchEvents();
            }}
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            Aucun événement trouvé
          </div>
        ) : (
          events.map(event => (
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
