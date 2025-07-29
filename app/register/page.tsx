'use client';

import React from 'react';
import { RegistrationForm } from '@/frontend/components/RegistrationForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <RegistrationForm />
      </div>
    </div>
  );
}
