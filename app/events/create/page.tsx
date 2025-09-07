'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { EventsProvider } from '@/frontend/contexts/EventsContext';
import { EventWizard } from '@/frontend/components/events/EventWizard';

export default function CreateEventPage() {
  const router = useRouter();

  const handleComplete = () => {
    // Rediriger vers la page des événements après création
    router.push('/events');
  };

  return (
    <EventsProvider>
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Créer un événement</h1>
            <p className="mt-2 text-gray-600">
              Suivez ces étapes simples pour organiser votre événement sportif
            </p>
          </div>

          {/* Wizard de création */}
          <EventWizard onComplete={handleComplete} />
        </div>
      </div>
    </EventsProvider>
  );
}
