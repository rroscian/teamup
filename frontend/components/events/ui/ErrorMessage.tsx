'use client';

import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
  message: string;
  title?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ 
  message, 
  title = "Une erreur s'est produite", 
  onDismiss, 
  onRetry,
  className = '' 
}: ErrorMessageProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            {title}
          </h3>
          <p className="text-sm text-red-700 mb-4">
            {message}
          </p>
          
          {(onRetry || onDismiss) && (
            <div className="flex gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm bg-red-100 text-red-800 px-3 py-2 rounded-md hover:bg-red-200 transition-colors"
                >
                  Réessayer
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Ignorer
                </button>
              )}
            </div>
          )}
        </div>
        
        {onDismiss && (
          <div className="ml-auto flex-shrink-0">
            <button
              onClick={onDismiss}
              className="bg-red-50 rounded-md p-1.5 text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <XMarkIcon className="h-5 w-5" />
              <span className="sr-only">Fermer</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
