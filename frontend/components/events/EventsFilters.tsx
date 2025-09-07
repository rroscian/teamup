'use client';

import React, { useState } from 'react';
import { useEvents } from '@/frontend/contexts/EventsContext';
import { Sport, SkillLevel } from '@/shared/types';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

export function EventsFilters() {
  const { filters, setFilters, clearFilters, events } = useEvents();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extraire les valeurs uniques pour les filtres
  const uniqueLocations = Array.from(new Set(events.map(e => e.location.city))).filter(Boolean);
  const uniqueSports = Array.from(new Set(events.map(e => e.sport))).filter(Boolean);
  const uniqueLevels = Array.from(new Set(events.map(e => e.level))).filter(Boolean);

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ level: e.target.value as SkillLevel || undefined });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ location: e.target.value });
  };

  const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ sport: e.target.value as Sport || undefined });
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxPrice = e.target.value ? parseFloat(e.target.value) : undefined;
    setFilters({ maxPrice });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : undefined;
    setFilters({
      dateRange: {
        ...filters.dateRange,
        [field]: date
      }
    });
  };

  const hasActiveFilters = 
    filters.location || 
    filters.sport ||
    filters.level ||
    filters.maxPrice !== undefined ||
    filters.dateRange.start || 
    filters.dateRange.end;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-32">
      {/* Header du panel de filtres */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filtres</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Actifs
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Tout effacer
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-600 lg:hidden"
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Contenu des filtres */}
      <div className={`${isCollapsed ? 'hidden lg:block' : 'block'}`}>
        <div className="p-4 space-y-6">
          {/* Filtre par sport */}
          {uniqueSports.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Sport</h4>
              <select
                value={filters.sport || ''}
                onChange={handleSportChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  filters.sport 
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium' 
                    : 'border-gray-300 text-gray-800'
                }`}
              >
                <option value="">Tous les sports</option>
                {Object.values(Sport).map((sport) => (
                  <option key={sport} value={sport}>
                    {sport.charAt(0).toUpperCase() + sport.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtre par niveau */}
          {uniqueLevels.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Niveau</h4>
              <select
                value={filters.level || ''}
                onChange={handleLevelChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  filters.level 
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium' 
                    : 'border-gray-300 text-gray-800'
                }`}
              >
                <option value="">Tous les niveaux</option>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
                <option value="mixed">Mixte</option>
              </select>
            </div>
          )}

          {/* Filtre par prix */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Prix maximum</h4>
            <input
              type="number"
              min="0"
              placeholder="Prix max (€)"
              value={filters.maxPrice || ''}
              onChange={handlePriceRangeChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                filters.maxPrice !== undefined 
                  ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium' 
                  : 'border-gray-300 text-gray-800'
              }`}
            />
          </div>

          {/* Filtre par localisation */}
          {uniqueLocations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Localisation</h4>
              <select
                value={filters.location}
                onChange={handleLocationChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  filters.location 
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium' 
                    : 'border-gray-300 text-gray-800'
                }`}
              >
                <option value="">Toutes les villes</option>
                {uniqueLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          )}


          {/* Filtre par date */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Période</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-800 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    filters.dateRange.start 
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium' 
                      : 'border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-800 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    filters.dateRange.end 
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium' 
                      : 'border-gray-300 text-gray-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Raccourcis de dates */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Raccourcis</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFilters({
                  dateRange: {
                    start: new Date(),
                    end: undefined
                  }
                })}
                className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-800"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setFilters({
                    dateRange: {
                      start: new Date(),
                      end: nextWeek
                    }
                  });
                }}
                className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-800"
              >
                Cette semaine
              </button>
              <button
                onClick={() => {
                  const nextMonth = new Date();
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setFilters({
                    dateRange: {
                      start: new Date(),
                      end: nextMonth
                    }
                  });
                }}
                className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors col-span-2 text-gray-800"
              >
                Ce mois
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
