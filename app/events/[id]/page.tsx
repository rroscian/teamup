'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/frontend/hooks/useAuth';
import { eventService } from '@/backend/services/eventService';
import { Event } from '@/shared/types';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserGroupIcon,
  CurrencyEuroIcon,
  TrophyIcon,
  InformationCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/frontend/components/events/ui/LoadingSpinner';
import { ErrorMessage } from '@/frontend/components/events/ui/ErrorMessage';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  const eventId = params.id as string;

  const loadEvent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const eventData = await eventService.getEventById(eventId);
      setEvent(eventData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l&apos;événement');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId, loadEvent]);

  const handleRegister = async () => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    if (!event) return;

    try {
      setRegistering(true);
      await eventService.joinEvent(event.id);
      // Recharger l'événement pour mettre à jour la liste des participants
      await loadEvent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!user || !event) return;

    try {
      setRegistering(true);
      setError(null);
      await eventService.leaveEvent(event.id);
      await loadEvent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la désinscription de l&apos;événement');
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!user || !event) return;

    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible et supprimera tous les participants et messages associés.'
    );

    if (!confirmed) return;

    try {
      setRegistering(true);
      setError(null);
      
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l&apos;événement');
      }

      // Rediriger vers la liste des événements après suppression
      router.push('/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l&apos;événement');
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Chargement de l'événement..." />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Événement non trouvé</h1>
            <p className="text-gray-600 mb-8">Cet événement n&apos;existe pas ou a été supprimé.</p>
            <button
              onClick={() => router.push('/events')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Retour aux événements
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const remainingSpots = event.maxParticipants - event.participants.length;
  const isFullyBooked = remainingSpots <= 0;
  const isUserRegistered = user && event.participants.some(p => p.userId === user.id);
  const isEventCreator = user && event.createdById === user.id;
  const canRegister = isAuthenticated && !isUserRegistered && !isFullyBooked && !isEventCreator;
  const canUnregister = isAuthenticated && isUserRegistered && !isEventCreator;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour
          </button>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Image de l'événement */}
              {event.imageUrl && (
                <div className="aspect-video relative">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                {/* Titre et catégorie */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.category === 'sports' ? 'bg-green-100 text-green-800' :
                      event.category === 'social' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {event.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <TrophyIcon className="h-4 w-4" />
                      <span>{event.sport}</span>
                    </div>
                    {event.level && (
                      <div className="px-2 py-1 bg-gray-100 rounded-full text-xs capitalize">
                        {event.level === 'beginner' ? 'Débutant' : 
                         event.level === 'intermediate' ? 'Intermédiaire' :
                         event.level === 'advanced' ? 'Avancé' : 'Mixte'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {event.description || 'Aucune description disponible.'}
                  </p>
                </div>

                {/* Équipements nécessaires */}
                {event.equipment && event.equipment.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Équipements nécessaires</h2>
                    <div className="flex flex-wrap gap-2">
                      {event.equipment.map((item, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Sidebar avec informations et inscription */}
          <div className="space-y-6">
            {/* Informations pratiques */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations pratiques</h2>
              
              <div className="space-y-4">
                {/* Date et heure */}
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Date de début</p>
                    <p className="text-sm text-gray-600">{formatDate(event.startDate)}</p>
                  </div>
                </div>

                {/* Lieu */}
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Lieu</p>
                    <p className="text-sm text-gray-600">{event.location.name}</p>
                    <p className="text-sm text-gray-500">
                      {event.location.address}, {event.location.city}
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-start gap-3">
                  <UserGroupIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Participants</p>
                    <p className="text-sm text-gray-600">
                      {event.participants.length}/{event.maxParticipants} inscrits
                    </p>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      isFullyBooked 
                        ? 'bg-red-100 text-red-800' 
                        : remainingSpots <= 3 
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {isFullyBooked 
                        ? 'Complet'
                        : `${remainingSpots} place${remainingSpots > 1 ? 's' : ''} restante${remainingSpots > 1 ? 's' : ''}`
                      }
                    </div>
                  </div>
                </div>

                {/* Prix */}
                {event.price !== undefined && event.price > 0 && (
                  <div className="flex items-start gap-3">
                    <CurrencyEuroIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Prix</p>
                      <p className="text-sm text-gray-600">{event.price}€</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bouton d'inscription */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {isEventCreator ? 'Gestion de l\'événement' : 'Inscription'}
              </h2>
              
              {isEventCreator ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
                    <InformationCircleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Vous êtes l&apos;organisateur</span>
                  </div>
                  <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-md mb-4">
                    <p className="text-xs text-blue-700">
                      En tant que créateur de cet événement, vous pouvez voir tous les participants inscrits et gérer votre événement.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => router.push(`/events/${eventId}/edit`)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                    >
                      Éditer l&apos;événement
                    </button>
                    <button
                      onClick={handleDeleteEvent}
                      disabled={registering}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    >
                      {registering ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                          Suppression...
                        </>
                      ) : (
                        'Supprimer l\'événement'
                      )}
                    </button>
                  </div>
                </div>
              ) : !isAuthenticated ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Vous devez être connecté pour vous inscrire à cet événement.
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Se connecter
                  </button>
                </div>
              ) : canRegister ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Rejoignez cet événement et rencontrez d&apos;autres passionnés !
                  </p>
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {registering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Inscription...
                      </>
                    ) : (
                      'S\'inscrire à l\'événement'
                    )}
                  </button>
                </div>
              ) : canUnregister ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                    <InformationCircleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Vous êtes inscrit !</span>
                  </div>
                  <button
                    onClick={handleUnregister}
                    disabled={registering}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  >
                    {registering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Désinscription...
                      </>
                    ) : (
                      'Se désinscrire'
                    )}
                  </button>
                </div>
              ) : isFullyBooked ? (
                <div className="text-center">
                  <p className="text-sm text-red-600 mb-4 font-medium">
                    Cet événement est complet.
                  </p>
                  <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-700">
                      Malheureusement, il n&apos;y a plus de places disponibles pour cet événement.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Liste des participants */}
            {event.participants.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Participants ({event.participants.length})
                </h2>
                <div className="space-y-3">
                  {event.participants.slice(0, 5).map((participant) => {
                    if (!participant.user) return null;
                    
                    return (
                      <div key={participant.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {participant.user.avatar ? (
                            <Image
                              src={participant.user.avatar}
                              alt={participant.user.name || 'Utilisateur'}
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {participant.user.name ? participant.user.name.charAt(0).toUpperCase() : '?'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {participant.user.name || 'Utilisateur'}
                          </p>
                          <p className="text-xs text-gray-500">
                            @{participant.user.username || 'utilisateur'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {event.participants.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      Et {event.participants.length - 5} autre{event.participants.length - 5 > 1 ? 's' : ''} participant{event.participants.length - 5 > 1 ? 's' : ''}...
                    </p>
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
