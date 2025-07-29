'use client';

import { useState } from 'react';
import { useApi } from './useApi';
import { User, UserRegistration, UserSportProfile } from '@/shared/types';

export function useAuth() {
  const { execute } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await execute('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      setUser(response.user);
      return response.user;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registrationData: UserRegistration) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await execute('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registrationData)
      });

      setUser(response.user);
      return response.user;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await execute(`/api/users/${userId}/profile`);
      return response.profile;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userId: string, profileData: Partial<UserSportProfile>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await execute(`/api/users/${userId}/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      setUser(response.user);
      return response.user;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    getProfile,
    updateProfile
  };
}
