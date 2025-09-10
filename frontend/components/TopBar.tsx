'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { Menu, X, User, ChevronDown, Settings, LogOut, MessageSquare } from 'lucide-react';

export function TopBar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { user, isAuthenticated, loading, logout, checkAuthStatus } = useAuth();

  // Debug and stable avatar management
  const currentAvatarUrl = user?.profile?.avatar || user?.avatar;
  const [previousAvatarUrl, setPreviousAvatarUrl] = useState<string | undefined>();
  
  useEffect(() => {
    if (currentAvatarUrl !== previousAvatarUrl && currentAvatarUrl) {
      setImageLoaded(false);
      setImageError(false);
      setPreviousAvatarUrl(currentAvatarUrl);
    }
  }, [currentAvatarUrl, previousAvatarUrl, user?.name, user?.updatedAt]);

  // Force auth check only when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      checkAuthStatus();
    }
  }, []);

  // Listen for profile update events
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Don't reset image states - let the URL change detection handle it
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  }, []);


  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/');
  };

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
            
            {loading ? (
              /* Loading state - show nothing to prevent flicker */
              <div className="w-32"></div>
            ) : isAuthenticated && user ? (
              /* User Menu */
              <>
                <Link href="/messages" className="text-[#2C3E50]/70 hover:text-[#00A8CC] hover:scale-105 transition-all duration-200 font-medium">
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-[#2C3E50]/70 hover:text-[#00A8CC] hover:scale-105 transition-all duration-200 font-medium"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#00A8CC]/10 border-2 border-[#00A8CC]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {(() => {
                        const avatarUrl = user?.profile?.avatar || user?.avatar;
                        const hasValidAvatar = avatarUrl && avatarUrl.trim() !== '' && !imageError;
                        
                        if (hasValidAvatar) {
                          return (
                            <>
                              {!imageLoaded && (
                                <div className="absolute w-8 h-8 bg-[#00A8CC]/10 rounded-full animate-pulse" />
                              )}
                              <Image
                                src={avatarUrl}
                                alt="Photo de profil"
                                width={32}
                                height={32}
                                key={`topbar-${user?.id}-${avatarUrl}-${user?.updatedAt || Date.now()}`}
                                className={`w-full h-full object-cover transition-opacity duration-200 ${
                                  imageLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                                priority
                                unoptimized
                                onLoad={() => {
                                  setImageLoaded(true);
                                }}
                                onError={() => {
                                  setImageError(true);
                                }}
                              />
                            </>
                          );
                        } else {
                          return <User className="w-4 h-4 text-[#00A8CC]" />;
                        }
                      })()}
                    </div>
                    <span className="text-sm font-medium truncate max-w-32">{user.name || user.username}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-[#2C3E50]/70 hover:text-[#00A8CC] hover:bg-[#00A8CC]/5 transition-all duration-200"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Mon Profil</span>
                    </Link>
                    <Link
                      href="/messages"
                      className="flex items-center space-x-2 px-4 py-2 text-[#2C3E50]/70 hover:text-[#00A8CC] hover:bg-[#00A8CC]/5 transition-all duration-200"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Messagerie</span>
                    </Link>
                    {(user.username === 'admin' || user.name === 'admin') && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 px-4 py-2 text-[#2C3E50]/70 hover:text-[#00A8CC] hover:bg-[#00A8CC]/5 transition-all duration-200"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Administration</span>
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                )}
                </div>
              </>
            ) : (
              /* Login/Register Links */
              <>
                <Link href="/login" className="text-[#2C3E50]/70 hover:text-[#00A8CC] hover:scale-105 transition-all duration-200 font-medium">
                  Connexion
                </Link>
                <Link href="/register" className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white px-8 py-2.5 rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium ml-2">
                  Rejoignez-nous!
                </Link>
              </>
            )}
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
              {!loading && (
                <>
                  {isAuthenticated && user ? (
                    <>
                      <Link 
                        href="/profile" 
                        className="text-[#2C3E50]/70 hover:text-[#00A8CC] hover:bg-[#00A8CC]/5 hover:scale-105 transition-all duration-200 py-2 px-2 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mon Profil
                      </Link>
                      <Link 
                        href="/messages" 
                        className="text-[#2C3E50]/70 hover:text-[#00A8CC] hover:bg-[#00A8CC]/5 hover:scale-105 transition-all duration-200 py-2 px-2 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Messagerie
                      </Link>
                      {(user.username === 'admin' || user.name === 'admin') && (
                        <Link 
                          href="/admin" 
                          className="text-[#2C3E50]/70 hover:text-[#00A8CC] hover:bg-[#00A8CC]/5 hover:scale-105 transition-all duration-200 py-2 px-2 rounded-md"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Administration
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="text-left text-red-600 hover:bg-red-50 hover:scale-105 transition-all duration-200 py-2 px-2 rounded-md"
                      >
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
