'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Users, Calendar, Clock } from 'lucide-react';
import { EventWithDistance } from '@/frontend/contexts/EventsContext';

interface EventCardWithDistanceProps {
  event: EventWithDistance;
}

export function EventCardWithDistance({ event }: EventCardWithDistanceProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date, time: string) => {
    return time || new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSportEmoji = (sport: string) => {
    const sportEmojis: Record<string, string> = {
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
      jogging: '👟',
      dance: '💃',
      rugby: '🏉',
      handball: '🤾',
      autre: '🏃'
    };
    
    return sportEmojis[sport.toLowerCase()] || '🏃';
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      case 'mixed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Débutant';
      case 'intermediate':
        return 'Intermédiaire';
      case 'advanced':
        return 'Avancé';
      case 'mixed':
        return 'Tous niveaux';
      default:
        return level;
    }
  };

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer h-full">
        {/* Header avec distance */}
        {event.distanceFormatted && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center text-blue-700">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{event.distanceFormatted}</span>
            </div>
            <span className="text-xs text-blue-600">à proximité</span>
          </div>
        )}
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <span className="text-2xl mr-2">{getSportEmoji(event.sport)}</span>
              <h3 className="font-semibold text-gray-900 truncate max-w-[200px]">
                {event.title}
              </h3>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${getSkillLevelColor(event.skillLevel || event.level || 'mixed')}`}>
              {getSkillLevelText(event.skillLevel || event.level || 'mixed')}
            </span>
          </div>
          
          {event.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {event.description}
            </p>
          )}
          
          <div className="space-y-2">
            {/* Date et heure */}
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(event.date || event.startDate)}</span>
              <Clock className="w-4 h-4 mx-2" />
              <span>{formatTime(event.date || event.startDate, event.startTime)}</span>
            </div>
            
            {/* Lieu */}
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="truncate">
                {event.location.name || event.location.address}, {event.location.city}
              </span>
            </div>
            
            {/* Participants */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-500">
                <Users className="w-4 h-4 mr-2" />
                <span>
                  {event.currentParticipants || 0}/{event.maxParticipants} participants
                </span>
              </div>
              
              {/* Prix */}
              {event.price && event.price > 0 && (
                <span className="font-medium text-green-600">
                  {event.price}€
                </span>
              )}
            </div>
          </div>
          
          {/* Barre de progression des participants */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  (event.currentParticipants || 0) >= event.maxParticipants 
                    ? 'bg-red-500' 
                    : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min(((event.currentParticipants || 0) / event.maxParticipants) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
