'use client';

import React, { useState } from 'react';
import { useEvents } from '@/frontend/contexts/EventsContext';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

export function EventsFilters() {
  const { filters, setFilters, clearFilters, events } = useEvents();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extraire les valeurs uniques pour les filtres
  const uniqueCategories = Array.from(new Set(events.map(e => e.category))).filter(Boolean);
  const uniqueTypes = Array.from(new Set(events.map(e => e.type))).filter(Boolean);
  const uniqueTags = Array.from(new Set(events.flatMap(e => e.tags))).filter(Boolean);
  const uniqueLocations = Array.from(new Set(events.map(e => e.location))).filter(Boolean);

  const handleCategoryChange = (category: string) => {
    setFilters({ category: filters.category === category ? '' : category });
  };

  const handleTypeChange = (type: string) => {
    setFilters({ type: filters.type === type ? '' : type });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ location: e.target.value });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    setFilters({ tags: newTags });
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
    filters.category || 
    filters.type || 
    filters.location || 
    filters.tags.length > 0 || 
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
          {/* Filtre par catégorie */}
          {uniqueCategories.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Catégorie</h4>
              <div className="space-y-2">
                {uniqueCategories.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.category === category}
                      onChange={() => handleCategoryChange(category)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Filtre par type */}
          {uniqueTypes.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Type</h4>
              <div className="space-y-2">
                {uniqueTypes.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.type === type}
                      onChange={() => handleTypeChange(type)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Filtre par localisation */}
          {uniqueLocations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Localisation</h4>
              <select
                value={filters.location}
                onChange={handleLocationChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes les locations</option>
                {uniqueLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtre par tags */}
          {uniqueTags.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {uniqueTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                    {filters.tags.includes(tag) && (
                      <XMarkIcon className="inline h-3 w-3 ml-1" />
                    )}
                  </button>
                ))}
              </div>
              {uniqueTags.length > 10 && (
                <p className="text-xs text-gray-500 mt-2">
                  +{uniqueTags.length - 10} tags disponibles
                </p>
              )}
            </div>
          )}

          {/* Filtre par date */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Période</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
                className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
                className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors col-span-2"
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
