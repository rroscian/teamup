'use client';

import React from 'react';
import { 
  HomeIcon, 
  CalendarDaysIcon, 
  UserGroupIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'events' | 'users';
  setActiveTab: (tab: 'dashboard' | 'events' | 'users') => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'dashboard' as const,
      label: 'Tableau de bord',
      icon: ChartBarIcon,
    },
    {
      id: 'events' as const,
      label: 'Événements',
      icon: CalendarDaysIcon,
    },
    {
      id: 'users' as const,
      label: 'Utilisateurs',
      icon: UserGroupIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Cog6ToothIcon className="w-8 h-8 mr-3 text-blue-600" />
              Administration TeamUp
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin Panel</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="py-6">
            <ul className="space-y-2 px-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
