'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export function TopBar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm">
      <nav className="container mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/teamup_logo.png" 
              alt="TeamUp Logo" 
              width={32} 
              height={32} 
              className="w-8 h-8"
            />
            <span className="text-2xl font-bold text-[#2C3E50]">TeamUp</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <Link href="/events" className="text-[#2C3E50]/70 hover:text-[#00A8CC] hover:scale-105 transition-all duration-200 font-medium">
              Événements
            </Link>
            <Link href="/login" className="text-[#2C3E50]/70 hover:text-[#00A8CC] hover:scale-105 transition-all duration-200 font-medium">
              Connexion
            </Link>
            <Link href="/register" className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white px-8 py-2.5 rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium ml-2">
              Rejoignez-nous!
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-[#00A8CC]/10 hover:scale-110 transition-all duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t">
            <div className="flex flex-col p-6 space-y-4">
              <Link 
                href="/events" 
                className="text-[#2C3E50]/70 hover:text-[#00A8CC] hover:bg-[#00A8CC]/5 hover:scale-105 transition-all duration-200 py-2 px-2 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Événements
              </Link>
              <Link 
                href="/login" 
                className="text-[#2C3E50]/70 hover:text-[#00A8CC] hover:bg-[#00A8CC]/5 hover:scale-105 transition-all duration-200 py-2 px-2 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
              <Link 
                href="/register" 
                className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white px-6 py-3 rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-200 text-center font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Rejoignez-nous!
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
