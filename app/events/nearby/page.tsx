'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/frontend/contexts/AuthContext';
import { useNearbyEvents, NearbyEventFilters } from '@/frontend/hooks/useNearbyEvents';
import { NearbyEventsFilters } from '@/frontend/components/events/NearbyEventsFilters';
import { NearbyEventCard } from '@/frontend/components/events/NearbyEventCard';
import { useApi } from '@/frontend/hooks/useApi';
import Footer from '@/frontend/components/Footer';

export default function NearbyEventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { execute } = useApi();
  const {
    events,
    loading,
    error,
    userPosition,
    searchNearby,
    requestLocation,
    hasLocationPermission,
    metadata
  } = useNearbyEvents();

  const [filters, setFilters] = useState<NearbyEventFilters>({
    radius: 10
  });
  const [, setJoinLoading] = useState<string | null>(null);

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    if (userPosition && !loading) {
      searchNearby(filters);
    }
  }, [filters, userPosition, loading, searchNearby]);

  const handleFiltersChange = (newFilters: NearbyEventFilters) => {
    setFilters(newFilters);
  };

  const handleEventClick = (event: { id: string }) => {
    router.push(`/events/${event.id}`);
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setJoinLoading(eventId);
    try {
      const response = await execute(`/api/events/${eventId}/join`, {
        method: 'POST'
      });

      if (response) {
        // Rafraîchir la liste des événements
        await searchNearby(filters);
      } else {
        console.error('Erreur lors de l\'inscription: Aucune réponse reçue');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
    } finally {
      setJoinLoading(null);
    }
  };

  const renderEmptyState = () => {
    if (!hasLocationPermission) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Géolocalisation requise
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Pour découvrir les événements près de vous, nous avons besoin d&apos;accéder à votre position GPS.
          </p>
          <button
            onClick={requestLocation}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Localisation en cours...' : 'Activer la géolocalisation'}
          </button>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Erreur de géolocalisation
          </h3>
          <p className="text-red-600 mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={requestLocation}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Réessayer
          </button>
        </div>
      );
    }

    if (events.length === 0 && !loading) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Aucun événement trouvé
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Il n&apos;y a pas d&apos;événements dans un rayon de {filters.radius}km de votre position. 
            Essayez d&apos;augmenter le rayon de recherche ou de modifier vos filtres.
          </p>
          <button
            onClick={() => setFilters({ ...filters, radius: (filters.radius || 10) * 2 })}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Étendre la recherche à {(filters.radius || 10) * 2}km
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              🌍 Événements à proximité
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl">
            Découvrez les activités sportives organisées près de chez vous. 
            Utilisez les filtres pour personnaliser votre recherche selon vos préférences.
          </p>
        </div>

        {/* Filtres */}
        <NearbyEventsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          userPosition={userPosition}
          onRequestLocation={requestLocation}
          hasLocationPermission={hasLocationPermission}
          loading={loading}
          metadata={metadata}
        />

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-600">
                {!userPosition ? 'Obtention de votre position...' : 'Recherche d\'événements proches...'}
              </p>
            </div>
          </div>
        )}

        {/* Liste des événements ou état vide */}
        {!loading && (
          <>
            {events.length > 0 ? (
              <div className="space-y-6">
                {/* Titre des résultats */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">
                    🎯 {events.length} événement{events.length > 1 ? 's' : ''} trouvé{events.length > 1 ? 's' : ''}
                  </h2>
                  <div className="text-sm text-gray-500">
                    Triés par distance croissante
                  </div>
                </div>

                {/* Grille des événements */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <NearbyEventCard
                      key={event.id}
                      event={event}
                      onEventClick={handleEventClick}
                      onJoinEvent={handleJoinEvent}
                      currentUserId={user?.id}
                    />
                  ))}
                </div>

                {/* Statistiques en bas */}
                {metadata && (
                  <div className="bg-white rounded-lg p-4 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{metadata.totalFound}</div>
                        <div className="text-sm text-gray-600">Événements trouvés</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{metadata.radius}km</div>
                        <div className="text-sm text-gray-600">Rayon de recherche</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {events.length > 0 ? `${events[0].distance}km` : '-'}
                        </div>
                        <div className="text-sm text-gray-600">Plus proche</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {events.length > 0 ? `${events[events.length - 1].distance}km` : '-'}
                        </div>
                        <div className="text-sm text-gray-600">Plus éloigné</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              renderEmptyState()
            )}
          </>
        )}

        {/* Bouton d'action flottant pour créer un événement */}
        {hasLocationPermission && (
          <div className="fixed bottom-6 right-6">
            <button
              onClick={() => router.push('/events/create')}
              className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              title="Créer un événement"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
