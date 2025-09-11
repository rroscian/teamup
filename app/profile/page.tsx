'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/frontend/hooks/useAuth';
import { User, Edit3, Save, X, Camera, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SportPreferences from '@/frontend/components/profile/SportPreferences';
import GeolocationSettings from '@/frontend/components/profile/GeolocationSettings';
import { useToast } from '@/frontend/contexts/ToastContext';
import Footer from '@/frontend/components/Footer';

export default function ProfilePage() {
  const { user, updateUserInfo, logout, refreshUser, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    city: '',
    postalCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingSports, setIsEditingSports] = useState(false);
  const [isSavingSports, setIsSavingSports] = useState(false);
  const [isSavingGeolocation, setIsSavingGeolocation] = useState(false);

  // Remove automatic redirect - let the user stay on profile page
  // Only redirect if explicitly not authenticated on initial load

  // Initialize form data when user loads (only once)
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    if (user && !hasInitialized) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        city: user.profile?.location?.city || '',
        postalCode: user.profile?.location?.postalCode || ''
      });
      setHasInitialized(true);
    }
  }, [user, hasInitialized]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!user?.id) {
      showError('Erreur: utilisateur non identifié');
      return;
    }

    setIsLoading(true);
    
    try {
      const profileData = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        location: {
          city: formData.city,
          postalCode: formData.postalCode
        }
      };
      const updatedUser = await updateUserInfo(user.id, profileData);
      if (updatedUser) {
        // Forcer le rechargement COMPLET des données utilisateur (pseudo ET photo)
        await refreshUser();
        
        // Petit délai pour s'assurer que le refresh est terminé et que les états sont synchronisés
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Synchroniser les données du formulaire
        setFormData({
          name: updatedUser.name || updatedUser.username || formData.name,
          email: updatedUser.email || formData.email,
          bio: updatedUser.profile?.bio || formData.bio,
          city: updatedUser.profile?.location?.city || formData.city,
          postalCode: updatedUser.profile?.location?.postalCode || formData.postalCode
        });
        
        setIsEditing(false);
        showSuccess('Avatar mis à jour avec succès !');
        
        // Force window refresh si nécessaire (en dernier recours)
        window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: updatedUser }));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      showError('Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        city: user.profile?.location?.city || '',
        postalCode: user.profile?.location?.postalCode || ''
      });
    }
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Mot de passe mis à jour avec succès !');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(result.error?.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du changement de mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne peut pas dépasser 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Refresh user data to get new avatar
        await refreshUser();
      } else {
        alert(result.error?.message || 'Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du téléchargement de l\'image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSportsSave = async (sports: string[]) => {
    if (!user?.id) {
      alert('Erreur: utilisateur non identifié');
      return;
    }

    setIsSavingSports(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          favoriteSports: sports
        })
      });

      const result = await response.json();

      if (result.user) {
        // Refresh user data to get updated sports
        await refreshUser();
        
        setIsEditingSports(false);
        showSuccess('Sports favoris mis à jour avec succès !');
      } else {
        alert(result.error || 'Erreur lors de la mise à jour des préférences');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des sports:', error);
      alert('Erreur lors de la mise à jour des préférences sportives');
    } finally {
      setIsSavingSports(false);
    }
  };

  const handleGeolocationToggle = async (enabled: boolean) => {
    if (!user?.id) {
      alert('Erreur: utilisateur non identifié');
      return;
    }

    setIsSavingGeolocation(true);

    try {
      const token = localStorage.getItem('authToken');
      let position = null;
      
      if (enabled) {
        // Si on active, capturer la position actuelle
        try {
          const geoPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
          });
          
          position = {
            lat: geoPosition.coords.latitude,
            lng: geoPosition.coords.longitude,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.error('Erreur lors de la capture de la position:', error);
        }
      }

      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          enableGeolocation: enabled,
          lastKnownPosition: position
        })
      });

      const result = await response.json();

      if (result.user) {
        await refreshUser();
        if (enabled) {
          showSuccess('Géolocalisation activée avec succès !');
        } else {
          showSuccess('Géolocalisation désactivée avec succès !');
        }
      } else {
        showError(result.error || 'Erreur lors de la mise à jour de la géolocalisation');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la géolocalisation:', error);
      alert('Erreur lors de la mise à jour de la géolocalisation');
      throw error;
    } finally {
      setIsSavingGeolocation(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A8CC] mx-auto mb-4"></div>
          <p className="text-[#2C3E50]/70">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-20 sm:pt-28">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#00A8CC] flex items-center justify-center shadow-lg">
                {(user.avatar || user.profile?.avatar) ? (
                  <Image 
                    src={user.profile?.avatar || user.avatar || ''}
                    alt="Photo de profil" 
                    width={96} 
                    height={96} 
                    key={`profile-${user.id}-${user.updatedAt || Date.now()}`}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="w-12 h-12 sm:w-10 sm:h-10 text-white" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 w-10 h-10 sm:w-8 sm:h-8 bg-[#00A8CC] rounded-full flex items-center justify-center text-white hover:bg-[#007A99] transition-colors duration-200 disabled:opacity-50 shadow-lg"
              >
                {isUploadingAvatar ? (
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                ) : (
                  <Camera className="w-5 h-5 sm:w-4 sm:h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-3">Mon Profil</h1>
            <p className="text-base sm:text-sm text-[#2C3E50]/70 px-4 sm:px-0">Gérez vos informations personnelles</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-[#2C3E50]">Informations Personnelles</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center space-x-2 px-6 py-4 sm:px-4 sm:py-2 bg-[#00A8CC] text-white rounded-xl sm:rounded-lg hover:bg-[#007A99] transition-colors duration-200 shadow-lg font-medium text-base sm:text-sm"
                >
                  <Edit3 className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span>Modifier</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center justify-center space-x-2 px-6 py-4 sm:px-4 sm:py-2 bg-green-600 text-white rounded-xl sm:rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 shadow-lg font-medium text-base sm:text-sm"
                  >
                    <Save className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="flex items-center justify-center space-x-2 px-6 py-4 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-xl sm:rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-lg font-medium text-base sm:text-sm"
                  >
                    <X className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span>Annuler</span>
                  </button>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-8 sm:space-y-6">
              {/* Name */}
              <div>
                <label className="block text-base sm:text-sm font-medium text-[#2C3E50] mb-3 sm:mb-2">
                  Nom complet *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 sm:py-3 border border-gray-300 rounded-xl sm:rounded-lg focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent transition-all duration-200 text-[#2C3E50] text-base sm:text-sm shadow-sm"
                    placeholder="Votre nom complet"
                  />
                ) : (
                  <div className="px-4 py-4 sm:py-3 bg-gray-50 rounded-xl sm:rounded-lg text-[#2C3E50] text-base sm:text-sm">
                    {user.name || user.username || 'Non renseigné'}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-base sm:text-sm font-medium text-[#2C3E50] mb-3 sm:mb-2">
                  Adresse e-mail *
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 sm:py-3 border border-gray-300 rounded-xl sm:rounded-lg focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent transition-all duration-200 text-[#2C3E50] text-base sm:text-sm shadow-sm"
                    placeholder="votre@email.com"
                  />
                ) : (
                  <div className="px-4 py-4 sm:py-3 bg-gray-50 rounded-xl sm:rounded-lg text-[#2C3E50] text-base sm:text-sm">
                    {user.email || 'Non renseigné'}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-base sm:text-sm font-medium text-[#2C3E50] mb-3 sm:mb-2">
                  À propos de vous
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-4 sm:py-3 border border-gray-300 rounded-xl sm:rounded-lg focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent transition-all duration-200 text-[#2C3E50] resize-none text-base sm:text-sm shadow-sm"
                    placeholder="Parlez-nous de vous, de votre expérience sportive, de vos objectifs..."
                  />
                ) : (
                  <div className="px-4 py-4 sm:py-3 bg-gray-50 rounded-xl sm:rounded-lg text-[#2C3E50] min-h-[120px] sm:min-h-[100px] text-base sm:text-sm">
                    {user.profile?.bio || 'Non renseigné'}
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-base sm:text-sm font-medium text-[#2C3E50] mb-3 sm:mb-2">
                  Localisation
                </label>
                {isEditing ? (
                  <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 sm:py-3 border border-gray-300 rounded-xl sm:rounded-lg focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent transition-all duration-200 text-[#2C3E50] text-base sm:text-sm shadow-sm"
                      placeholder="Ville"
                    />
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 sm:py-3 border border-gray-300 rounded-xl sm:rounded-lg focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent transition-all duration-200 text-[#2C3E50] text-base sm:text-sm shadow-sm"
                      placeholder="Code postal"
                      pattern="[0-9]{5}"
                    />
                  </div>
                ) : (
                  <div className="px-4 py-4 sm:py-3 bg-gray-50 rounded-xl sm:rounded-lg text-[#2C3E50] text-base sm:text-sm">
                    {user.profile?.location?.city ? (
                      <>
                        {user.profile.location.city}
                        {user.profile.location.postalCode && ` - ${user.profile.location.postalCode}`}
                      </>
                    ) : 'Non renseigné'}
                  </div>
                )}
              </div>

              {/* Sports Preferences */}
              <div className="pt-8 sm:pt-6 border-t border-gray-200">
                <SportPreferences
                  currentSports={user?.profile?.favoriteSports || []}
                  onSave={handleSportsSave}
                  isLoading={isSavingSports}
                  isEditing={isEditingSports}
                  onEdit={() => setIsEditingSports(true)}
                  onCancel={() => setIsEditingSports(false)}
                />
              </div>

              {/* Geolocation Settings */}
              <div className="pt-8 sm:pt-6 border-t border-gray-200">
                <GeolocationSettings
                  isEnabled={user?.profile?.enableGeolocation || false}
                  lastPosition={user?.profile?.lastKnownPosition as { lat: number; lng: number; timestamp: string } | undefined}
                  onToggle={handleGeolocationToggle}
                  isLoading={isSavingGeolocation}
                />
              </div>

              {/* Account Info */}
              <div className="pt-8 sm:pt-6 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-medium text-[#2C3E50] mb-6 sm:mb-4">Informations du Compte</h3>
                <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                  <div>
                    <label className="block text-base sm:text-sm font-medium text-[#2C3E50] mb-2 sm:mb-1">
                      Membre depuis
                    </label>
                    <div className="text-[#2C3E50]/70 text-base sm:text-sm">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-base sm:text-sm font-medium text-[#2C3E50] mb-2 sm:mb-1">
                      Dernière mise à jour
                    </label>
                    <div className="text-[#2C3E50]/70 text-base sm:text-sm">
                      {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 mt-4 sm:mt-6">
            <div className="flex items-center space-x-2 mb-6 sm:mb-6">
              <Lock className="w-6 h-6 sm:w-5 sm:h-5 text-[#2C3E50]" />
              <h2 className="text-lg sm:text-xl font-semibold text-[#2C3E50]">Changer le mot de passe</h2>
            </div>
            
            <div className="space-y-6 sm:space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-base sm:text-sm font-medium text-[#2C3E50] mb-3 sm:mb-2">
                  Mot de passe actuel *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-4 sm:py-3 border border-gray-300 rounded-xl sm:rounded-lg focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent transition-all duration-200 pr-14 sm:pr-12 text-[#2C3E50] text-base sm:text-sm shadow-sm"
                    placeholder="Votre mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-4 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#00A8CC] p-1"
                  >
                    {showPasswords.current ? <EyeOff className="w-6 h-6 sm:w-5 sm:h-5" /> : <Eye className="w-6 h-6 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-base sm:text-sm font-medium text-[#2C3E50] mb-3 sm:mb-2">
                  Nouveau mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-4 sm:py-3 border border-gray-300 rounded-xl sm:rounded-lg focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent transition-all duration-200 pr-14 sm:pr-12 text-[#2C3E50] text-base sm:text-sm shadow-sm"
                    placeholder="Votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-4 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#00A8CC] p-1"
                  >
                    {showPasswords.new ? <EyeOff className="w-6 h-6 sm:w-5 sm:h-5" /> : <Eye className="w-6 h-6 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-base sm:text-sm font-medium text-[#2C3E50] mb-3 sm:mb-2">
                  Confirmer le nouveau mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-4 sm:py-3 border border-gray-300 rounded-xl sm:rounded-lg focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent transition-all duration-200 pr-14 sm:pr-12 text-[#2C3E50] text-base sm:text-sm shadow-sm"
                    placeholder="Confirmer votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-4 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#00A8CC] p-1"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-6 h-6 sm:w-5 sm:h-5" /> : <Eye className="w-6 h-6 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="w-full px-6 py-4 sm:py-3 bg-[#00A8CC] text-white rounded-xl sm:rounded-lg hover:bg-[#007A99] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium text-base sm:text-sm"
              >
                {isChangingPassword ? 'Mise à jour...' : 'Changer le mot de passe'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 sm:mt-8 text-center">
            <button
              onClick={handleLogout}
              className="px-8 py-4 sm:px-6 sm:py-3 bg-red-600 text-white rounded-xl sm:rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg font-medium text-base sm:text-sm"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
