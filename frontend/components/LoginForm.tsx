'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/frontend/hooks/useAuth';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';

export function LoginForm() {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(formData.email, formData.password);
      // Redirect to events page after successful login
      window.location.href = '/events';
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image 
              src="/teamup_logo.png" 
              alt="TeamUp Logo" 
              width={48} 
              height={48} 
              className="w-12 h-12"
            />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{color: '#2C3E50'}}>
            Connexion
          </h2>
          <p style={{color: '#2C3E50', opacity: 0.7}}>
            Connectez-vous à votre compte TeamUp
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{color: '#2C3E50'}}>
              Adresse email
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="votre@email.com"
              required
              className="w-full"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{color: '#2C3E50'}}>
              Mot de passe
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="••••••••"
              required
              className="w-full"
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link 
              href="/register" 
              className="text-[#00A8CC] hover:text-[#0092b3] hover:scale-105 transition-all duration-200 font-medium"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-[#00A8CC] hover:bg-[#0092b3] text-white py-3 px-4 rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connexion...
              </div>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white" style={{color: '#2C3E50', opacity: 0.6}}>ou</span>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="mb-4" style={{color: '#2C3E50', opacity: 0.7}}>
            Pas encore de compte ?
          </p>
          <Link href="/register">
            <Button
              variant="outline"
              className="w-full border-[#00A8CC] text-[#00A8CC] hover:bg-[#00A8CC] hover:text-gray-800"
            >
              Créer un compte
            </Button>
          </Link>
        </div>

        {/* Additional Features */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-[#00D9A3]/10 rounded-full flex items-center justify-center mb-2">
                <span className="text-[#00D9A3] text-sm">⚽</span>
              </div>
              <span className="text-xs text-gray-600">Événements</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mb-2">
                <span className="text-[#FF6B35] text-sm">👥</span>
              </div>
              <span className="text-xs text-gray-600">Communauté</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-[#00A8CC]/10 rounded-full flex items-center justify-center mb-2">
                <span className="text-[#00A8CC] text-sm">🏆</span>
              </div>
              <span className="text-xs text-gray-600">Performance</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
