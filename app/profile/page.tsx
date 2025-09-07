'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/frontend/hooks/useAuth';
import { User, Edit3, Save, X, Camera, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, updateUserInfo, logout, refreshUser, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Remove automatic redirect - let the user stay on profile page
  // Only redirect if explicitly not authenticated on initial load

  // Initialize form data when user loads (only once)
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    if (user && !hasInitialized) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
      setHasInitialized(true);
    }
  }, [user, hasInitialized]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setSuccessMessage(null);
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!user?.id) {
      setSuccessMessage(null);
      alert('Erreur: utilisateur non identifié');
      return;
    }

    setIsLoading(true);
    setSuccessMessage(null);
    
    try {
      const updatedUser = await updateUserInfo(user.id, formData);
      if (updatedUser) {
        // Forcer le rechargement COMPLET des données utilisateur (pseudo ET photo)
        await refreshUser();
        
        // Petit délai pour s'assurer que le refresh est terminé et que les états sont synchronisés
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Synchroniser les données du formulaire
        setFormData({
          name: updatedUser.name || updatedUser.username || formData.name,
          email: updatedUser.email || formData.email
        });
        
        setIsEditing(false);
        setSuccessMessage('Profil mis à jour avec succès !');
        
        // Force window refresh si nécessaire (en dernier recours)
        window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: updatedUser }));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setSuccessMessage(null);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
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
    <div className="min-h-screen bg-[#F8F9FA] pt-28">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#00A8CC] flex items-center justify-center">
                {(user.avatar || user.profile?.avatar) ? (
                  <Image 
                    src={user.profile?.avatar || user.avatar || ''}
                    alt="Photo de profil" 
                    width={80} 
                    height={80} 
                    key={`profile-${user.id}-${user.updatedAt || Date.now()}`}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#00A8CC] rounded-full flex items-center justify-center text-white hover:bg-[#007A99] transition-colors duration-200 disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Camera className="w-4 h-4" />
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
            <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">Mon Profil</h1>
            <p className="text-[#2C3E50]/70">Gérez vos informations personnelles</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#2C3E50]">Informations Personnelles</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#00A8CC] text-white rounded-lg hover:bg-[#007A99] transition-colors duration-200"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Annuler</span>
                  </button>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                  Nom complet *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent transition-all duration-200 text-[#2C3E50]"
                    placeholder="Votre nom complet"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-[#2C3E50]">
                    {user.name || user.username || 'Non renseigné'}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                  Adresse e-mail *
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent transition-all duration-200 text-[#2C3E50]"
                    placeholder="votre@email.com"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-[#2C3E50]">
                    {user.email || 'Non renseigné'}
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-[#2C3E50] mb-4">Informations du Compte</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                      Membre depuis
                    </label>
                    <div className="text-[#2C3E50]/70">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                      Dernière mise à jour
                    </label>
                    <div className="text-[#2C3E50]/70">
                      {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <div className="flex items-center space-x-2 mb-6">
              <Lock className="w-5 h-5 text-[#2C3E50]" />
              <h2 className="text-xl font-semibold text-[#2C3E50]">Changer le mot de passe</h2>
            </div>
            
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                  Mot de passe actuel *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent transition-all duration-200 pr-12 text-[#2C3E50]"
                    placeholder="Votre mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#00A8CC]"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                  Nouveau mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent transition-all duration-200 pr-12 text-[#2C3E50]"
                    placeholder="Votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#00A8CC]"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                  Confirmer le nouveau mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent transition-all duration-200 pr-12 text-[#2C3E50]"
                    placeholder="Confirmer votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#00A8CC]"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="w-full px-6 py-3 bg-[#00A8CC] text-white rounded-lg hover:bg-[#007A99] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? 'Mise à jour...' : 'Changer le mot de passe'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 text-center">
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
