import React from 'react';
import { NearbyEvent } from '@/frontend/hooks/useNearbyEvents';
import { Sport, SkillLevel } from '@/shared/types';

interface NearbyEventCardProps {
  event: NearbyEvent;
  onEventClick?: (event: NearbyEvent) => void;
  onJoinEvent?: (eventId: string) => void;
  currentUserId?: string;
}

const SPORT_ICONS: Record<Sport, string> = {
  football: '⚽',
  basketball: '🏀',
  tennis: '🎾',
  volleyball: '🏐',
  running: '🏃',
  cycling: '🚴',
  swimming: '🏊',
  badminton: '🏸',
  table_tennis: '🏓',
  gymnastics: '🤸',
  hiking: '🥾',
  jogging: '🏃‍♂️',
  dance: '💃',
  rugby: '🏉',
  handball: '🤾',
  autre: '🏃'
};

const SKILL_LEVEL_COLORS: Record<SkillLevel, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-orange-100 text-orange-800',
  mixed: 'bg-purple-100 text-purple-800'
};

const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  mixed: 'Mixte'
};

export const NearbyEventCard: React.FC<NearbyEventCardProps> = ({
  event,
  onEventClick,
  onJoinEvent,
  currentUserId
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`;
    }
    return `${mins}min`;
  };

  const getDistanceColor = (distance: number) => {
    if (distance <= 2) return 'text-green-600 bg-green-50';
    if (distance <= 5) return 'text-yellow-600 bg-yellow-50';
    if (distance <= 10) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getDistanceIcon = (distance: number) => {
    if (distance <= 2) return '🚶';
    if (distance <= 5) return '🚴';
    if (distance <= 10) return '🚗';
    return '🚌';
  };

  const isUserParticipant = currentUserId && event.participants.some(p => p.userId === currentUserId);
  const currentParticipants = event.currentParticipants || 0;
  const isEventFull = currentParticipants >= event.maxParticipants;
  const spotsLeft = event.maxParticipants - currentParticipants;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* En-tête avec sport et distance */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{SPORT_ICONS[event.sport] || '🏃'}</span>
            <div>
              <h3 
                className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => onEventClick?.(event)}
              >
                {event.title}
              </h3>
              <p className="text-sm text-gray-600">
                📍 {event.location.city}
              </p>
            </div>
          </div>
          
          {/* Badge de distance */}
          <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium ${getDistanceColor(event.distance)}`}>
            <span>{getDistanceIcon(event.distance)}</span>
            <span>{event.distance}km</span>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-4">
        {/* Description */}
        {event.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Informations de l'événement */}
        <div className="space-y-3">
          {/* Date et durée */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-gray-600">
              <span>📅</span>
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <span>⏰</span>
              <span>{formatDuration(event.duration)}</span>
            </div>
          </div>

          {/* Niveau et participants */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${SKILL_LEVEL_COLORS[event.level]}`}>
                {SKILL_LEVEL_LABELS[event.level]}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>👥</span>
              <span>
                {event.currentParticipants}/{event.maxParticipants}
                {spotsLeft > 0 && (
                  <span className="text-green-600 ml-1">
                    ({spotsLeft} place{spotsLeft > 1 ? 's' : ''})
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Adresse complète */}
          <div className="flex items-start space-x-1 text-sm text-gray-500">
            <span className="mt-0.5">📍</span>
            <span>
              {event.location.address && `${event.location.address}, `}
              {event.location.city}
              {event.location.postalCode && ` ${event.location.postalCode}`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => onEventClick?.(event)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            Voir détails →
          </button>

          {!isUserParticipant && onJoinEvent && (
            <button
              onClick={() => onJoinEvent(event.id)}
              disabled={isEventFull}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isEventFull
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isEventFull ? 'Complet' : 'Rejoindre'}
            </button>
          )}

          {isUserParticipant && (
            <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
              <span>✅</span>
              <span>Inscrit</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
