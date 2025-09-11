'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="py-12 px-6 bg-[#2C3E50] text-gray-300">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image 
                src="/teamup_logo.png" 
                alt="TeamUp Logo" 
                width={32} 
                height={32} 
                className="w-8 h-8"
              />
              <span className="text-2xl font-bold text-white">TeamUp</span>
            </div>
            <p className="text-gray-400">
              La plateforme qui réunit les sportifs de votre quartier
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Produit</h4>
            <ul className="space-y-2">
              <li><Link href="/#features" className="hover:text-[#00A8CC] hover:scale-105 transition-all duration-200">Fonctionnalités</Link></li>
              <li><Link href="/app-mobile" className="hover:text-[#00A8CC] hover:scale-105 transition-all duration-200">Application mobile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Légal</h4>
            <ul className="space-y-2">
              <li><Link href="/mentions-legales" className="hover:text-[#00A8CC] hover:scale-105 transition-all duration-200">Mentions légales</Link></li>
              <li><Link href="/cgu" className="hover:text-[#00A8CC] hover:scale-105 transition-all duration-200">CGU</Link></li>
              <li><Link href="/politique-confidentialite" className="hover:text-[#00A8CC] hover:scale-105 transition-all duration-200">Politique de confidentialité</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 TeamUp. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
