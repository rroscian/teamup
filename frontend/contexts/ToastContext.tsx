'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '@/frontend/components/Toast';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'warning', duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success', duration = 5000) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { id, message, type, duration };
    
    setToasts(prevToasts => [...prevToasts, newToast]);
  }, []);

  const showSuccess = useCallback((message: string, duration = 5000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration = 5000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration = 5000) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning }}>
      {children}
      
      {/* Render toasts - only show the most recent one */}
      {toasts.length > 0 && (
        <Toast
          key={toasts[toasts.length - 1].id}
          message={toasts[toasts.length - 1].message}
          type={toasts[toasts.length - 1].type}
          duration={toasts[toasts.length - 1].duration}
          onClose={() => removeToast(toasts[toasts.length - 1].id)}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
