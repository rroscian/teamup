'use client';

import React from 'react';
import Link from 'next/link';
import { Download, Smartphone, ArrowLeft, Chrome, Plus, Share } from 'lucide-react';
import Footer from '@/frontend/components/Footer';

export default function AppMobile() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-[#00A8CC] hover:text-[#0092b3] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour à l'accueil</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Smartphone className="w-12 h-12 text-[#00A8CC]" />
            <h1 className="text-4xl font-bold text-[#2C3E50]">Application Mobile TeamUp</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Emportez TeamUp partout avec vous ! Installez notre application web progressive (PWA) 
            pour une expérience native sur votre téléphone.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-6 text-center">Pourquoi installer l'app TeamUp ?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-[#00A8CC]/10 p-3 rounded-lg">
                <Download className="w-6 h-6 text-[#00A8CC]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2C3E50] mb-2">Accès rapide</h3>
                <p className="text-gray-600">Ouvrez TeamUp directement depuis votre écran d'accueil, comme une vraie app</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-[#FF6B35]/10 p-3 rounded-lg">
                <Smartphone className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2C3E50] mb-2">Mode hors ligne</h3>
                <p className="text-gray-600">Consultez vos événements même sans connexion internet</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-[#00D9A3]/10 p-3 rounded-lg">
                <Chrome className="w-6 h-6 text-[#00D9A3]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2C3E50] mb-2">Interface optimisée</h3>
                <p className="text-gray-600">Téléchargez TeamUp sur votre mobile pour une expérience optimisée !</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-[#FF6B35]/10 p-3 rounded-lg">
                <Plus className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2C3E50] mb-2">Notifications push</h3>
                <p className="text-gray-600">Restez informé des nouveaux événements et messages</p>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="space-y-12">
          {/* Android Chrome */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <Chrome className="w-8 h-8 text-[#00A8CC]" />
              <h2 className="text-2xl font-bold text-[#2C3E50]">Sur Android (Chrome)</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#00A8CC] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                  <p className="text-gray-700">Ouvrez TeamUp dans Chrome sur votre téléphone</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-[#00A8CC] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-gray-700">Appuyez sur le menu (3 points) en haut à droite</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-[#00A8CC] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-gray-700">Sélectionnez "Installer l'application" ou "Ajouter à l'écran d'accueil"</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-[#00A8CC] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                  <p className="text-gray-700">Confirmez l'installation et retrouvez TeamUp sur votre écran d'accueil</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#00A8CC]/10 to-[#FF6B35]/10 rounded-xl p-6 text-center">
                <Smartphone className="w-24 h-24 mx-auto mb-4 text-[#00A8CC]" />
                <p className="text-gray-600">L'icône TeamUp apparaîtra sur votre écran d'accueil</p>
              </div>
            </div>
          </div>

          {/* iOS Safari */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <Smartphone className="w-8 h-8 text-[#00A8CC]" />
              <h2 className="text-2xl font-bold text-[#2C3E50]">Sur iPhone/iPad (Safari)</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#00A8CC] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                  <p className="text-gray-700">Ouvrez TeamUp dans Safari sur votre iPhone/iPad</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-[#00A8CC] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-700">Appuyez sur le bouton partage</p>
                    <Share className="w-4 h-4 text-[#00A8CC]" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-[#00A8CC] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-gray-700">Faites défiler et sélectionnez "Sur l'écran d'accueil"</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-[#00A8CC] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                  <p className="text-gray-700">Appuyez sur "Ajouter" pour installer TeamUp</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#00A8CC]/10 to-[#FF6B35]/10 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Share className="w-8 h-8 text-[#00A8CC]" />
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600">Utilisez le bouton partage puis "Sur l'écran d'accueil"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-[#00A8CC]/5 rounded-2xl p-8 mt-12 text-center">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Besoin d'aide ?</h2>
          <p className="text-gray-600 mb-6">
            Si vous rencontrez des difficultés lors de l'installation, n'hésitez pas à nous contacter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/events" 
              className="bg-[#00A8CC] text-white px-6 py-3 rounded-xl hover:bg-[#0092b3] transition-colors font-medium"
            >
              Utiliser la version web
            </Link>
            <Link 
              href="/" 
              className="bg-white text-[#00A8CC] border border-[#00A8CC] px-6 py-3 rounded-xl hover:bg-[#00A8CC] hover:text-white transition-colors font-medium"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
