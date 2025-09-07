'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/frontend/hooks/useAuth';
import { UserSportProfile, Sport, SkillLevel, DayOfWeek, TimeSlot, DayAvailability } from '@/shared/types';
import { Button } from './Button';
import { Card } from './Card';

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const { getProfile, updateProfile, loading, error } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserSportProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<UserSportProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const userProfile = await getProfile(userId);
      setProfile(userProfile);
      setEditedProfile(userProfile);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    try {
      await updateProfile(userId, editedProfile);
      setProfile(editedProfile);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const toggleAvailability = (day: DayOfWeek, slot: TimeSlot) => {
    if (!editedProfile) return;

    const currentWeekdays = editedProfile.availability?.weekdays || [];
    const dayAvailability = currentWeekdays.find(a => a.day === day);

    let newWeekdays;
    if (dayAvailability) {
      const currentSlots = dayAvailability.timeSlots || [];
      const hasSlot = currentSlots.some(s => isSameSlot(s, slot));
      if (hasSlot) {
        // Remove slot
        const newSlots = currentSlots.filter(s => !isSameSlot(s, slot));
        if (newSlots.length === 0) {
          // Remove day if no slots
          newWeekdays = currentWeekdays.filter(a => a.day !== day);
        } else {
          newWeekdays = currentWeekdays.map(a =>
            a.day === day ? { ...a, timeSlots: newSlots, available: true } : a
          );
        }
      } else {
        // Add slot
        newWeekdays = currentWeekdays.map(a =>
          a.day === day ? { ...a, timeSlots: [...currentSlots, slot], available: true } : a
        );
      }
    } else {
      // Add new day with slot
      newWeekdays = [...currentWeekdays, { day, timeSlots: [slot], available: true }];
    }

    setEditedProfile({
      ...editedProfile,
      availability: {
        weekdays: newWeekdays,
        preferredTimes: editedProfile.availability?.preferredTimes || []
      }
    });
  };

  const sportEmojis: Record<Sport, string> = {
    [Sport.Football]: '⚽',
    [Sport.Basketball]: '🏀',
    [Sport.Tennis]: '🎾',
    [Sport.Volleyball]: '🏐',
    [Sport.Running]: '🏃',
    [Sport.Cycling]: '🚴',
    [Sport.Swimming]: '🏊',
    [Sport.Badminton]: '🏸',
    [Sport.TableTennis]: '🏓',
    [Sport.Gymnastics]: '🤸',
    [Sport.Hiking]: '🥾',
    [Sport.Jogging]: '🏃‍♀️',
    [Sport.Dance]: '💃',
    [Sport.Rugby]: '🏈',
    [Sport.Handball]: '🤾',
    [Sport.Other]: '🏃'
  };

  const dayLabels: Record<DayOfWeek, string> = {
    [DayOfWeek.Monday]: 'Lundi',
    [DayOfWeek.Tuesday]: 'Mardi',
    [DayOfWeek.Wednesday]: 'Mercredi',
    [DayOfWeek.Thursday]: 'Jeudi',
    [DayOfWeek.Friday]: 'Vendredi',
    [DayOfWeek.Saturday]: 'Samedi',
    [DayOfWeek.Sunday]: 'Dimanche'
  };

  // Définition des créneaux horaires prédéfinis
  const predefinedSlots: TimeSlot[] = [
    { startTime: '06:00', endTime: '12:00' },
    { startTime: '12:00', endTime: '18:00' },
    { startTime: '18:00', endTime: '00:00' }
  ];

  const getSlotLabel = (slot: TimeSlot): string => {
    if (slot.startTime === '06:00' && slot.endTime === '12:00') return 'Matin (6h-12h)';
    if (slot.startTime === '12:00' && slot.endTime === '18:00') return 'Après-midi (12h-18h)';
    if (slot.startTime === '18:00' && slot.endTime === '00:00') return 'Soir (18h-00h)';
    return `${slot.startTime} - ${slot.endTime}`;
  };

  const isSameSlot = (a: TimeSlot, b: TimeSlot): boolean => {
    return a.startTime === b.startTime && a.endTime === b.endTime;
  };

  if (loading) {
    return <div className="text-center py-8">Chargement du profil...</div>;
  }

  if (!profile && !loading) {
    return <div className="text-center py-8">Profil non trouvé</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profil Sportif</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>
            Modifier le profil
          </Button>
        ) : (
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditedProfile(profile);
                setEditing(false);
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Enregistrer'}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Sports favoris */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sports favoris et niveaux</h3>
        <div className="space-y-3">
          {(editing ? editedProfile : profile)?.favoriteSports?.map(sport => {
            const skillLevel = (editing ? editedProfile : profile)?.skillLevels?.find(
              sl => sl.sport === sport
            )?.level;

            return (
              <div key={sport} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{sportEmojis[sport]}</span>
                  <span className="font-medium">{sport}</span>
                </div>
                <div className="flex gap-2">
                  {editing ? (
                    Object.values(SkillLevel).map(level => (
                      <button
                        key={level}
                        onClick={() => {
                          if (!editedProfile) return;
                          const newLevels = editedProfile.skillLevels || [];
                          const existingIndex = newLevels.findIndex(sl => sl.sport === sport);
                          
                          if (existingIndex >= 0) {
                            newLevels[existingIndex] = { sport, level };
                          } else {
                            newLevels.push({ sport, level });
                          }

                          setEditedProfile({
                            ...editedProfile,
                            skillLevels: newLevels
                          });
                        }}
                        className={`px-3 py-1 text-sm rounded ${
                          skillLevel === level
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {level === SkillLevel.Beginner ? 'Débutant' :
                         level === SkillLevel.Intermediate ? 'Intermédiaire' :
                         level === SkillLevel.Advanced ? 'Avancé' : 'Mixte'}
                      </button>
                    ))
                  ) : (
                    <span className={`px-3 py-1 text-sm rounded ${
                      skillLevel === SkillLevel.Beginner ? 'bg-blue-100 text-blue-700' :
                      skillLevel === SkillLevel.Intermediate ? 'bg-yellow-100 text-yellow-700' :
                      skillLevel === SkillLevel.Advanced ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {skillLevel === SkillLevel.Beginner ? 'Débutant' :
                       skillLevel === SkillLevel.Intermediate ? 'Intermédiaire' :
                       skillLevel === SkillLevel.Advanced ? 'Avancé' : 'Mixte'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Disponibilités */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Disponibilités</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(DayOfWeek).map(day => {
            const dayAvailability = (editing ? editedProfile : profile)?.availability?.weekdays?.find(
              (a: DayAvailability) => a.day === day
            );

            return (
              <div key={day} className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">{dayLabels[day]}</h4>
                <div className="space-y-1">
                  {predefinedSlots.map((slot, index) => {
                    const isAvailable = dayAvailability?.timeSlots?.some(s => isSameSlot(s, slot)) || false;

                    return editing ? (
                      <label
                        key={index}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isAvailable}
                          onChange={() => toggleAvailability(day, slot)}
                          className="rounded"
                        />
                        <span className="text-sm">{getSlotLabel(slot)}</span>
                      </label>
                    ) : (
                      isAvailable && (
                        <div key={index} className="text-sm text-gray-600">
                          ✓ {getSlotLabel(slot)}
                        </div>
                      )
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Bio */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bio</h3>
        {editing ? (
          <textarea
            value={editedProfile?.bio || ''}
            onChange={(e) => setEditedProfile({
              ...editedProfile!,
              bio: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={4}
            placeholder="Parlez de votre expérience sportive..."
          />
        ) : (
          <p className="text-gray-700">
            {profile?.bio || 'Aucune bio renseignée'}
          </p>
        )}
      </Card>

      {/* Localisation */}
      {(profile?.location?.city || profile?.location?.postalCode) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Localisation</h3>
          <p className="text-gray-700">
            {profile.location.city}{profile.location.postalCode && `, ${profile.location.postalCode}`}
          </p>
        </Card>
      )}
    </div>
  );
}
