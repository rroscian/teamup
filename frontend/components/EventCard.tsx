'use client';

import React from 'react';
import { Event, Sport, SkillLevel, EventStatus } from '@/shared/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/frontend/components/Card';
import { Button } from '@/frontend/components/Button';

interface EventCardProps {
  event: Event;
  onJoin?: (eventId: string) => void;
  onLeave?: (eventId: string) => void;
  isJoined?: boolean;
}

const sportIcons: Record<Sport, string> = {
  [Sport.Football]: '⚽',
  [Sport.Basketball]: '🏀',
  [Sport.Tennis]: '🎾',
  [Sport.Volleyball]: '🏐',
  [Sport.Running]: '🏃',
  [Sport.Cycling]: '🚴',
  [Sport.Swimming]: '🏊',
  [Sport.Badminton]: '🏸',
  [Sport.TableTennis]: '🏓',
  [Sport.Other]: '🏃'
};

const levelColors: Record<SkillLevel, string> = {
  [SkillLevel.Beginner]: 'bg-green-100 text-green-800',
  [SkillLevel.Intermediate]: 'bg-blue-100 text-blue-800',
  [SkillLevel.Advanced]: 'bg-purple-100 text-purple-800',
  [SkillLevel.Mixed]: 'bg-gray-100 text-gray-800'
};

const statusColors: Record<EventStatus, string> = {
  [EventStatus.Draft]: 'bg-gray-100 text-gray-800',
  [EventStatus.Published]: 'bg-green-100 text-green-800',
  [EventStatus.Full]: 'bg-red-100 text-red-800',
  [EventStatus.Cancelled]: 'bg-gray-500 text-white',
  [EventStatus.Completed]: 'bg-gray-300 text-gray-700'
};

export function EventCard({ event, onJoin, onLeave, isJoined }: EventCardProps) {
  const isEventFull = event.participants.length >= event.maxParticipants;
  const canJoin = !isJoined && !isEventFull && event.status === EventStatus.Published;
  const eventDate = new Date(event.startDate);
  const eventEndDate = new Date(event.endDate);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = () => {
    const durationMs = eventEndDate.getTime() - eventDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? minutes : ''}`;
    }
    return `${minutes}min`;
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{sportIcons[event.sport]}</span>
          <div>
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <p className="text-sm text-gray-600">
              {event.location.name}, {event.location.city}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
          {event.status === EventStatus.Published ? 'Ouvert' :
           event.status === EventStatus.Full ? 'Complet' :
           event.status === EventStatus.Cancelled ? 'Annulé' :
           event.status === EventStatus.Completed ? 'Terminé' : 
           'Brouillon'}
        </span>
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-sm text-gray-700 mb-4">{event.description}</p>
      )}

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">📅 Date</span>
          <span className="font-medium">{formatDate(eventDate)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">⏱️ Durée</span>
          <span className="font-medium">{formatDuration()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">📍 Lieu</span>
          <span className="font-medium">{event.location.type === 'indoor' ? 'Intérieur' : 'Extérieur'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">👥 Participants</span>
          <span className="font-medium">
            {event.participants.length}/{event.maxParticipants}
            {event.minParticipants && ` (min: ${event.minParticipants})`}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">🎯 Niveau</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[event.level]}`}>
            {event.level === SkillLevel.Beginner ? 'Débutant' :
             event.level === SkillLevel.Intermediate ? 'Intermédiaire' :
             event.level === SkillLevel.Advanced ? 'Avancé' : 'Tous niveaux'}
          </span>
        </div>
        {event.price !== undefined && event.price > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">💰 Prix</span>
            <span className="font-medium">{event.price}€</span>
          </div>
        )}
      </div>

      {/* Equipment */}
      {event.equipment && event.equipment.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">🎒 Équipement nécessaire:</p>
          <div className="flex flex-wrap gap-1">
            {event.equipment.map((item, index) => (
              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-4">
        {isJoined ? (
          <Button
            onClick={() => onLeave?.(event.id)}
            variant="outline"
            className="w-full"
          >
            Se désinscrire
          </Button>
        ) : canJoin ? (
          <Button
            onClick={() => onJoin?.(event.id)}
            className="w-full"
          >
            Participer
          </Button>
        ) : isEventFull ? (
          <Button disabled className="w-full">
            Complet
          </Button>
        ) : (
          <Button disabled className="w-full">
            Non disponible
          </Button>
        )}
      </div>
    </Card>
  );
}
