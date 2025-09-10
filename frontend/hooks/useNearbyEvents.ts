import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { Event, Sport, SkillLevel } from '@/shared/types';

export interface NearbyEventFilters {
  sport?: Sport;
  level?: SkillLevel;
  city?: string;
  radius?: number;
}

export interface NearbyEvent extends Event {
  distance: number;
  distanceFormatted: string;
}

export interface UseNearbyEventsResult {
  events: NearbyEvent[];
  loading: boolean;
  error: string | null;
  userPosition: { lat: number; lng: number } | null;
  searchNearby: (filters?: NearbyEventFilters) => Promise<void>;
  requestLocation: () => Promise<void>;
  hasLocationPermission: boolean;
  metadata?: {
    userPosition: { lat: number; lng: number };
    radius: number;
    totalFound: number;
    filters: any;
  };
}

export const useNearbyEvents = (): UseNearbyEventsResult => {
  const { execute } = useApi();
  const [events, setEvents] = useState<NearbyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);

  // Demander la géolocalisation à l'utilisateur
  const requestLocation = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errorMsg = 'La géolocalisation n\'est pas supportée par ce navigateur';
        setError(errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          console.log('🌍 Position obtenue:', coords);
          setUserPosition(coords);
          setHasLocationPermission(true);
          setLoading(false);
          resolve();
        },
        (geoError) => {
          let errorMsg = 'Impossible d\'obtenir votre position';
          
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              errorMsg = 'Accès à la géolocalisation refusé. Veuillez autoriser l\'accès dans les paramètres du navigateur.';
              break;
            case geoError.POSITION_UNAVAILABLE:
              errorMsg = 'Informations de géolocalisation non disponibles.';
              break;
            case geoError.TIMEOUT:
              errorMsg = 'Délai d\'attente dépassé pour obtenir la géolocalisation.';
              break;
          }
          
          console.error('Erreur géolocalisation:', geoError);
          setError(errorMsg);
          setHasLocationPermission(false);
          setLoading(false);
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }, []);

  // Rechercher les événements proches
  const searchNearby = useCallback(async (filters: NearbyEventFilters = {}): Promise<void> => {
    if (!userPosition) {
      setError('Position GPS requise. Veuillez autoriser la géolocalisation.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Construire les paramètres de requête
      const params = new URLSearchParams({
        lat: userPosition.lat.toString(),
        lng: userPosition.lng.toString(),
        radius: (filters.radius || 10).toString()
      });

      if (filters.sport) params.append('sport', filters.sport);
      if (filters.level) params.append('level', filters.level);
      if (filters.city) params.append('city', filters.city);

      console.log('🔍 Recherche événements proches avec params:', Object.fromEntries(params));

      const response = await execute(`/api/events/nearby?${params.toString()}`, {
        method: 'GET'
      });

      if (response) {

        setEvents(response.data || []);
        setMetadata(response.metadata);
        console.log(`✅ ${(response.data || []).length} événements trouvés dans un rayon de ${filters.radius || 10}km`);
      } else {
        throw new Error('Aucune réponse reçue du serveur');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la recherche d\'événements proches';
      console.error('Erreur searchNearby:', err);
      setError(errorMsg);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [userPosition, execute]);

  // Demander automatiquement la position au montage du composant
  useEffect(() => {
    if (!userPosition && !hasLocationPermission) {
      requestLocation().catch(console.error);
    }
  }, [userPosition, hasLocationPermission, requestLocation]);

  // Rechercher automatiquement les événements quand la position est obtenue
  useEffect(() => {
    if (userPosition && !loading) {
      searchNearby().catch(console.error);
    }
  }, [userPosition]); // Volontairement pas searchNearby pour éviter la boucle

  return {
    events,
    loading,
    error,
    userPosition,
    searchNearby,
    requestLocation,
    hasLocationPermission,
    metadata
  };
};
