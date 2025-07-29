'use client';

import React from 'react';
import { EventsProvider } from '@/frontend/contexts/EventsContext';
import { EventsLayout } from '@/frontend/components/events/EventsLayout';

export default function EventsPage() {
  return (
    <EventsProvider>
      <EventsLayout />
    </EventsProvider>
  );
}
