'use client';

import React from 'react';
import { 
  CalendarDaysIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  TrophyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const DashboardOverview: React.FC = () => {
  // Données fictives pour la démonstration - à remplacer par des vraies données
  const stats = [
    {
      title: 'Événements Actifs',
      value: '42',
      change: '+12%',
      changeType: 'positive' as const,
      icon: CalendarDaysIcon,
      color: 'blue',
    },
    {
      title: 'Utilisateurs Inscrits',
      value: '1,248',
      change: '+5%',
      changeType: 'positive' as const,
      icon: UserGroupIcon,
      color: 'green',
    },
    {
      title: 'Événements ce Mois',
      value: '156',
      change: '-2%',
      changeType: 'negative' as const,
      icon: ChartBarIcon,
      color: 'purple',
    },
    {
      title: 'Taux de Participation',
      value: '78%',
      change: '+3%',
      changeType: 'positive' as const,
      icon: TrophyIcon,
      color: 'yellow',
    },
  ];

  const recentEvents = [
    { id: 1, title: 'Match de Football', date: '2024-01-20', participants: 22, status: 'Confirmé' },
    { id: 2, title: 'Session Yoga', date: '2024-01-21', participants: 15, status: 'En attente' },
    { id: 3, title: 'Tournoi Basketball', date: '2024-01-22', participants: 32, status: 'Confirmé' },
    { id: 4, title: 'Course Running', date: '2024-01-23', participants: 45, status: 'Confirmé' },
  ];

  const alerts = [
    { id: 1, type: 'warning', message: '3 événements nécessitent une validation admin' },
    { id: 2, type: 'info', message: 'Nouveau rapport mensuel disponible' },
    { id: 3, type: 'error', message: '2 utilisateurs signalés pour comportement inapproprié' },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500 text-white';
      case 'green':
        return 'bg-green-500 text-white';
      case 'purple':
        return 'bg-purple-500 text-white';
      case 'yellow':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Tableau de bord</h2>
        <p className="text-gray-600 mt-2">Vue d'ensemble de l'activité sur la plateforme</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-sm mt-2 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} depuis le mois dernier
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-yellow-500" />
            Alertes et Notifications
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-md border ${getAlertColor(alert.type)}`}
              >
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Événements Récents</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Événement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {event.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.participants}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      event.status === 'Confirmé'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
