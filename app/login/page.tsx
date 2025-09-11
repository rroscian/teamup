'use client';

import React from 'react';
import { LoginForm } from '@/frontend/components/LoginForm';
import Footer from '@/frontend/components/Footer';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <LoginForm />
        </div>
      </div>
      <Footer />
    </div>
  );
}
