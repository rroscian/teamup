'use client';

import React from 'react';
import Link from 'next/link';
import { useEvents } from '@/frontend/contexts/EventsContext';
import { EventsFilters } from './EventsFilters';
import { EventsGrid } from './EventsGrid';
import { EventsListView } from './EventsListView';
import { EventsCalendarView } from './EventsCalendarView';
import { EventsPagination } from './EventsPagination';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export function EventsLayout() {
  const { loading, error, viewOptions, filteredEvents, filters, setFilters, events, suggestedEvents } = useEvents();
  
  // Calculer les derniers événements créés (3 plus récents)
  const latestEvents = React.useMemo(() => {
    return [...events]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3);
  }, [events]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Chargement des événements..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} />
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
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header principal avec titre, recherche et actions */}
      <div className="container mx-auto px-4 py-8">
        {/* Header avec titre et bouton créer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
            <p className="mt-2 text-gray-600">
              Découvrez et participez aux événements près de chez vous
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/events/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Créer un événement
            </Link>
          </div>
        </div>
        
        {/* Barre de recherche principale */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher des événements..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
            />
          </div>
        </div>
        
        {/* Section des suggestions personnalisées */}
        {suggestedEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              🎯 Événements suggérés pour vous
            </h2>
            <p className="text-gray-600 mb-4">
              Basé sur vos sports favoris et vos préférences
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {suggestedEvents.map((event) => (
                <div key={event.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-4 hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{event.title}</h3>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                        {event.sport.charAt(0).toUpperCase() + event.sport.slice(1)}
                      </span>
                      {event.level && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {event.level === 'beginner' ? 'Débutant' : 
                           event.level === 'intermediate' ? 'Inter.' :
                           event.level === 'advanced' ? 'Avancé' : 'Mixte'}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-700">
                      <span>📍 {event.location.city}</span>
                      <span>{new Date(event.startDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        {event.participants.length}/{event.maxParticipants} participants
                      </div>
                      {event.price && event.price > 0 ? (
                        <div className="text-sm font-semibold text-green-600">
                          {event.price}€
                        </div>
                      ) : (
                        <div className="text-sm font-semibold text-green-600">
                          Gratuit
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section des derniers événements créés */}
        {latestEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🆕 Nouveautés</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                      {event.sport.charAt(0).toUpperCase() + event.sport.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>📍 {event.location.city}</span>
                    <span>{new Date(event.startDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {event.price && event.price > 0 && (
                    <div className="mt-2 text-sm font-medium text-green-600">
                      {event.price}€
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
