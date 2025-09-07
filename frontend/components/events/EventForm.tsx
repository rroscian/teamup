'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, MapPinIcon, UsersIcon, PlusIcon, PhotoIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useEvents, Event, SportsEvent } from '@/frontend/contexts/EventsContext';
import { Sport } from '@/shared/types';

// Types locaux pour les catégories et types d'événements
type EventCategory = 'sports' | 'social' | 'corporatif';
type EventType = string;

interface EventFormProps {
  event?: Event;
  isOpen: boolean;
  onClose: () => void;
  isEmbedded?: boolean;
}

export function EventForm({ event, isOpen, onClose, isEmbedded = false }: EventFormProps) {
  const { addEvent, updateEvent } = useEvents();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'sports' as EventCategory,
    type: 'tournoi' as EventType,
    sport: Sport.Football,
    date: '',
    time: '',
    location: '',
    maxParticipants: '',
    currentParticipants: 0,
    skillLevel: 'intermediaire' as 'debutant' | 'intermediaire' | 'avance' | 'mixte',
    price: '',
    imageUrl: '',
    equipment: [] as string[],
    newEquipment: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Types par catégorie
  const typesByCategory = {
    sports: ['tournoi', 'entrainement', 'match', 'autre'],
    social: ['rencontre', 'fête', 'atelier', 'réseautage', 'autre'],
    corporatif: ['réunion', 'conférence', 'formation', 'team-building', 'autre']
  };

  // Initialiser le formulaire avec les données de l'événement à éditer
  useEffect(() => {
    if (event) {
      const eventDate = event.date.toISOString().split('T')[0];
      const eventTime = event.date.toTimeString().slice(0, 5);
      
      setFormData({
        title: event.title,
        description: event.description || '',
        category: event.category as EventCategory,
        type: event.type || 'tournoi',
        sport: (event as any).sport || Sport.Football,
        date: eventDate,
        time: eventTime,
        location: typeof event.location === 'string' ? event.location : event.location.name || event.location.address,
        maxParticipants: (event as any).maxParticipants || '',
        currentParticipants: (event as any).currentParticipants || 0,
        skillLevel: (event as any).skillLevel || 'intermediaire',
        price: (event as any).price || '',
        imageUrl: event.imageUrl || '',
        equipment: (event as any).equipment || [],
        newEquipment: ''
      });
    } else {
      // Réinitialiser le formulaire pour un nouvel événement
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      setFormData({
        title: '',
        description: '',
        category: 'sports',
        type: '',
        sport: Sport.Football,
        date: today,
        time: currentTime,
        location: '',
        maxParticipants: '',
        currentParticipants: 0,
        skillLevel: 'intermediaire',
        price: '',
        imageUrl: '',
        equipment: [],
        newEquipment: ''
      });
    }
    setErrors({});
  }, [event, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }

    if (!formData.time) {
      newErrors.time = 'L\'heure est requise';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Le lieu est requis';
    }

    if (formData.maxParticipants && parseInt(formData.maxParticipants) <= 0) {
      newErrors.maxParticipants = 'Le nombre maximum de participants doit être supérieur à 0';
    }

    if (formData.price && parseFloat(formData.price) < 0) {
      newErrors.price = 'Le prix ne peut pas être négatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Construire la date complète
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);

      const eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title.trim(),
        description: formData.description.trim() || '',
        category: formData.category === 'corporatif' ? 'corporate' : formData.category,
        type: formData.type,
        sport: formData.sport,
        date: eventDateTime,
        startDate: eventDateTime,
        endDate: eventDateTime,
        location: {
          name: formData.location.trim(),
          address: formData.location.trim(),
          city: formData.location.split(',')[0]?.trim() || formData.location.trim(),
          postalCode: '',
          type: 'outdoor' as const
        } as any,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : 10,
        minParticipants: 2,
        level: formData.skillLevel as any,
        price: formData.price ? parseFloat(formData.price) : undefined,
        equipment: formData.equipment,
        imageUrl: formData.imageUrl,
        createdById: 'temp-user-id',
        participants: [],
        status: 'published' as any,
        // Gestion des propriétés spécifiques selon le type d'événement
        ...(formData.category === 'social' && {
          participants: (event as any)?.participants || [],
          organizer: (event as any)?.organizer || { id: 'current-user', name: 'Utilisateur actuel' }
        }),
        ...(formData.category === 'sports' && {
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined
        }),
        ...(formData.category === 'corporatif' && {
          price: formData.price ? parseFloat(formData.price) : undefined
        })
      };

      if (event) {
        await updateEvent(event.id, eventData);
      } else {
        await addEvent(eventData);
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors({ submit: 'Une erreur est survenue lors de la sauvegarde' });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleAddEquipment = () => {
    const newEquipment = formData.newEquipment.trim();
    if (newEquipment && !formData.equipment.includes(newEquipment)) {
      setFormData({
        ...formData,
        equipment: [...formData.equipment, newEquipment],
        newEquipment: ''
      });
    }
  };

  const handleRemoveEquipment = (equipmentToRemove: string) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.filter(equipment => equipment !== equipmentToRemove)
    });
  };

  const handleCategoryChange = (newCategory: EventCategory) => {
    const availableTypes = typesByCategory[newCategory];
    const newType = availableTypes.includes(formData.type) ? formData.type : availableTypes[0] as EventType;
    
    setFormData({
      ...formData,
      category: newCategory,
      type: newType
    });
  };

  if (!isOpen && !isEmbedded) return null;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nom de votre événement"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Décrivez votre événement..."
              />
            </div>

            {/* Catégorie et Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'événement sportif *
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {typesByCategory[formData.category as keyof typeof typesByCategory]?.map((type: string) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sport (seulement pour la catégorie Sports) */}
            {formData.category === 'sports' && (
              <div>
                <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                  Sport *
                </label>
                <select
                  id="sport"
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value as Sport })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value={Sport.Football}>Football</option>
                  <option value={Sport.Basketball}>Basketball</option>
                  <option value={Sport.Tennis}>Tennis</option>
                  <option value={Sport.Volleyball}>Volleyball</option>
                  <option value={Sport.Running}>Course à pied</option>
                  <option value={Sport.Cycling}>Cyclisme</option>
                  <option value={Sport.Swimming}>Natation</option>
                  <option value={Sport.Badminton}>Badminton</option>
                  <option value={Sport.TableTennis}>Tennis de table</option>
                  <option value={Sport.Gymnastics}>Gymnastique</option>
                  <option value={Sport.Hiking}>Randonnée</option>
                  <option value={Sport.Jogging}>Jogging</option>
                  <option value={Sport.Dance}>Danse</option>
                  <option value={Sport.Rugby}>Rugby</option>
                  <option value={Sport.Handball}>Handball</option>
                  <option value={Sport.Other}>Autre</option>
                </select>
              </div>
            )}

            {/* Niveau de compétence (seulement pour les sports) */}
            {formData.category === 'sports' && (
              <div>
                <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau requis
                </label>
                <select
                  id="skillLevel"
                  value={formData.skillLevel}
                  onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value as 'debutant' | 'intermediaire' | 'avance' | 'mixte' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="debutant">Débutant</option>
                  <option value="intermediaire">Intermédiaire</option>
                  <option value="avance">Avancé</option>
                  <option value="mixte">Tous niveaux</option>
                </select>
              </div>
            )}

            {/* URL de l'image */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                <PhotoIcon className="h-4 w-4 inline mr-1" />
                URL de l'image
              </label>
              <input
                type="url"
                id="imageUrl"
                placeholder="https://exemple.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="text-sm text-gray-500 mt-1">
                Ajoutez une image pour illustrer votre événement
              </p>
            </div>

            {/* Date et Heure */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg text-base font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="h-4 w-4 inline mr-1" />
                  Heure *
                </label>
                <input
                  type="time"
                  id="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg text-base font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.time && <p className="text-red-600 text-sm mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Lieu */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="h-4 w-4 inline mr-1" />
                Lieu *
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Adresse ou nom du lieu"
              />
              {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Participants et Prix */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre max de participants
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.maxParticipants ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Illimité"
                />
                {errors.maxParticipants && <p className="text-red-600 text-sm mt-1">{errors.maxParticipants}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UsersIcon className="h-4 w-4 inline mr-1" />
                  Participants actuels
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-500 bg-gray-50">
                  {event ? formData.currentParticipants : 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Nombre actuel d'inscrits
                </p>
              </div>

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
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Gratuit"
                />
                {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
              </div>
            </div>


            {/* Équipement requis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Équipement requis
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.newEquipment}
                    onChange={(e) => setFormData({ ...formData, newEquipment: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEquipment())}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ajouter un équipement..."
                  />
                  <button
                    type="button"
                    onClick={handleAddEquipment}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
                
                {formData.equipment.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.equipment.map((equipment) => (
                      <span
                        key={equipment}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {equipment}
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipment(equipment)}
                          className="ml-2 hover:text-green-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Erreur de soumission */}
            {errors.submit && (
              <div className="text-red-600 text-sm">{errors.submit}</div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              {!isEmbedded && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Enregistrement...' : (event ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </form>
  );

  if (isEmbedded) {
    return (
      <div className="p-6">
        {formContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {event ? 'Modifier l\'événement' : 'Nouvel événement'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            {formContent}
          </div>
        </div>
      </div>
    </div>
  );
}
