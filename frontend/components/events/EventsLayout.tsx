'use client';

import React from 'react';
import { useEvents } from '@/frontend/contexts/EventsContext';
import { EventsFilters } from './EventsFilters';
import { EventsGrid } from './EventsGrid';
import { EventsListView } from './EventsListView';
import { EventsCalendarView } from './EventsCalendarView';
import { EventsPagination } from './EventsPagination';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

export function EventsLayout() {
  const { loading, error, viewOptions, filteredEvents } = useEvents();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" message="Chargement des événements..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  const renderEventsView = () => {
    switch (viewOptions.layout) {
      case 'list':
        return <EventsListView />;
      case 'calendar':
        return <EventsCalendarView />;
      case 'grid':
      default:
        return <EventsGrid />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header principal avec titre, recherche et actions */}      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Panel de filtres - sidebar gauche sur desktop */}
          <aside className="lg:w-80 flex-shrink-0">
            <EventsFilters />
          </aside>
          
          {/* Contenu principal */}
          <main className="flex-1 min-w-0">
            {/* Zone d'affichage des événements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-96">
              {filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold mb-2">Aucun événement trouvé</h3>
                  <p className="text-center max-w-md">
                    Essayez de modifier vos critères de recherche ou créez votre premier événement.
                  </p>
                </div>
              ) : (
                <>
                  {/* Affichage selon le mode sélectionné */}
                  {renderEventsView()}
                  
                  {/* Pagination */}
                  {filteredEvents.length > viewOptions.itemsPerPage && (
                    <div className="border-t border-gray-200 px-6 py-4">
                      <EventsPagination />
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
