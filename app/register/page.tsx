'use client';

import React from 'react';
import { RegistrationForm } from '@/frontend/components/RegistrationForm';
import Footer from '@/frontend/components/Footer';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <RegistrationForm />
        </div>
      </div>
      <Footer />
    </div>
  );
}
