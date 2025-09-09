'use client';

import React, { useState } from 'react';
import { MapPin, AlertCircle, CheckCircle } from 'lucide-react';

interface GeolocationSettingsProps {
  isEnabled: boolean;
  lastPosition?: { lat: number; lng: number; timestamp: string };
  onToggle: (enabled: boolean) => Promise<void>;
  isLoading?: boolean;
}

export default function GeolocationSettings({ 
  isEnabled, 
  lastPosition, 
  onToggle, 
  isLoading = false 
}: GeolocationSettingsProps) {
  const [localEnabled, setLocalEnabled] = useState(isEnabled);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleToggle = async (newValue: boolean) => {
    if (!newValue) {
      // Si on désactive, pas besoin de demander la permission
      setLocalEnabled(newValue);
      await onToggle(newValue);
      return;
    }
    
    if (newValue) {
      // Si on active la géolocalisation, utiliser watchPosition pour éviter les timeouts
      setIsRequesting(true);
      
      if ('geolocation' in navigator) {
        try {
          // D'abord essayer de demander juste la permission avec watchPosition
          let watchId: number | null = null;
          let permissionGranted = false;
          
          const permissionPromise = new Promise<GeolocationPosition>((resolve, reject) => {
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
                reject(error);
              },
              {
                enableHighAccuracy: false, // Commence par une précision faible pour plus de rapidité
                timeout: 15000, // Timeout plus court pour la première tentative
                maximumAge: 600000 // Accepter une position de 10 minutes
              }
            );
          });

          // Donner un feedback immédiat
          setTimeout(() => {
            if (!permissionGranted && isRequesting) {
              console.log('Demande d\'autorisation en cours...');
            }
          }, 1000);
          
          await permissionPromise;
          
          // Permission accordée
          setLocalEnabled(newValue);
          await onToggle(newValue);
        } catch (error) {
          // Permission refusée ou erreur
          console.error('Erreur lors de la capture de la position:', error);
          const geolocationError = error as GeolocationPositionError;
          
          let errorMessage = 'Erreur de géolocalisation : ';
          switch (geolocationError?.code) {
            case 1: // PERMISSION_DENIED
              errorMessage += 'Permission refusée. Veuillez autoriser l\'accès à votre position dans les paramètres de votre navigateur.';
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMessage += 'Position indisponible. Vérifiez votre connexion internet et que le GPS est activé.';
              break;
            case 3: // TIMEOUT
              errorMessage += 'Délai dépassé. La géolocalisation sera activée, mais la position sera obtenue en arrière-plan.';
              // Pour timeout, on active quand même la géolocalisation
              setLocalEnabled(newValue);
              await onToggle(newValue);
              return;
            default:
              errorMessage += 'Erreur inconnue. Vérifiez vos paramètres de confidentialité.';
          }
          
          alert(errorMessage);
          
          // Ne pas throw pour timeout, on continue l'activation
          if (geolocationError?.code !== 3) {
            throw error;
          }
        } finally {
          setIsRequesting(false);
        }
      } else {
        alert('La géolocalisation n\'est pas supportée par votre navigateur.');
        setIsRequesting(false);
        throw new Error('Geolocation not supported');
      }
    }
  };

  const formatLastPosition = () => {
    if (!lastPosition) return null;
    
    const date = new Date(lastPosition.timestamp);
    const formattedDate = date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return (
      <div className="mt-3 text-sm text-gray-600">
        <p>Dernière position connue :</p>
        <p className="font-mono text-xs mt-1">
          {lastPosition.lat.toFixed(6)}°, {lastPosition.lng.toFixed(6)}°
        </p>
        <p className="text-xs mt-1">Mise à jour : {formattedDate}</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <MapPin className="h-6 w-6 text-[#00A8CC]" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">Géolocalisation</h3>
          <p className="mt-1 text-sm text-gray-600">
            Activez la géolocalisation pour voir les événements proches de vous.
          </p>
          
          <div className="mt-4">
            <button
              onClick={() => handleToggle(!localEnabled)}
              disabled={isLoading || isRequesting}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#00A8CC] focus:ring-offset-2
                ${localEnabled ? 'bg-[#00A8CC]' : 'bg-gray-200'}
                ${isLoading || isRequesting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className="sr-only">Activer la géolocalisation</span>
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                  transition duration-200 ease-in-out
                  ${localEnabled ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {localEnabled ? 'Activée' : 'Désactivée'}
            </span>
            {isRequesting && (
              <span className="ml-2 text-xs text-gray-500">
                Demande de permission...
              </span>
            )}
          </div>
          
          {localEnabled && lastPosition && formatLastPosition()}
          
          <div className="mt-4">
            {localEnabled ? (
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p>Votre position est utilisée pour :</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Afficher les événements proches de vous</li>
                    <li>Calculer les distances jusqu\'aux événements</li>
                    <li>Suggérer des événements dans votre zone</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  La géolocalisation est désactivée. Vous ne verrez pas les distances 
                  jusqu\'aux événements et les suggestions basées sur votre position.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
