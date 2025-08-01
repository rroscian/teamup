'use client';

import React from 'react';
import { Event, SportsEvent, SocialEvent, CorporateEvent } from '@/frontend/contexts/EventsContext';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserGroupIcon,
  TagIcon,
  ClockIcon,
  BuildingOfficeIcon,
  TrophyIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';

interface EventCardProps {
  event: Event;
  variant?: 'grid' | 'list';
  onClick?: (event: Event) => void;
}

export function EventCard({ event, variant = 'grid', onClick }: EventCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getEventTypeIcon = () => {
    switch (event.category) {
      case 'sports':
        return <TrophyIcon className="h-5 w-5" />;
      case 'social':
        return <UserGroupIcon className="h-5 w-5" />;
      case 'corporate':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      default:
        return <CalendarIcon className="h-5 w-5" />;
    }
  };

  const getEventTypeColor = () => {
    switch (event.category) {
      case 'sports':
        return 'bg-green-100 text-green-800';
      case 'social':
        return 'bg-blue-100 text-blue-800';
      case 'corporate':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderEventSpecificInfo = () => {
    switch (event.category) {
      case 'sports':
        const sportsEvent = event as SportsEvent;
        return (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <TrophyIcon className="h-4 w-4" />
              <span>{sportsEvent.sport}</span>
            </div>
            <div className="flex items-center gap-1">
              <UserGroupIcon className="h-4 w-4" />
              <span>{sportsEvent.currentParticipants}/{sportsEvent.maxParticipants}</span>
            </div>
            <div className="px-2 py-1 bg-gray-100 rounded-full text-xs capitalize">
              {sportsEvent.skillLevel}
            </div>
          </div>
        );

      case 'social':
        const socialEvent = event as SocialEvent;
        return (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {socialEvent.cost && (
              <div className="flex items-center gap-1">
                <CurrencyEuroIcon className="h-4 w-4" />
                <span>{socialEvent.cost}€</span>
              </div>
            )}
            {socialEvent.ageRange && (
              <div className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                {socialEvent.ageRange}
              </div>
            )}
            {socialEvent.registrationRequired && (
              <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                Inscription requise
              </div>
            )}
          </div>
        );

      case 'corporate':
        const corporateEvent = event as CorporateEvent;
        return (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <BuildingOfficeIcon className="h-4 w-4" />
              <span>{corporateEvent.company}</span>
            </div>
            {corporateEvent.department && (
              <span className="text-gray-500">• {corporateEvent.department}</span>
            )}
            <div className={`px-2 py-1 rounded-full text-xs ${
              corporateEvent.isPublic 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {corporateEvent.isPublic ? 'Public' : 'Privé'}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (variant === 'list') {
    return (
      <div 
        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer group"
        onClick={handleClick}
      >
        <div className="flex items-start gap-6">
          {/* Image ou placeholder */}
          <div className="flex-shrink-0">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                {getEventTypeIcon()}
              </div>
            )}
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {event.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor()}`}>
                {event.category}
              </span>
            </div>

            <p className="text-gray-600 mb-3 line-clamp-2">
              {event.description}
            </p>

            {/* Informations spécifiques au type d'événement */}
            <div className="mb-3">
              {renderEventSpecificInfo()}
            </div>

            {/* Métadonnées */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              {event.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <TagIcon className="h-4 w-4" />
                  <div className="flex gap-1">
                    {event.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {event.tags.length > 3 && (
                      <span className="text-xs">+{event.tags.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue grille (par défaut)
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
      onClick={handleClick}
    >
      {/* Image ou placeholder */}
      <div className="aspect-video bg-gray-200 relative">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-4xl">
              {getEventTypeIcon()}
            </div>
          </div>
        )}
        
        {/* Badge catégorie */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor()}`}>
            {event.category}
          </span>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
          {event.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {event.description}
        </p>

        {/* Informations spécifiques au type d'événement */}
        <div className="mb-3">
          {renderEventSpecificInfo()}
        </div>

        {/* Métadonnées */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4" />
            <span className="truncate">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPinIcon className="h-4 w-4" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {event.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {event.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{event.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
