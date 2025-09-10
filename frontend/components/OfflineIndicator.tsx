'use client';

import { useOfflineStatus } from '@/frontend/hooks/useOfflineStatus';

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOfflineStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <div className={`fixed top-16 left-0 right-0 z-40 px-4 py-2 text-center text-sm font-medium transition-colors ${
      isOnline 
        ? 'bg-green-600 text-white' 
        : 'bg-red-600 text-white'
    }`}>
      {isOnline ? (
        <>
          <span className="inline-block w-2 h-2 bg-green-300 rounded-full mr-2"></span>
          Connexion rétablie - Les données sont synchronisées
        </>
      ) : (
        <>
          <span className="inline-block w-2 h-2 bg-red-300 rounded-full mr-2 animate-pulse"></span>
          Mode hors ligne - Certaines fonctionnalités sont limitées
        </>
      )}
    </div>
  );
}
