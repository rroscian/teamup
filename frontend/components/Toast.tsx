'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'success', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // Animation duration
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  return (
    <div
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50
        min-w-96 max-w-md mx-auto p-4 border rounded-xl shadow-lg
        transition-all duration-300 ease-in-out
        ${getColors()}
        ${isLeaving ? 'opacity-0 -translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3">
            <p className="font-medium text-sm">{message}</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
