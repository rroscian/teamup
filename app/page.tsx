'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Users, MapPin, TrendingUp, Shield, Heart, ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl font-bold text-[#2C3E50] mb-6 leading-tight">
                Trouvez le sport{' '}
                <span className="text-[#00A8CC] block mt-2">près de chez vous</span>
              </h1>
              <p className="text-xl text-[#2C3E50]/70 mb-10 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                Rejoignez la première communauté qui transforme{' '}
                <span className="whitespace-nowrap">chaque quartier</span> en terrain de jeu.
                <span className="block mt-3 font-medium text-[#2C3E50]/80">
                  Organisez, participez, rencontrez :{' '}
                  <span className="whitespace-nowrap">le sport n&apos;a jamais été</span> aussi accessible.
                </span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <button 
                  onClick={() => router.push('/register')}
                  className="bg-[#00A8CC] hover:bg-[#0092b3] text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg flex items-center justify-center group"
                >
                  Rejoindre la communauté
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => router.push('/events')}
                  className="bg-white text-[#00A8CC] border-2 border-[#00A8CC] px-8 py-4 rounded-xl hover:bg-[#00A8CC] hover:text-white hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg"
                >
                  Explorer les événements
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-[#2C3E50]/70">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00D9A3]" />
                  <span className="font-medium">100% gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00D9A3]" />
                  <span className="font-medium">Inscription en 2 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00D9A3]" />
                  <span className="font-medium">Communauté vérifiée</span>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#00A8CC]/10 to-[#FF6B35]/10 rounded-2xl overflow-hidden h-96">
                <Image 
                  src="https://images.unsplash.com/photo-1569074187119-c87815b476da?w=600&h=400&fit=crop&crop=center" 
                  alt="Skateur en pleine routine"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A8CC]/20 to-[#FF6B35]/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#00A8CC] mb-2">10K+</div>
              <div className="text-[#2C3E50]/70">Sportifs actifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#00A8CC] mb-2">500+</div>
              <div className="text-[#2C3E50]/70">Événements par mois</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#00A8CC] mb-2">50+</div>
              <div className="text-[#2C3E50]/70">Terrains partenaires</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#00A8CC] mb-2">15+</div>
              <div className="text-[#2C3E50]/70">Sports disponibles</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2C3E50] mb-6 leading-tight">
              Ce qui nous rend{' '}
              <span className="text-[#00A8CC] block mt-2">différents</span>
            </h2>
            <p className="text-xl text-[#2C3E50]/70 max-w-3xl mx-auto leading-relaxed">
              Découvrez les valeurs qui font de TeamUp{' '}
              <span className="whitespace-nowrap">bien plus qu&apos;une</span> simple plateforme :
              <span className="block mt-3 font-medium text-[#2C3E50]/80">
                une communauté <span className="whitespace-nowrap">bienveillante et engagée</span>.
              </span>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
              <div className="bg-gradient-to-br from-[#00D9A3]/10 to-[#00A8CC]/10 rounded-xl p-6 mb-6">
                <div className="bg-gradient-to-br from-[#00D9A3] to-[#00A8CC] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-shadow">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50] mb-4 text-center">
                L&apos;esprit d&apos;équipe{' '}<span className="whitespace-nowrap">avant tout</span>
              </h3>
              <p className="text-[#2C3E50]/70 leading-relaxed text-center">
                Chaque match, chaque entraînement devient{' '}
                <span className="whitespace-nowrap">une occasion de tisser</span> des liens durables.
                <span className="block mt-3 font-medium text-[#00A8CC]">
                  Parce que <span className="whitespace-nowrap">le sport rassemble</span>.
                </span>
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
              <div className="bg-gradient-to-br from-[#FF6B35]/10 to-[#00A8CC]/10 rounded-xl p-6 mb-6">
                <div className="bg-gradient-to-br from-[#FF6B35] to-[#00A8CC] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-shadow">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50] mb-4 text-center">
                Votre sécurité,{' '}<span className="whitespace-nowrap">notre priorité</span>
              </h3>
              <p className="text-[#2C3E50]/70 leading-relaxed text-center">
                Données hébergées en France,{' '}
                <span className="whitespace-nowrap">profils vérifiés</span>, environnement respectueux.
                <span className="block mt-3 font-medium text-[#FF6B35]">
                  Jouez en <span className="whitespace-nowrap">toute sérénité</span>.
                </span>
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
              <div className="bg-gradient-to-br from-[#00A8CC]/10 to-[#00D9A3]/10 rounded-xl p-6 mb-6">
                <div className="bg-gradient-to-br from-[#00A8CC] to-[#00D9A3] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-shadow">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50] mb-4 text-center">
                Innovation au{' '}<span className="whitespace-nowrap">service du sport</span>
              </h3>
              <p className="text-[#2C3E50]/70 leading-relaxed text-center">
                Une technologie simple,{' '}
                <span className="whitespace-nowrap">accessible et respectueuse</span> de l&apos;environnement.
                <span className="block mt-3 font-medium text-[#00D9A3]">
                  Pour que chacun{' '}<span className="whitespace-nowrap">trouve sa place</span>.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">
              Simple, intuitif et complet
            </h2>
            <p className="text-xl text-[#2C3E50]/70 max-w-3xl mx-auto">
              Tout ce dont vous avez besoin pour organiser et participer à des événements sportifs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-[#00A8CC]/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#00A8CC]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">Création d&apos;événements en 3 clics</h3>
                  <p className="text-[#2C3E50]/70">
                    Organisez vos matchs, sessions et tournois facilement. 
                    Invitez vos amis ou ouvrez à la communauté.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-[#FF6B35]/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#FF6B35]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">Réservation de terrains intégrée</h3>
                  <p className="text-[#2C3E50]/70">
                    Trouvez et réservez des terrains disponibles près de chez vous. 
                    Partagez automatiquement les frais entre participants.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-[#00D9A3]/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#00D9A3]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">Gestion d&apos;équipes simplifiée</h3>
                  <p className="text-[#2C3E50]/70">
                    Créez vos équipes, communiquez via la messagerie intégrée 
                    et suivez les disponibilités de chacun.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-[#00A8CC]/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#00A8CC]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">Suivi de vos performances</h3>
                  <p className="text-[#2C3E50]/70">
                    Consultez vos statistiques, progressez et comparez-vous 
                    avec votre communauté sportive.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full max-w-[600px] mx-auto">
                <div className="bg-gradient-to-br from-[#00A8CC]/10 to-[#FF6B35]/10 rounded-2xl overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=center" 
                    alt="Sportifs en action - Communauté sportive dynamique"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-[#00D9A3] text-white px-6 py-3 rounded-xl shadow-lg">
                  <span className="font-medium">+15 000 utilisateurs actifs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">
              Commencez en quelques minutes
            </h2>
            <p className="text-xl text-[#2C3E50]/70 max-w-3xl mx-auto">
              Rejoignez la communauté TeamUp et vivez votre passion du sport
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#00A8CC] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">Créez votre profil sportif</h3>
              <p className="text-[#2C3E50]/70">
                Renseignez vos sports favoris, votre niveau et vos disponibilités en quelques clics
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#00A8CC] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">Rejoignez ou créez un événement</h3>
              <p className="text-[#2C3E50]/70">
                Trouvez des activités près de chez vous ou organisez vos propres sessions
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#00A8CC] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">Jouez et progressez ensemble</h3>
              <p className="text-[#2C3E50]/70">
                Rencontrez de nouveaux partenaires et suivez votre évolution sportive
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#00A8CC] to-[#00A8CC]/80">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à rejoindre la communauté TeamUp ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Inscription gratuite • Sans engagement • Commencez dès maintenant
          </p>
          <button 
            onClick={() => router.push('/register')}
            className="bg-white text-[#00A8CC] px-8 py-4 rounded-xl hover:shadow-2xl hover:scale-110 hover:bg-gray-50 transition-all duration-300 font-medium text-lg inline-flex items-center group"
          >
            Créer mon compte gratuitement
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="mt-8 flex items-center justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>100% gratuit</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Données sécurisées</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#2C3E50] text-gray-300">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
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
                <li><Link href="#features" className="hover:text-[#00A8CC] hover:scale-105 transition-all duration-200">Fonctionnalités</Link></li>
                <li><Link href="#" className="hover:text-[#00A8CC] hover:scale-105 transition-all duration-200">Tarifs</Link></li>
                <li><Link href="#" className="hover:text-[#00A8CC] hover:scale-105 transition-all duration-200">Application mobile</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-[#00A8CC] hover:scale-105 transition-all duration-200">Centre d&apos;aide</Link></li>
                <li><Link href="#" className="hover:text-[#00A8CC] hover:scale-105 transition-all duration-200">Contact</Link></li>
                <li><Link href="#" className="hover:text-[#00A8CC] hover:scale-105 transition-all duration-200">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Légal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-[#00A8CC] hover:scale-105 transition-all duration-200">Mentions légales</Link></li>
                <li><Link href="#" className="hover:text-[#00A8CC] hover:scale-105 transition-all duration-200">CGU</Link></li>
                <li><Link href="#" className="hover:text-[#00A8CC] hover:scale-105 transition-all duration-200">Politique de confidentialité</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 TeamUp. Tous droits réservés. Fait avec ❤️ pour les sportifs
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
