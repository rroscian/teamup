// Hook personnalisé pour les appels API
import { useState, useCallback } from 'react';
import { ApiResponse, ApiError } from '@/shared/types';
import { API_ROUTES } from '@/shared/constants';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export function useApi<T = any>(apiOptions?: UseApiOptions) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (
    endpoint: string,
    fetchOptions: RequestInit = {}
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      });

      const result: ApiResponse<T> = await response.json();

      if (!response.ok || !result.success) {
        const error: ApiError = result.error || {
          message: 'An unexpected error occurred',
          code: 'UNKNOWN_ERROR',
        };
        
        setState(prev => ({ ...prev, loading: false, error }));
        apiOptions?.onError?.(error);
        return null;
      }

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        data: result.data,
        error: null 
      }));
      
      apiOptions?.onSuccess?.(result.data);
      return result.data;
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
      };
      
      setState(prev => ({ ...prev, loading: false, error: apiError }));
      apiOptions?.onError?.(apiError);
      return null;
    }
  }, [apiOptions]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    apiCall: execute, // Alias pour compatibilité avec useEvents
    reset,
  };
}

// Hooks spécialisés pour chaque ressource
export function useUsers() {
  const api = useApi();

  const fetchUsers = useCallback(() => {
    return api.execute(API_ROUTES.USERS);
  }, [api]);

  const createUser = useCallback((userData: any) => {
    return api.execute(API_ROUTES.USERS, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }, [api]);

  const updateUser = useCallback((id: string, userData: any) => {
    return api.execute(`${API_ROUTES.USERS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }, [api]);

  const deleteUser = useCallback((id: string) => {
    return api.execute(`${API_ROUTES.USERS}/${id}`, {
      method: 'DELETE',
    });
  }, [api]);

  return {
    ...api,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}

export function useTeams() {
  const api = useApi();

  const fetchTeams = useCallback((userId?: string) => {
    const url = userId 
      ? `${API_ROUTES.TEAMS}?userId=${userId}` 
      : API_ROUTES.TEAMS;
    return api.execute(url);
  }, [api]);

  const createTeam = useCallback((teamData: any) => {
    return api.execute(API_ROUTES.TEAMS, {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }, [api]);

  const updateTeam = useCallback((id: string, teamData: any) => {
    return api.execute(`${API_ROUTES.TEAMS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teamData),
    });
  }, [api]);

  const deleteTeam = useCallback((id: string) => {
    return api.execute(`${API_ROUTES.TEAMS}/${id}`, {
      method: 'DELETE',
    });
  }, [api]);

  return {
    ...api,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  };
}
