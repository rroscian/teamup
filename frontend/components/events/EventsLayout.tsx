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
import { useIsMobile } from '@/frontend/hooks/useIsMobile';
import { useAuth } from '@/frontend/hooks/useAuth';
import { useGeolocation } from '@/frontend/hooks/useGeolocation';
import { EventCardWithDistance } from './EventCardWithDistance';
import { PlusIcon, MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Footer from '@/frontend/components/Footer';

export function EventsLayout() {
  const { loading, error, viewOptions, filteredEvents, filters, setFilters, events, suggestedEvents, nearbyEvents, loadNearbyEvents, userPosition } = useEvents();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [showLatestEvents, setShowLatestEvents] = React.useState(false);
  const [showNearbyEvents, setShowNearbyEvents] = React.useState(false);
  
  // Géolocalisation
  const shouldEnableGeolocation = user?.profile?.enableGeolocation || false;
  const { position, enabled, requestPermission } = useGeolocation(shouldEnableGeolocation);
  
  // Charger les événements proches quand la position change
  React.useEffect(() => {
    if (position && enabled) {
      loadNearbyEvents(position.lat, position.lng, 10);
    }
  }, [position, enabled]);
  
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
        {/* Header avec titre et bouton créer - Optimisé mobile */}
        <div className={`flex flex-col space-y-6 mb-8 ${
          isMobile ? 'text-center' : 'sm:flex-row sm:items-center sm:justify-between sm:space-y-0'
        }`}>
          <div className={isMobile ? 'px-2' : ''}>
            <h1 className={`font-bold text-gray-900 ${
              isMobile ? 'text-2xl' : 'text-3xl'
            }`}>Événements</h1>
            <p className={`text-gray-600 ${
              isMobile ? 'mt-3 text-base leading-relaxed' : 'mt-2'
            }`}>
              Découvrez et participez aux événements près de chez vous
            </p>
          </div>
          <div className={isMobile ? '' : 'mt-4 sm:mt-0'}>
            <Link
              href="/events/create"
              className={`inline-flex items-center justify-center border border-transparent rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                isMobile 
                  ? 'w-full px-6 py-4 text-base font-semibold' 
                  : 'px-4 py-2 text-sm font-medium'
              }`}
            >
              <PlusIcon className={`mr-2 ${
                isMobile ? 'h-6 w-6' : 'h-5 w-5'
              }`} />
              {isMobile ? 'Créer mon événement' : 'Créer un événement'}
            </Link>
          </div>
        </div>
        
        {/* Barre de recherche principale - Optimisée mobile */}
        <div className="mb-8">
          <div className={`relative ${
            isMobile ? 'w-full' : 'max-w-md'
          }`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className={`text-gray-400 ${
                isMobile ? 'h-6 w-6' : 'h-5 w-5'
              }`} />
            </div>
            <input
              type="text"
              placeholder={isMobile ? 'Rechercher...' : 'Rechercher des événements...'}
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className={`block w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 shadow-sm ${
                isMobile 
                  ? 'pl-12 pr-4 py-4 text-base' 
                  : 'pl-10 pr-3 py-2 text-sm'
              }`}
            />
          </div>
        </div>

        {/* Filtres mobiles - affichés sous la barre de recherche */}
        {isMobile && (
          <div className="mb-8">
            <EventsFilters />
          </div>
        )}

        {/* Section des événements proches */}
        {enabled && nearbyEvents.length > 0 && (
          <div className="mb-8">
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${
              isMobile ? '' : 'bg-transparent shadow-none border-none'
            }`}>
              <div className={`flex items-center justify-between p-4 ${
                isMobile ? 'border-b border-gray-200' : 'pb-0 px-0'
              }`}>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-blue-600" />
                  <h3 className={`font-semibold text-gray-900 ${
                    isMobile ? 'text-base' : 'text-xl'
                  }`}>Événements à proximité</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {nearbyEvents.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowNearbyEvents(!showNearbyEvents)}
                  className={`text-gray-400 hover:text-gray-600 ${
                    isMobile ? '' : 'lg:hidden'
                  }`}
                >
                  {showNearbyEvents ? '▲' : '▼'}
                </button>
              </div>
              
              <div className={`${
                showNearbyEvents ? (isMobile ? 'block' : 'block') : (isMobile ? 'hidden' : 'hidden lg:block')
              }`}>
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
                  isMobile ? 'p-4 pt-0' : 'pt-4'
                }`}>
                  {nearbyEvents.slice(0, 6).map((event) => (
                    <EventCardWithDistance key={event.id} event={event} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section des derniers événements créés */}
        {latestEvents.length > 0 && (
          <div className="mb-8">
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${
              isMobile ? '' : 'bg-transparent shadow-none border-none'
            }`}>
              {/* Header similaire aux filtres */}
              <div className={`flex items-center justify-between p-4 ${
                isMobile ? 'border-b border-gray-200' : 'pb-0 px-0'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🆕</span>
                  <h3 className={`font-semibold text-gray-900 ${
                    isMobile ? 'text-base' : 'text-xl'
                  }`}>Nouveautés</h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {Math.min(latestEvents.length, 3)}
                  </span>
                </div>
                <button
                  onClick={() => setShowLatestEvents(!showLatestEvents)}
                  className={`text-gray-400 hover:text-gray-600 ${
                    isMobile ? '' : 'lg:hidden'
                  }`}
                >
                  {showLatestEvents ? '▲' : '▼'}
                </button>
              </div>
              
              {/* Contenu des nouveautés */}
              <div className={`${
                showLatestEvents ? (isMobile ? 'block' : 'block') : (isMobile ? 'hidden' : 'hidden lg:block')
              }`}>
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
                  isMobile ? 'p-4 pt-0' : 'pt-4'
                }`}>
                  {latestEvents.slice(0, 3).map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer">
                        
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                            {/* Badge sport */}
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                              {event.sport?.charAt(0).toUpperCase() + event.sport?.slice(1) || event.category}
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
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Panel de filtres - sidebar gauche sur desktop seulement */}
          {!isMobile && (
            <aside className="lg:w-80 flex-shrink-0">
              <EventsFilters />
            </aside>
          )}
          
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
      <Footer />
    </div>
  );
}
