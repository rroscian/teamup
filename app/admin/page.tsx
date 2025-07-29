'use client';

import { useState } from 'react';
import AdminLayout from '@/frontend/components/admin/AdminLayout';
import EventsManagement from '@/frontend/components/admin/EventsManagement';
import UsersManagement from '@/frontend/components/admin/UsersManagement';
import DashboardOverview from '@/frontend/components/admin/DashboardOverview';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'users'>('dashboard');

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
