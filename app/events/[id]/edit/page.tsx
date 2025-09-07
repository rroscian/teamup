'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/frontend/hooks/useAuth';
import { eventService } from '@/backend/services/eventService';
import { Event, Sport, SkillLevel, LocationType } from '@/shared/types';

interface CreateEventForm {
  title: string;
  description: string;
  sport: Sport;
  level: SkillLevel;
  maxParticipants: number;
  minParticipants: number;
  startDate: string;
  endDate: string;
  locationName: string;
  locationAddress: string;
  locationCity: string;
  price: number;
}
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/frontend/components/events/ui/LoadingSpinner';
import { ErrorMessage } from '@/frontend/components/events/ui/ErrorMessage';

const sportsOptions: { value: Sport; label: string }[] = [
  { value: Sport.Football, label: 'Football' },
  { value: Sport.Basketball, label: 'Basketball' },
  { value: Sport.Tennis, label: 'Tennis' },
  { value: Sport.Volleyball, label: 'Volleyball' },
  { value: Sport.Running, label: 'Course à pied' },
  { value: Sport.Cycling, label: 'Cyclisme' },
  { value: Sport.Swimming, label: 'Natation' },
  { value: Sport.Badminton, label: 'Badminton' },
  { value: Sport.TableTennis, label: 'Tennis de table' },
  { value: Sport.Gymnastics, label: 'Gymnastique' },
  { value: Sport.Hiking, label: 'Randonnée' },
  { value: Sport.Jogging, label: 'Jogging' },
  { value: Sport.Dance, label: 'Danse' },
  { value: Sport.Rugby, label: 'Rugby' },
  { value: Sport.Handball, label: 'Handball' },
  { value: Sport.Other, label: 'Autre' }
];

const skillLevelOptions: { value: SkillLevel; label: string }[] = [
  { value: SkillLevel.Beginner, label: 'Débutant' },
  { value: SkillLevel.Intermediate, label: 'Intermédiaire' },
  { value: SkillLevel.Advanced, label: 'Avancé' },
  { value: SkillLevel.Mixed, label: 'Tous niveaux' }
];

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventId = params.id as string;

  // Form state
  const [formData, setFormData] = useState<CreateEventForm>({
    title: '',
    description: '',
    sport: Sport.Football,
    level: SkillLevel.Intermediate,
    maxParticipants: 10,
    minParticipants: 2,
    startDate: '',
    endDate: '',
    locationName: '',
    locationAddress: '',
    locationCity: '',
    price: 0
  });


  // Fonction pour convertir une date vers le format datetime-local sans décalage de fuseau horaire
  const toLocalDateTimeString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const eventData = await eventService.getEventById(eventId);
        
        if (!eventData) {
          setError('Événement non trouvé');
          return;
        }

        // Check if user is the creator
        if (eventData.createdById !== user?.id) {
          setError('Vous n\'êtes pas autorisé à éditer cet événement');
          return;
        }

        setEvent(eventData);
        
        // Populate form with existing data
        setFormData({
          title: eventData.title,
          description: eventData.description || '',
          sport: eventData.sport,
          level: (eventData.skillLevel && eventData.skillLevel[0] as SkillLevel) || SkillLevel.Intermediate,
          maxParticipants: eventData.maxParticipants,
          minParticipants: eventData.minParticipants,
          startDate: toLocalDateTimeString(eventData.startDate),
          endDate: toLocalDateTimeString(eventData.endDate),
          locationName: eventData.location.name,
          locationAddress: eventData.location.address,
          locationCity: eventData.location.city,
          price: eventData.price || 0
        });
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (user && eventId) {
      loadEvent();
    }
  }, [user, eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !user) return;

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        title: formData.title,
        description: formData.description,
        sport: formData.sport,
        level: formData.level,
        maxParticipants: formData.maxParticipants,
        minParticipants: formData.minParticipants,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        location: {
          type: LocationType.Outdoor,
          name: formData.locationName,
          address: formData.locationAddress,
          city: formData.locationCity,
          postalCode: '',
          country: 'France'
        },
        price: formData.price
      };

      await eventService.updateEvent(eventId, updateData);
      router.push(`/events/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | Sport | SkillLevel) => {
    setFormData((prev: CreateEventForm) => ({ ...prev, [field]: value }));
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h1>
            <p className="text-gray-800 mb-8">Vous devez être connecté pour éditer un événement.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Chargement de l'événement..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ErrorMessage message={error} />
          <div className="mt-6">
            <button
              onClick={() => router.push('/events')}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              ← Retour aux événements
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/events/${eventId}`)}
            className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour à l&apos;événement
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Éditer l&apos;événement</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l&apos;événement *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ex: Match de football amical"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Décrivez votre événement..."
              />
            </div>

            {/* Sport et Niveau */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                  Sport *
                </label>
                <select
                  id="sport"
                  required
                  value={formData.sport}
                  onChange={(e) => handleInputChange('sport', e.target.value as Sport)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {sportsOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau *
                </label>
                <select
                  id="level"
                  required
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value as SkillLevel)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {skillLevelOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Participants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="minParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre minimum de participants *
                </label>
                <input
                  type="number"
                  id="minParticipants"
                  required
                  min="1"
                  max="100"
                  value={formData.minParticipants}
                  onChange={(e) => handleInputChange('minParticipants', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre maximum de participants *
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  required
                  min="2"
                  max="100"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Date et heure de début *
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  required
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Date et heure de fin *
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  required
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Lieu */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Lieu de l&apos;événement</h3>
              
              <div>
                <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du lieu *
                </label>
                <input
                  type="text"
                  id="locationName"
                  required
                  value={formData.locationName}
                  onChange={(e) => handleInputChange('locationName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ex: Stade Municipal"
                />
              </div>

              <div>
                <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  id="locationAddress"
                  required
                  value={formData.locationAddress}
                  onChange={(e) => handleInputChange('locationAddress', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="123 Rue des Sports"
                />
              </div>

              <div>
                <label htmlFor="locationCity" className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  id="locationCity"
                  required
                  value={formData.locationCity}
                  onChange={(e) => handleInputChange('locationCity', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Paris"
                />
              </div>
            </div>

            {/* Prix */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Prix (€)
              </label>
              <input
                type="number"
                id="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0.00"
              />
            </div>


            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push(`/events/${eventId}`)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
