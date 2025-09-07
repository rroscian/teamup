'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/frontend/hooks/useAuth';
import AdminLayout from '@/frontend/components/admin/AdminLayout';
import EventsManagement from '@/frontend/components/admin/EventsManagement';
import UsersManagement from '@/frontend/components/admin/UsersManagement';
import DashboardOverview from '@/frontend/components/admin/DashboardOverview';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'users'>('dashboard');
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    if (user && !(user.username === 'admin' || user.name === 'admin')) {
      router.replace('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Redirect immediately without showing loading screen to prevent flicker
  if (!isAuthenticated || (user && !(user.username === 'admin' || user.name === 'admin'))) {
    return null;
  }

  // Show loading only when we don't have user data yet but are authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'events':
        return <EventsManagement />;
      case 'users':
        return <UsersManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
}
