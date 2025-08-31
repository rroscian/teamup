'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/frontend/hooks/useAuth';
import { UserRegistration, Sport, SkillLevel, DayOfWeek } from '@/shared/types';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';

export function RegistrationForm() {
  const { register, loading, error } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserRegistration>({
    email: '',
    password: '',
    name: '',
    profile: {
      favoriteSports: [],
      skillLevels: [],
      bio: '',
      location: {
        city: '',
        postalCode: ''
      }
    }
  });

  const sportOptions = [
    { value: Sport.Football, label: '⚽ Football' },
    { value: Sport.Basketball, label: '🏀 Basketball' },
    { value: Sport.Tennis, label: '🎾 Tennis' },
    { value: Sport.Volleyball, label: '🏐 Volleyball' },
    { value: Sport.Running, label: '🏃 Course à pied' },
    { value: Sport.Cycling, label: '🚴 Cyclisme' },
    { value: Sport.Swimming, label: '🏊 Natation' },
    { value: Sport.Badminton, label: '🏸 Badminton' },
    { value: Sport.TableTennis, label: '🏓 Tennis de table' },
    { value: Sport.Other, label: '🏃 Autre' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    try {
      await register(formData);
      // Redirect to profile or events page
      window.location.href = '/events';
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const toggleSport = (sport: Sport) => {
    const currentSports = formData.profile?.favoriteSports || [];
    const newSports = currentSports.includes(sport)
      ? currentSports.filter(s => s !== sport)
      : [...currentSports, sport];

    setFormData({
      ...formData,
      profile: {
        ...formData.profile!,
        favoriteSports: newSports
      }
    });
  };

  const updateSkillLevel = (sport: Sport, level: SkillLevel) => {
    const currentLevels = formData.profile?.skillLevels || [];
    const existingIndex = currentLevels.findIndex(sl => sl.sport === sport);

    let newLevels;
    if (existingIndex >= 0) {
      newLevels = [...currentLevels];
      newLevels[existingIndex] = { sport, level };
    } else {
      newLevels = [...currentLevels, { sport, level }];
    }

    setFormData({
      ...formData,
      profile: {
        ...formData.profile!,
        skillLevels: newLevels
      }
    });
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <Card className="p-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Image 
              src="/teamup_logo.png" 
              alt="TeamUp Logo" 
              width={48} 
              height={48} 
              className="w-12 h-12"
            />
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{color: '#2C3E50'}}>
            Rejoignez TeamUp
          </h2>
          <p className="text-lg" style={{color: '#2C3E50', opacity: 0.7}}>
            Créez votre profil pour organiser des événements sportifs
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-white'
            }`}>
              1
            </div>
            <div className={`w-20 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-white'
            }`}>
              2
            </div>
            <div className={`w-20 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-white'
            }`}>
              3
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-3">⚠️</span>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-6" style={{color: '#2C3E50'}}>Informations de base</h3>
              
              <div>
                <label htmlFor="fullName" className="block text-base font-medium mb-3" style={{color: '#2C3E50'}}>
                  Nom complet
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-base font-medium mb-3" style={{color: '#2C3E50'}}>
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="jean.dupont@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-base font-medium mb-3" style={{color: '#2C3E50'}}>
                  Mot de passe
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-base font-medium mb-3" style={{color: '#2C3E50'}}>
                    Ville
                  </label>
                  <Input
                    type="text"
                    value={formData.profile?.location?.city || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      profile: {
                        ...formData.profile!,
                        location: {
                          ...formData.profile!.location!,
                          city: e.target.value
                        }
                      }
                    })}
                    placeholder="Paris"
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-base font-medium mb-3" style={{color: '#2C3E50'}}>
                    Code postal
                  </label>
                  <Input
                    type="text"
                    value={formData.profile?.location?.postalCode || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      profile: {
                        ...formData.profile!,
                        location: {
                          ...formData.profile!.location!,
                          postalCode: e.target.value
                        }
                      }
                    })}
                    placeholder="75001"
                    pattern="[0-9]{5}"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Sports Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4" style={{color: '#2C3E50'}}>Vos sports préférés</h3>
                <p className="text-base mb-6" style={{color: '#2C3E50', opacity: 0.7}}>
                  Choisissez vos sports préférés et indiquez votre niveau
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {sportOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleSport(value)}
                    className={`p-4 rounded-lg border-2 transition-all font-medium ${
                      formData.profile?.favoriteSports?.includes(value)
                        ? 'border-[#00A8CC] bg-[#00A8CC]/10 text-[#00A8CC]'
                        : 'border-gray-300 hover:border-[#00A8CC] hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {formData.profile?.favoriteSports && formData.profile.favoriteSports.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h4 className="text-lg font-semibold" style={{color: '#2C3E50'}}>Votre niveau pour chaque sport:</h4>
                  {formData.profile.favoriteSports.map(sport => {
                    const sportLabel = sportOptions.find(s => s.value === sport)?.label || sport;
                    const currentLevel = formData.profile?.skillLevels?.find(sl => sl.sport === sport)?.level;
                    
                    return (
                      <div key={sport} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex flex-col space-y-3">
                          <span className="text-base font-semibold text-gray-900">{sportLabel}</span>
                          <div className="flex flex-wrap gap-2">
                            {Object.values(SkillLevel).map(level => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => updateSkillLevel(sport, level)}
                                className={`px-3 py-2 text-sm font-bold rounded-lg transition-all border-2 ${
                                  currentLevel === level
                                    ? 'bg-[#00A8CC] text-white border-[#00A8CC] shadow-md'
                                    : 'bg-white text-gray-900 border-gray-400 hover:bg-[#00A8CC] hover:border-[#00A8CC]'
                                }`}
                              >
                                {level === SkillLevel.Beginner ? 'Débutant' :
                                 level === SkillLevel.Intermediate ? 'Intermédiaire' :
                                 level === SkillLevel.Advanced ? 'Avancé' : 'Mixte'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Bio */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-6" style={{color: '#2C3E50'}}>Présentez-vous</h3>
              
              <div>
                <label htmlFor="bio" className="block text-base font-medium mb-3" style={{color: '#2C3E50'}}>
                  Bio (optionnel)
                </label>
                <textarea
                  value={formData.profile?.bio || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: {
                      ...formData.profile!,
                      bio: e.target.value
                    }
                  })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base font-semibold text-gray-900 bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A8CC] focus:border-[#00A8CC] transition-colors resize-none"
                  rows={4}
                  placeholder="Parlez-nous de vous, de votre expérience sportive, de vos objectifs..."
                />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-12 gap-4">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border-2 border-[#00A8CC] text-[#00A8CC] bg-white hover:bg-[#00A8CC] hover:shadow-lg transition-all duration-200 font-semibold text-base rounded-lg"
              >
                Précédent
              </Button>
            )}
            
            <Button
              type="submit"
              className={`${step > 1 ? 'flex-1' : 'w-full'} bg-[#00A8CC] hover:bg-[#007A99] text-white py-4 rounded-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border-2 border-[#00A8CC]`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Chargement...
                </div>
              ) : (
                step < 3 ? 'Suivant' : 'Créer mon profil'
              )}
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-base">
            <span className="px-4 bg-white font-medium" style={{color: '#2C3E50', opacity: 0.6}}>ou</span>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="mb-6 text-base" style={{color: '#2C3E50', opacity: 0.7}}>
            Déjà un compte ?
          </p>
          <Link href="/login">
            <Button
              type="button"
              variant="outline"
              className="w-full py-4 border-2 border-[#00A8CC] text-[#00A8CC] bg-white hover:bg-[#00A8CC] hover:shadow-lg transition-all duration-200 font-semibold text-lg rounded-lg"
            >
              Se connecter
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
