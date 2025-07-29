'use client';

import React from 'react';
import { useEvents } from '@/frontend/contexts/EventsContext';
import { EventCard } from './EventCard';

export function EventsListView() {
  const { filteredEvents, viewOptions, currentPage } = useEvents();

  // Calcul de la pagination
  const startIndex = (currentPage - 1) * viewOptions.itemsPerPage;
  const endIndex = startIndex + viewOptions.itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  if (paginatedEvents.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium mb-2">Aucun événement dans cette vue</h3>
        <p>Essayez d'ajuster vos filtres ou créez un nouvel événement.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Liste des événements */}
      <div className="space-y-4">
        {paginatedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            variant="list"
          />
        ))}
      </div>

      {/* Informations sur la pagination */}
      <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
        <span>
          Affichage de {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)} sur {filteredEvents.length}
        </span>
        <span>
          Page {currentPage} sur {Math.ceil(filteredEvents.length / viewOptions.itemsPerPage)}
        </span>
      </div>
    </div>
  );
}
