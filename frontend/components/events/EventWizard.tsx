'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useEvents, Event } from '@/frontend/contexts/EventsContext';
import { Sport, SkillLevel, EventLocation, EventStatus } from '@/shared/types';

// Types pour le wizard
interface WizardFormData {
  // Étape 1: Informations générales
  title: string;
  description: string;
  
  // Étape 2: Sport et niveau
  type: string;
  sport: Sport;
  skillLevel: SkillLevel;
  
  // Étape 3: Date, heure et lieu
  date: string;
  time: string;
  locationName: string;
  locationAddress: string;
  city: string;
  postalCode: string;
  
  // Étape 4: Participants et prix
  maxParticipants: string;
  price: string;
  
  // Étape 5: Personnalisation
  imageUrl: string;
  equipment: string[];
  newEquipment: string;
}

interface EventWizardProps {
  event?: Event;
  onComplete: () => void;
}

const STORAGE_KEY = 'teamup_event_draft';

export function EventWizard({ event, onComplete }: EventWizardProps) {
  const { addEvent, updateEvent } = useEvents();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);

  // Types d'événements sportifs
  const eventTypes = ['tournoi', 'entrainement', 'match', 'sport en groupe', 'autre'];

  const [formData, setFormData] = useState<WizardFormData>({
    title: '',
    description: '',
    type: 'tournoi',
    sport: Sport.Football,
    skillLevel: SkillLevel.Intermediate,
    date: '',
    time: '',
    locationName: '',
    locationAddress: '',
    city: '',
    postalCode: '',
    maxParticipants: '',
    price: '',
    imageUrl: '',
    equipment: [],
    newEquipment: ''
  });

  // Charger les données sauvegardées ou de l'événement
  useEffect(() => {
    if (event) {
      // Charger les données de l'événement existant
      const eventDate = event.startDate.toISOString().split('T')[0];
      const eventTime = event.startDate.toTimeString().slice(0, 5);
      
      setFormData({
        title: event.title,
        description: event.description || '',
        type: event.type || 'tournoi',
        sport: (event as any).sport || Sport.Football,
        skillLevel: (event as any).skillLevel || SkillLevel.Intermediate,
        date: eventDate,
        time: eventTime,
        locationName: event.location.name || '',
        locationAddress: event.location.address || '',
        city: event.location.city || '',
        postalCode: event.location.postalCode || '',
        maxParticipants: (event as any).maxParticipants?.toString() || '',
        price: (event as any).price?.toString() || '',
        imageUrl: event.imageUrl || '',
        equipment: (event as any).equipment || [],
        newEquipment: ''
      });
    } else {
      // Charger les données sauvegardées dans localStorage
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(prev => ({ ...prev, ...parsed }));
          setHasSavedData(true);
        } catch (error) {
          console.error('Erreur lors du chargement des données sauvegardées:', error);
          setHasSavedData(false);
        }
      } else {
        // Initialiser avec des valeurs par défaut
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().slice(0, 5);
        
        setFormData(prev => ({
          ...prev,
          date: today,
          time: currentTime
        }));
        setHasSavedData(false);
      }
    }
  }, [event]);

  // Sauvegarde automatique dans localStorage
  useEffect(() => {
    if (!event) { // Ne sauvegarder que pour les nouveaux événements
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, event]);

  // Mettre à jour les données du formulaire
  const updateFormData = (updates: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Recommencer de zéro - vider localStorage et réinitialiser le formulaire
  const startFresh = () => {
    localStorage.removeItem(STORAGE_KEY);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    setFormData({
      title: '',
      description: '',
      type: 'tournoi',
      sport: Sport.Football,
      skillLevel: SkillLevel.Intermediate,
      date: today,
      time: currentTime,
      locationName: '',
      locationAddress: '',
      city: '',
      postalCode: '',
      maxParticipants: '10',
      price: '0',
      imageUrl: '',
      equipment: [],
      newEquipment: ''
    });
    
    setCurrentStep(1);
    setHasSavedData(false);
  };

  // Navigation entre les étapes
  const goToStep = (step: number) => {
    if (step >= 1 && step <= 6) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };


  // Ajouter équipement
  const addEquipment = () => {
    if (formData.newEquipment.trim() && !formData.equipment.includes(formData.newEquipment.trim())) {
      updateFormData({
        equipment: [...formData.equipment, formData.newEquipment.trim()],
        newEquipment: ''
      });
    }
  };

  // Supprimer équipement
  const removeEquipment = (equipmentToRemove: string) => {
    updateFormData({
      equipment: formData.equipment.filter(eq => eq !== equipmentToRemove)
    });
  };

  // Vérifier si une étape est valide
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim().length > 0;
      case 2:
        return true; // Sport et niveau par défaut
      case 3:
        return formData.date.length > 0 && formData.time.length > 0 && formData.locationName.trim().length > 0 && formData.city.trim().length > 0;
      case 4:
        return true; // Optionnel
      case 5:
        return true; // Optionnel
      case 6:
        // Validation finale : vérifier tous les champs obligatoires
        return formData.title.trim().length > 0 && 
               formData.date.length > 0 && 
               formData.time.length > 0 && 
               formData.locationName.trim().length > 0 &&
               formData.city.trim().length > 0 &&
               formData.maxParticipants &&
               parseInt(formData.maxParticipants) >= 2;
      default:
        return true;
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const eventDate = new Date(`${formData.date}T${formData.time}`);
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: 'sports' as const,
        type: formData.type,
        sport: formData.sport,
        date: eventDate,
        startDate: eventDate,
        endDate: eventDate,
        location: {
          name: formData.locationName,
          address: formData.locationAddress || formData.locationName,
          city: formData.city,
          postalCode: formData.postalCode || '',
          type: 'outdoor' as const
        } as EventLocation,
        imageUrl: formData.imageUrl || '',
        skillLevel: formData.skillLevel,
        level: formData.skillLevel,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : 10,
        minParticipants: 2,
        price: formData.price ? parseFloat(formData.price) : undefined,
        equipment: formData.equipment,
        currentParticipants: 0,
        createdById: 'temp-user-id',
        participants: [],
        status: EventStatus.Published
      };

      if (event) {
        await updateEvent(event.id, eventData);
      } else {
        // addEvent est maintenant asynchrone et sauvegarde en base
        await addEvent(eventData);
        // Nettoyer le localStorage après création réussie
        localStorage.removeItem(STORAGE_KEY);
      }

      onComplete();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // TODO: Afficher un message d'erreur à l'utilisateur
      alert('Erreur lors de la création de l\'événement. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Définir les étapes
  const steps = [
    { number: 1, title: 'Informations générales', description: 'Titre et description' },
    { number: 2, title: 'Sport et niveau', description: 'Type de sport et niveau requis' },
    { number: 3, title: 'Date et lieu', description: 'Quand et où' },
    { number: 4, title: 'Participants', description: 'Nombre et prix' },
    { number: 5, title: 'Personnalisation', description: 'Mots-clés et équipements' },
    { number: 6, title: 'Révision et validation', description: 'Vérifier et publier' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Indicateur de progression */}
      <div className="mb-8">
        {/* Version desktop */}
        <div className="hidden lg:flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep > step.number
                    ? 'bg-green-500 border-green-500 text-white'
                    : currentStep === step.number
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : isStepValid(step.number)
                    ? 'bg-gray-100 border-gray-300 text-gray-600'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                {currentStep > step.number ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-6 ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Version tablet */}
        <div className="hidden sm:flex lg:hidden flex-wrap justify-center gap-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors text-sm ${
                  currentStep > step.number
                    ? 'bg-green-500 border-green-500 text-white'
                    : currentStep === step.number
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : isStepValid(step.number)
                    ? 'bg-gray-100 border-gray-300 text-gray-600'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                {currentStep > step.number ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <p className={`mt-2 text-xs font-medium text-center max-w-20 ${
                currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
            </div>
          ))}
        </div>

        {/* Version mobile */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentStep > step.number
                      ? 'bg-green-500'
                      : currentStep === step.number
                      ? 'bg-blue-500'
                      : isStepValid(step.number)
                      ? 'bg-gray-300'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              Étape {currentStep} sur {steps.length}
            </span>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {steps[currentStep - 1].title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>
      </div>

      {/* Alerte pour les données sauvegardées */}
      {hasSavedData && !event && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Brouillon d'événement récupéré
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  Vous avez un brouillon d'événement en cours. Vous pouvez continuer où vous vous êtes arrêté ou recommencer de zéro.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <button
                type="button"
                onClick={startFresh}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Recommencer de zéro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu de l'étape */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-96">
        {/* Étape 1: Informations générales */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations générales
              </h3>
              <p className="text-gray-600 mb-6">
                Commençons par les informations de base de votre événement
              </p>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'événement *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                placeholder="Ex: Tournoi de football du dimanche"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Décrivez votre événement, les règles, l'ambiance..."
              />
            </div>
          </div>
        )}

        {/* Étape 2: Sport et niveau */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sport et niveau
              </h3>
              <p className="text-gray-600 mb-6">
                Précisez le type d'événement sportif et le niveau requis
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'événement *
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => updateFormData({ type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                  Sport *
                </label>
                <select
                  id="sport"
                  value={formData.sport}
                  onChange={(e) => updateFormData({ sport: e.target.value as Sport })}
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
            </div>

            <div>
              <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Niveau requis
              </label>
              <select
                id="skillLevel"
                value={formData.skillLevel}
                onChange={(e) => updateFormData({ skillLevel: e.target.value as typeof formData.skillLevel })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value={SkillLevel.Beginner}>Débutant</option>
                <option value={SkillLevel.Intermediate}>Intermédiaire</option>
                <option value={SkillLevel.Advanced}>Avancé</option>
                <option value={SkillLevel.Mixed}>Tous niveaux</option>
              </select>
            </div>
          </div>
        )}

        {/* Étape 3: Date et lieu */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Date et lieu
              </h3>
              <p className="text-gray-600 mb-6">
                Quand et où aura lieu votre événement ?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => updateFormData({ date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Heure *
                </label>
                <input
                  type="time"
                  id="time"
                  value={formData.time}
                  onChange={(e) => updateFormData({ time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du lieu *
                </label>
                <input
                  type="text"
                  id="locationName"
                  value={formData.locationName}
                  onChange={(e) => updateFormData({ locationName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ex: Stade municipal, Complexe sportif Jean Moulin"
                />
              </div>
              
              <div>
                <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  id="locationAddress"
                  value={formData.locationAddress}
                  onChange={(e) => updateFormData({ locationAddress: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ex: 15 rue du Sport"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData({ city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ex: Paris"
                  />
                </div>
                
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => updateFormData({ postalCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ex: 75001"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Étape 4: Participants */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Participants et prix
              </h3>
              <p className="text-gray-600 mb-6">
                Définissez le nombre de participants et le prix (optionnel)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre maximum de participants
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={(e) => updateFormData({ maxParticipants: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ex: 20"
                />
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
                  onChange={(e) => updateFormData({ price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Informations</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Laissez vide si votre événement est gratuit</li>
                <li>• Le nombre de participants peut être modifié plus tard</li>
                <li>• Ces informations aident les participants à mieux comprendre l'événement</li>
              </ul>
            </div>
          </div>
        )}

        {/* Étape 5: Personnalisation */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personnalisation
              </h3>
              <p className="text-gray-600 mb-6">
                Ajoutez une image et précisez l'équipement nécessaire
              </p>
            </div>


            {/* Image */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                URL de l'image
              </label>
              <input
                type="url"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => updateFormData({ imageUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-900 bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Équipement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Équipement nécessaire
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.equipment.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeEquipment(item)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.newEquipment}
                  onChange={(e) => updateFormData({ newEquipment: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ex: Chaussures de sport, bouteille d'eau..."
                />
                <button
                  type="button"
                  onClick={addEquipment}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Étape 6: Révision et validation */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Révision et validation
              </h3>
              <p className="text-gray-600 mb-6">
                Vérifiez toutes les informations de votre événement avant de le publier
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations générales */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Informations générales</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateFormData({ title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => updateFormData({ description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sport et niveau */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Sport et niveau</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => updateFormData({ type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sport *</label>
                    <select
                      value={formData.sport}
                      onChange={(e) => updateFormData({ sport: e.target.value as Sport })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Niveau requis</label>
                    <select
                      value={formData.skillLevel}
                      onChange={(e) => updateFormData({ skillLevel: e.target.value as SkillLevel })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={SkillLevel.Beginner}>Débutant</option>
                      <option value={SkillLevel.Intermediate}>Intermédiaire</option>
                      <option value={SkillLevel.Advanced}>Avancé</option>
                      <option value={SkillLevel.Mixed}>Tous niveaux</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Date et lieu */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Date et lieu</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => updateFormData({ date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure *</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => updateFormData({ time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du lieu *</label>
                    <input
                      type="text"
                      value={formData.locationName}
                      onChange={(e) => updateFormData({ locationName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Stade municipal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input
                      type="text"
                      value={formData.locationAddress}
                      onChange={(e) => updateFormData({ locationAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 123 rue du Sport"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData({ city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Paris"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => updateFormData({ postalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 75001"
                    />
                  </div>
                </div>
              </div>

              {/* Participants et prix */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Participants et prix</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre maximum de participants *</label>
                    <input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => updateFormData({ maxParticipants: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="2"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateFormData({ price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      placeholder="Gratuit"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Personnalisation */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Personnalisation</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Équipement nécessaire</label>
                <div className="flex flex-wrap gap-1">
                  {formData.equipment.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeEquipment(item)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              {formData.imageUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.imageUrl}
                      alt="Aperçu"
                      className="h-16 w-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => updateFormData({ imageUrl: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="URL de l'image"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <div>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Précédent
            </button>
          ) : (
            <Link
              href="/events"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour aux événements
            </Link>
          )}
        </div>

        <div className="text-sm text-gray-500">
          Étape {currentStep} sur {steps.length}
        </div>

        <div>
          {currentStep < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStep === 5 ? 'Réviser' : 'Suivant'}
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepValid(6)}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Enregistrement...' : (event ? 'Modifier l\'événement' : 'Créer l\'événement')}
              <CheckIcon className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
