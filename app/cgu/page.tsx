'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/frontend/components/Footer';

export default function CGU() {
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
        <h1 className="text-4xl font-bold text-[#2C3E50] mb-8">Conditions Générales d'Utilisation</h1>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-8">
          {/* Préambule */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Préambule</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'utilisation de la plateforme TeamUp (ci-après "la Plateforme") exploitée par la société TeamUp.
              </p>
              <p>
                L'utilisation de la Plateforme implique l'acceptation pleine et entière des présentes CGU par l'utilisateur.
              </p>
            </div>
          </section>

          {/* Article 1 - Définitions */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Article 1 - Définitions</h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>Plateforme :</strong> Le site web et l'application mobile TeamUp accessible à l'adresse teamup.fr</p>
              <p><strong>Utilisateur :</strong> Toute personne physique utilisant la Plateforme</p>
              <p><strong>Organisateur :</strong> Utilisateur créant et gérant des événements sportifs</p>
              <p><strong>Participant :</strong> Utilisateur s'inscrivant à des événements sportifs</p>
              <p><strong>Événement :</strong> Activité sportive organisée via la Plateforme</p>
              <p><strong>Contenu :</strong> Toute information, donnée, texte, photo ou autre élément publié sur la Plateforme</p>
            </div>
          </section>

          {/* Article 2 - Objet */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Article 2 - Objet de la Plateforme</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                TeamUp est une plateforme communautaire permettant aux utilisateurs de :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Créer et organiser des événements sportifs</li>
                <li>Participer à des événements sportifs</li>
                <li>Communiquer avec d'autres utilisateurs</li>
                <li>Gérer leur profil sportif</li>
                <li>Accéder à des fonctionnalités communautaires</li>
              </ul>
              <p>
                La Plateforme met en relation des utilisateurs et n'organise pas elle-même d'événements sportifs.
              </p>
            </div>
          </section>

          {/* Article 3 - Inscription */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Article 3 - Inscription et Compte Utilisateur</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                L'inscription sur la Plateforme est gratuite et ouverte à toute personne physique majeure ou mineure avec autorisation parentale.
              </p>
              <p>
                L'utilisateur s'engage à fournir des informations exactes, complètes et à jour lors de son inscription.
              </p>
              <p>
                L'utilisateur est responsable de la confidentialité de ses identifiants de connexion et de toutes les activités effectuées avec son compte.
              </p>
              <p>
                En cas d'utilisation frauduleuse ou non conforme aux présentes CGU, TeamUp se réserve le droit de suspendre ou supprimer le compte utilisateur.
              </p>
            </div>
          </section>

          {/* Article 4 - Utilisation */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Article 4 - Utilisation de la Plateforme</h2>
            <div className="text-gray-700 space-y-4">
              <p><strong>L'utilisateur s'engage à :</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Utiliser la Plateforme conformément aux présentes CGU</li>
                <li>Respecter les autres utilisateurs</li>
                <li>Ne pas publier de contenu illégal, offensant, diffamatoire ou portant atteinte aux droits de tiers</li>
                <li>Ne pas utiliser la Plateforme à des fins commerciales non autorisées</li>
                <li>Respecter les règles de sécurité et d'hygiène lors des événements sportifs</li>
              </ul>
              
              <p><strong>Il est strictement interdit :</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>D'usurper l'identité d'autrui</li>
                <li>De harceler ou intimider d'autres utilisateurs</li>
                <li>De diffuser des virus ou autres codes malveillants</li>
                <li>De tenter de contourner les mesures de sécurité</li>
                <li>D'utiliser des robots ou autres moyens automatisés</li>
              </ul>
            </div>
          </section>

          {/* Article 5 - Événements */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Article 5 - Organisation et Participation aux Événements</h2>
            <div className="text-gray-700 space-y-4">
              <p><strong>Responsabilité des Organisateurs :</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fournir des informations exactes sur l'événement</li>
                <li>Respecter les engagements pris envers les participants</li>
                <li>Assurer la sécurité des participants dans la mesure de leurs moyens</li>
                <li>Gérer les inscriptions et annulations de manière équitable</li>
              </ul>
              
              <p><strong>Responsabilité des Participants :</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>S'assurer de leur aptitude physique à participer</li>
                <li>Respecter les consignes de l'organisateur</li>
                <li>Prévenir en cas d'annulation de leur participation</li>
                <li>Adopter un comportement respectueux</li>
              </ul>
              
              <p>
                TeamUp n'est pas responsable du déroulement des événements, de leur annulation ou des incidents pouvant survenir.
              </p>
            </div>
          </section>

          {/* Article 6 - Contenu */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Article 6 - Contenu Utilisateur</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                L'utilisateur conserve tous les droits sur le contenu qu'il publie mais accorde à TeamUp une licence non exclusive pour utiliser, reproduire et diffuser ce contenu dans le cadre de la Plateforme.
              </p>
              <p>
                TeamUp se réserve le droit de modérer, supprimer ou modifier tout contenu non conforme aux présentes CGU ou à la législation en vigueur.
              </p>
              <p>
                L'utilisateur est seul responsable du contenu qu'il publie et garantit qu'il ne porte pas atteinte aux droits de tiers.
              </p>
            </div>
          </section>

          {/* Article 7 - Données personnelles */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Article 7 - Protection des Données Personnelles</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                TeamUp s'engage à protéger les données personnelles de ses utilisateurs conformément au RGPD et à la loi "Informatique et Libertés".
              </p>
              <p>
                Pour plus d'informations sur le traitement de vos données personnelles, consultez notre <Link href="/politique-confidentialite" className="text-[#00A8CC] hover:underline">Politique de Confidentialité</Link>.
              </p>
            </div>
          </section>

          {/* Article 8 - Limitation de responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Article 8 - Limitation de Responsabilité</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                TeamUp met tout en œuvre pour assurer la disponibilité de la Plateforme mais ne peut garantir un fonctionnement sans interruption.
              </p>
              <p>
                TeamUp ne peut être tenue responsable :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Des dommages résultant de l'utilisation de la Plateforme</li>
                <li>Du comportement des utilisateurs entre eux</li>
                <li>De la perte de données due à des dysfonctionnements techniques</li>
                <li>Des préjudices liés aux événements organisés via la Plateforme</li>
              </ul>
            </div>
          </section>

          {/* Article 9 - Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Article 9 - Propriété Intellectuelle</h2>
            <p className="text-gray-700">
              Tous les éléments de la Plateforme (design, logo, textes, etc.) sont protégés par le droit de la propriété intellectuelle. 
              Toute reproduction non autorisée est interdite.
            </p>
          </section>

          {/* Article 10 - Suspension et résiliation */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Article 10 - Suspension et Résiliation</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                L'utilisateur peut supprimer son compte à tout moment depuis son profil.
              </p>
              <p>
                TeamUp se réserve le droit de suspendre ou résilier l'accès d'un utilisateur en cas de violation des présentes CGU, 
                avec ou sans préavis selon la gravité du manquement.
              </p>
            </div>
          </section>

          {/* Article 11 - Modification des CGU */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Article 11 - Modification des CGU</h2>
            <p className="text-gray-700">
              TeamUp se réserve le droit de modifier les présentes CGU à tout moment. 
              Les utilisateurs seront informés des modifications par email ou notification sur la Plateforme.
              La poursuite de l'utilisation après modification vaut acceptation des nouvelles conditions.
            </p>
          </section>

          {/* Article 12 - Droit applicable */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Article 12 - Droit Applicable et Juridiction</h2>
            <p className="text-gray-700">
              Les présentes CGU sont soumises au droit français. 
              Tout litige sera porté devant les tribunaux compétents français.
              Avant tout recours judiciaire, une médiation amiable sera privilégiée.
            </p>
          </section>

          {/* Date d'entrée en vigueur */}
          <section className="border-t pt-8">
            <p className="text-gray-500 text-sm">
              <strong>Date d'entrée en vigueur :</strong> 11 septembre 2025<br />
              <strong>Dernière mise à jour :</strong> 11 septembre 2025
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
