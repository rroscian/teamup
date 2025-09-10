'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface GeolocationCoords {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  updateInterval?: number; // Intervalle en millisecondes pour mettre à jour la position
}

interface UseGeolocationResult {
  position: GeolocationCoords | null;
  error: GeolocationPositionError | null;
  loading: boolean;
  enabled: boolean;
  requestPermission: () => Promise<boolean>;
  clearWatch: () => void;
}

export function useGeolocation(
  shouldWatch: boolean = false,
  options: UseGeolocationOptions = {}
): UseGeolocationResult {
  const [position, setPosition] = useState<GeolocationCoords | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const {
    enableHighAccuracy = true,
    timeout = Infinity, // Pas de timeout - laisse le GPS prendre le temps nécessaire
    maximumAge = 300000, // Accepte une position de 5 minutes maximum
    updateInterval = 60000 // Par défaut, mise à jour toutes les minutes
  } = options;

  const geolocationOptions: PositionOptions = {
    enableHighAccuracy,
    timeout,
    maximumAge
  };

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    const now = Date.now();
    
    // Ne mettre à jour que si l'intervalle est écoulé ou si c'est la première position
    if (now - lastUpdateRef.current >= updateInterval || !position) {
      const newPosition: GeolocationCoords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp
      };
      
      setPosition(newPosition);
      setError(null);
      setLoading(false);
      lastUpdateRef.current = now;
    }
  }, [updateInterval, position]);

  const handleError = useCallback((err: GeolocationPositionError) => {
    setError(err);
    setLoading(false);
    console.error('Geolocation error:', err);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setError(new GeolocationPositionError());
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Utiliser watchPosition pour éviter les timeouts de getCurrentPosition
      let watchId: number | null = null;
      let permissionGranted = false;
      
      await new Promise<GeolocationPosition>((resolve, reject) => {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            permissionGranted = true;
            if (watchId !== null) {
              navigator.geolocation.clearWatch(watchId);
            }
            resolve(position);
          },
          (error) => {
            if (watchId !== null) {
              navigator.geolocation.clearWatch(watchId);
            }
            // Si c'est un timeout mais qu'on a la permission, considérer comme succès
            if (error.code === 3 && permissionGranted) {
              resolve({} as GeolocationPosition);
            } else {
              reject(error);
            }
          },
          {
            enableHighAccuracy: false, // Commencer par une précision faible pour plus de rapidité
            timeout: 10000, // Timeout plus court pour la demande de permission
            maximumAge: 600000 // Accepter une position ancienne pour la permission
          }
        );
      });
      
      return true;
    } catch (error) {
      const geoError = error as GeolocationPositionError;
      // Pour les timeouts, ne pas considérer comme une erreur fatale
      if (geoError.code === 3) {
        return true; // Considérer comme succès pour éviter de bloquer l'utilisateur
      }
      setError(geoError);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!shouldWatch || !enabled || !('geolocation' in navigator)) {
      return;
    }

    setLoading(true);

    // Obtenir la position actuelle immédiatement
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      geolocationOptions
    );

    // Commencer à surveiller la position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      geolocationOptions
    );

    return () => {
      clearWatch();
    };
  }, [shouldWatch, enabled, handleSuccess, handleError, geolocationOptions, clearWatch]);

  return {
    position,
    error,
    loading,
    enabled,
    requestPermission,
    clearWatch
  };
}

// Fonction utilitaire pour calculer la distance entre deux points (en km)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Fonction pour formater la distance
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
}
