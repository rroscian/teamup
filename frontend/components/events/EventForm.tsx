'use client';

import React, { useState, useEffect } from 'react';
import { useEvents, Event } from '@/frontend/contexts/EventsContext';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid';
import { CalendarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

// Types locaux pour les catégories et types d'événements
type EventCategory = 'sports' | 'social' | 'corporate';
type EventType = string;

interface EventFormProps {
  event?: Event;
  isOpen: boolean;
  onClose: () => void;
}

export function EventForm({ event, isOpen, onClose }: EventFormProps) {
  const { addEvent, updateEvent } = useEvents();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'social' as EventCategory,
    type: 'meetup' as EventType,
    date: '',
    time: '',
    location: '',
    maxParticipants: '',
    price: '',
    tags: [] as string[],
    newTag: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Types par catégorie
  const typesByCategory = {
    sports: ['tournament', 'training', 'match', 'other'],
    social: ['meetup', 'party', 'workshop', 'networking', 'other'],
    corporate: ['meeting', 'conference', 'training', 'team-building', 'other']
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
        type: event.type,
        date: eventDate,
        time: eventTime,
        location: event.location,
        maxParticipants: (event as any).maxParticipants || '',
        price: (event as any).price || '',
        tags: event.tags || [],
        newTag: ''
      });
    } else {
      // Réinitialiser le formulaire pour un nouvel événement
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      setFormData({
        title: '',
        description: '',
        category: 'social',
        type: 'meetup',
        date: today,
        time: currentTime,
        location: '',
        maxParticipants: '',
        price: '',
        tags: [],
        newTag: ''
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
        category: formData.category as EventCategory,
        type: formData.type,
        date: eventDateTime,
        location: formData.location.trim(),
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        tags: formData.tags.filter(tag => tag.trim()),
        // Gestion des propriétés spécifiques selon le type d'événement
        ...(formData.category === 'social' && {
          participants: (event as any)?.participants || [],
          organizer: (event as any)?.organizer || { id: 'current-user', name: 'Utilisateur actuel' }
        }),
        ...(formData.category === 'sports' && {
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined
        }),
        ...(formData.category === 'corporate' && {
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

  const handleAddTag = () => {
    const newTag = formData.newTag.trim();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag],
        newTag: ''
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
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

  if (!isOpen) return null;

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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value as EventCategory)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="sports">Sports</option>
                  <option value="social">Social</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
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
            <div className="grid grid-cols-2 gap-4">
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

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.newTag}
                    onChange={(e) => setFormData({ ...formData, newTag: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ajouter un tag..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:text-blue-600"
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
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Enregistrement...' : (event ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
