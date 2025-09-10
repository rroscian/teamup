import React, { useState, useEffect } from 'react';
import { Sport, SkillLevel } from '@/shared/types';
import { NearbyEventFilters } from '@/frontend/hooks/useNearbyEvents';

interface NearbyEventsFiltersProps {
  filters: NearbyEventFilters;
  onFiltersChange: (filters: NearbyEventFilters) => void;
  userPosition: { lat: number; lng: number } | null;
  onRequestLocation: () => Promise<void>;
  hasLocationPermission: boolean;
  loading?: boolean;
  metadata?: {
    userPosition: { lat: number; lng: number };
    radius: number;
    totalFound: number;
  };
}

const SPORTS_OPTIONS: { value: Sport; label: string }[] = [
  { value: Sport.Football, label: '⚽ Football' },
  { value: Sport.Basketball, label: '🏀 Basketball' },
  { value: Sport.Tennis, label: '🎾 Tennis' },
  { value: Sport.Volleyball, label: '🏐 Volleyball' },
  { value: Sport.Running, label: '🏃 Course' },
  { value: Sport.Cycling, label: '🚴 Cyclisme' },
  { value: Sport.Swimming, label: '🏊 Natation' },
  { value: Sport.Badminton, label: '🏸 Badminton' },
  { value: Sport.TableTennis, label: '🏓 Ping-pong' },
  { value: Sport.Other, label: '🏃 Autre' }
];

const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: SkillLevel.Beginner, label: '🟢 Débutant' },
  { value: SkillLevel.Intermediate, label: '🟡 Intermédiaire' },
  { value: SkillLevel.Advanced, label: '🟠 Avancé' },
  { value: SkillLevel.Mixed, label: '🎯 Mixte' }
];

const RADIUS_OPTIONS = [
  { value: 5, label: '5 km', icon: '📍' },
  { value: 10, label: '10 km', icon: '🎯' },
  { value: 20, label: '20 km', icon: '🌍' },
  { value: 50, label: '50 km', icon: '🗺️' }
];

export const NearbyEventsFilters: React.FC<NearbyEventsFiltersProps> = ({
  filters,
  onFiltersChange,
  userPosition,
  onRequestLocation,
  hasLocationPermission,
  loading = false,
  metadata
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<NearbyEventFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof NearbyEventFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { radius: 10 };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getLocationStatusColor = () => {
    if (!hasLocationPermission) return 'text-red-500';
    if (userPosition) return 'text-green-500';
    return 'text-yellow-500';
  };

  const getLocationStatusIcon = () => {
    if (!hasLocationPermission) return '❌';
    if (userPosition) return '✅';
    return '⏳';
  };

  const getLocationStatusText = () => {
    if (!hasLocationPermission) return 'Géolocalisation refusée';
    if (userPosition) return `Position: ${userPosition.lat.toFixed(4)}, ${userPosition.lng.toFixed(4)}`;
    return 'Obtention de la position...';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* En-tête avec statut de géolocalisation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-800">
            🌍 Événements à proximité
          </h3>
          <div className={`flex items-center space-x-2 text-sm ${getLocationStatusColor()}`}>
            <span>{getLocationStatusIcon()}</span>
            <span>{getLocationStatusText()}</span>
          </div>
        </div>

        {!hasLocationPermission && (
          <button
            onClick={onRequestLocation}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Localisation...</span>
              </>
            ) : (
              <>
                <span>📍</span>
                <span>Activer</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Métadonnées des résultats */}
      {metadata && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-blue-700">
            <span>📏 Rayon: {metadata.radius}km</span>
            <span>🎯 Résultats: {metadata.totalFound}</span>
            <span>📍 Position: {metadata.userPosition.lat.toFixed(4)}, {metadata.userPosition.lng.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* Filtres de base */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Rayon de recherche */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📏 Rayon de recherche
          </label>
          <div className="grid grid-cols-2 gap-2">
            {RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange('radius', option.value)}
                className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  (localFilters.radius || 10) === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sport */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏃 Sport
          </label>
          <select
            value={localFilters.sport || ''}
            onChange={(e) => handleFilterChange('sport', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous les sports</option>
            {SPORTS_OPTIONS.map((sport) => (
              <option key={sport.value} value={sport.value}>
                {sport.label}
              </option>
            ))}
          </select>
        </div>

        {/* Niveau */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🎯 Niveau
          </label>
          <select
            value={localFilters.level || ''}
            onChange={(e) => handleFilterChange('level', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous les niveaux</option>
            {SKILL_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="border-t pt-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span>{isExpanded ? '🔽' : '▶️'}</span>
          <span>Filtres avancés</span>
        </button>

        {isExpanded && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏙️ Ville
              </label>
              <input
                type="text"
                value={localFilters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                placeholder="Filtrer par ville..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Bouton de reset */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <span>🔄</span>
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
