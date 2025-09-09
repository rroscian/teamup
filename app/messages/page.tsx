'use client';

import { MessagingInterface } from '@/frontend/components/messaging/MessagingInterface';
import { useAuth } from '@/frontend/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MessagesPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-20">
      {/* Interface mobile full-screen */}
      <div className="md:hidden h-[calc(100vh-5rem)]">
        <MessagingInterface />
      </div>
      
      {/* Interface desktop avec marges */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Messagerie</h1>
          <div className="h-[calc(100vh-12rem)]">
            <MessagingInterface />
          </div>
        </div>
      </div>
    </div>
  );
}
