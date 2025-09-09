'use client';

import { useState, useEffect } from 'react';
import { Sport } from '@/shared/types';
import { Check, X, Save } from 'lucide-react';

interface SportPreferencesProps {
  currentSports: string[];
  onSave: (sports: string[]) => Promise<void>;
  isLoading?: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

const SPORT_LABELS: Record<Sport, string> = {
  [Sport.Football]: 'Football',
  [Sport.Basketball]: 'Basketball',
  [Sport.Tennis]: 'Tennis',
  [Sport.Volleyball]: 'Volleyball',
  [Sport.Running]: 'Course à pied',
  [Sport.Cycling]: 'Cyclisme',
  [Sport.Swimming]: 'Natation',
  [Sport.Badminton]: 'Badminton',
  [Sport.TableTennis]: 'Tennis de table',
  [Sport.Gymnastics]: 'Gymnastique',
  [Sport.Hiking]: 'Randonnée',
  [Sport.Jogging]: 'Jogging',
  [Sport.Dance]: 'Danse',
  [Sport.Rugby]: 'Rugby',
  [Sport.Handball]: 'Handball',
  [Sport.Other]: 'Autre'
};

export default function SportPreferences({
  currentSports,
  onSave,
  isLoading = false,
  isEditing,
  onEdit,
  onCancel
}: SportPreferencesProps) {
  const [selectedSports, setSelectedSports] = useState<string[]>(currentSports);

  useEffect(() => {
    setSelectedSports(currentSports);
  }, [currentSports, isEditing]);

  const handleSportToggle = (sport: Sport) => {
    setSelectedSports(prev => {
      if (prev.includes(sport)) {
        return prev.filter(s => s !== sport);
      } else {
        return [...prev, sport];
      }
    });
  };

  const handleSave = async () => {
    await onSave(selectedSports);
  };

  const handleCancel = () => {
    setSelectedSports(currentSports);
    onCancel();
  };

  const allSports = Object.values(Sport);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-[#2C3E50]">Sports favoris</h3>
        {!isEditing ? (
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm bg-[#00A8CC] text-white rounded-lg hover:bg-[#007A99] transition-colors duration-200"
          >
            Modifier
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
            >
              <Save className="w-3 h-3" />
              <span>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <X className="w-3 h-3" />
              <span>Annuler</span>
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <p className="text-sm text-[#2C3E50]/70">
            Sélectionnez les sports qui vous intéressent :
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {allSports.map((sport) => (
              <button
                key={sport}
                onClick={() => handleSportToggle(sport)}
                className={`
                  flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                  ${selectedSports.includes(sport)
                    ? 'border-[#00A8CC] bg-[#00A8CC]/10 text-[#00A8CC]'
                    : 'border-gray-200 bg-white text-[#2C3E50] hover:border-[#00A8CC]/50'
                  }
                `}
              >
                <span className="text-sm font-medium">
                  {SPORT_LABELS[sport]}
                </span>
                {selectedSports.includes(sport) && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#2C3E50]/60">
            {selectedSports.length} sport(s) sélectionné(s)
          </p>
        </div>
      ) : (
        <div>
          {currentSports.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {currentSports.map((sport) => (
                <span
                  key={sport}
                  className="px-3 py-1 bg-[#00A8CC]/10 text-[#00A8CC] rounded-full text-sm font-medium"
                >
                  {SPORT_LABELS[sport as Sport] || sport}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[#2C3E50]/70 italic">
              Aucun sport sélectionné. Cliquez sur "Modifier" pour ajouter vos préférences.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
