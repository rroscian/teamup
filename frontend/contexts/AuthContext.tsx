'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { User } from '@/shared/types';
import { useApi } from '@/frontend/hooks/useApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string, profile?: any) => Promise<User>;
  logout: () => void;
  updateUserInfo: (userId: string, userData: Partial<Pick<User, 'name' | 'email'> & { bio?: string; location?: { city?: string; postalCode?: string } }>) => Promise<User>;
  checkAuthStatus: () => Promise<void>;
  getProfile: (userId: string) => Promise<any>;
  updateProfile: (userId: string, profileData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { execute } = useApi();

  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.user) {
          setUser(result.user);
          setIsAuthenticated(true);
        }
      } else {
        throw new Error('Failed to verify token');
      }
    } catch (err) {
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Login failed');
      }

      if (result.token) {
        localStorage.setItem('authToken', result.token);
      }

      if (result.data) {
        setUser(result.data);
        setIsAuthenticated(true);
        return result.data;
      } else {
        throw new Error('No user data received');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, profile?: any): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name, profile })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Registration failed');
      }

      if (result.token) {
        localStorage.setItem('authToken', result.token);
      }

      if (result.data) {
        setUser(result.data);
        setIsAuthenticated(true);
        return result.data;
      } else {
        throw new Error('No user data received');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Vider toutes les données du localStorage
    localStorage.clear();
  };

  const updateUserInfo = async (userId: string, userData: Partial<Pick<User, 'name' | 'email'> & { bio?: string; location?: { city?: string; postalCode?: string } }>): Promise<User> => {
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Séparer les données utilisateur de base et les données de profil
      const { name, email, bio, location, ...rest } = userData;
      const userUpdateData: any = { name, email, ...rest };
      
      // Si on a des données de profil, les inclure
      if (bio !== undefined || location !== undefined) {
        userUpdateData.profile = {};
        if (bio !== undefined) userUpdateData.profile.bio = bio;
        if (location !== undefined) userUpdateData.profile.location = location;
      }
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userUpdateData)
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to update user info');
      }

      // Construire l'objet utilisateur avec toutes les propriétés nécessaires
      const updatedUserData = result.data;
      const updatedUser: User = {
        id: updatedUserData.id,
        email: updatedUserData.email,
        name: updatedUserData.username || updatedUserData.name,
        username: updatedUserData.username || updatedUserData.name,
        avatar: updatedUserData.profile?.avatar || updatedUserData.avatar,
        profile: updatedUserData.profile,
        createdAt: updatedUserData.createdAt,
        updatedAt: updatedUserData.updatedAt
      };

      // Mettre à jour les données utilisateur localement
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      setError(err.message || 'Failed to update user info');
      throw err;
    }
  };

  const getProfile = async (userId: string): Promise<any> => {
    try {
      const response = await execute(`/api/users/${userId}/profile`);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to get profile');
      throw err;
    }
  };

  const updateProfile = async (userId: string, profileData: any): Promise<void> => {
    try {
      await execute(`/api/users/${userId}/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const refreshUser = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.user) {
          // Force complete refresh of user data with photo sync
          const updatedUser: User = {
            id: result.user.id,
            email: result.user.email,
            name: result.user.username || result.user.name,
            username: result.user.username || result.user.name,
            avatar: result.user.profile?.avatar || result.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.email || result.user.id}`,
            profile: result.user.profile,
            createdAt: result.user.createdAt,
            updatedAt: result.user.updatedAt || new Date().toISOString() // Force timestamp update
          };
          
          setUser(updatedUser);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateUserInfo,
    checkAuthStatus,
    getProfile,
    updateProfile,
    refreshUser
  }), [user, isAuthenticated, loading, error, checkAuthStatus, refreshUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
