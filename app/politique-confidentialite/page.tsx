'use client';

import { ArrowLeft, Shield, Eye, Lock, Users, Database, Settings } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/frontend/components/Footer';

export default function PolitiqueConfidentialite() {
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-[#00A8CC]" />
            <h1 className="text-4xl font-bold text-[#2C3E50]">Politique de Confidentialité</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nous nous engageons à protéger vos données personnelles et votre vie privée conformément au RGPD.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-8">
          {/* Préambule */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">1. Introduction</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                La présente Politique de Confidentialité décrit comment TeamUp collecte, utilise, partage et protège vos données personnelles lors de l'utilisation de notre plateforme.
              </p>
              <p>
                Cette politique s'applique à tous les services fournis par TeamUp et respecte les dispositions du Règlement Général sur la Protection des Données (RGPD) et de la loi "Informatique et Libertés".
              </p>
            </div>
          </section>

          {/* Responsable du traitement */}
          <section className="bg-blue-50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Database className="w-6 h-6 text-[#00A8CC] mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">2. Responsable du Traitement</h2>
                <div className="text-gray-700 space-y-2">
                  <p><strong>Identité :</strong> TeamUp</p>
                  <p><strong>Adresse :</strong> Fictive</p>
                  <p><strong>Contact :</strong> dpo@teamup.fr</p>
                  <p><strong>Délégué à la Protection des Données :</strong> Non désigné</p>
                </div>
              </div>
            </div>
          </section>

          {/* Types de données collectées */}
          <section>
            <div className="flex items-start gap-4 mb-4">
              <Eye className="w-6 h-6 text-[#00A8CC] mt-1" />
              <h2 className="text-2xl font-bold text-[#2C3E50]">3. Données Personnelles Collectées</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#2C3E50] mb-2">Données d'identification</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Nom et prénom</li>
                    <li>Adresse email</li>
                    <li>Numéro de téléphone</li>
                    <li>Date de naissance</li>
                    <li>Photo de profil</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#2C3E50] mb-2">Données d'utilisation</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Préférences sportives</li>
                    <li>Historique d'événements</li>
                    <li>Messages et communications</li>
                    <li>Données de géolocalisation</li>
                    <li>Logs de connexion</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#2C3E50] mb-2">Données techniques</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Adresse IP</li>
                    <li>Type de navigateur</li>
                    <li>Système d'exploitation</li>
                    <li>Cookies et traceurs</li>
                    <li>Données d'analytics</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#2C3E50] mb-2">Données de paiement</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Informations de facturation</li>
                    <li>Historique des transactions</li>
                    <li>Données chiffrées bancaires</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">
                    * Les données bancaires sont traitées par nos prestataires de paiement sécurisés
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Finalités du traitement */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">4. Finalités du Traitement</h2>
            <div className="text-gray-700 space-y-4">
              <p>Nous utilisons vos données personnelles pour les finalités suivantes :</p>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[#00A8CC] mt-1" />
                  <div>
                    <h3 className="font-semibold">Gestion du compte utilisateur</h3>
                    <p className="text-sm">Création, authentification et gestion de votre profil</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Settings className="w-5 h-5 text-[#00A8CC] mt-1" />
                  <div>
                    <h3 className="font-semibold">Fonctionnement de la plateforme</h3>
                    <p className="text-sm">Organisation d'événements, messagerie, recommandations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#00A8CC] mt-1" />
                  <div>
                    <h3 className="font-semibold">Sécurité et prévention</h3>
                    <p className="text-sm">Détection et prévention des fraudes, modération</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-[#00A8CC] mt-1" />
                  <div>
                    <h3 className="font-semibold">Amélioration des services</h3>
                    <p className="text-sm">Analytics, support client, développement de nouvelles fonctionnalités</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Base légale */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">5. Base Légale du Traitement</h2>
            <div className="text-gray-700 space-y-4">
              <div className="grid gap-4">
                <div className="border-l-4 border-[#00A8CC] pl-4">
                  <h3 className="font-semibold">Exécution du contrat</h3>
                  <p className="text-sm">Données nécessaires à la fourniture de nos services (profil, événements)</p>
                </div>
                <div className="border-l-4 border-[#FF6B35] pl-4">
                  <h3 className="font-semibold">Consentement</h3>
                  <p className="text-sm">Géolocalisation, marketing direct, cookies non-essentiels</p>
                </div>
                <div className="border-l-4 border-[#00D9A3] pl-4">
                  <h3 className="font-semibold">Intérêt légitime</h3>
                  <p className="text-sm">Sécurité, prévention des fraudes, amélioration des services</p>
                </div>
                <div className="border-l-4 border-gray-400 pl-4">
                  <h3 className="font-semibold">Obligation légale</h3>
                  <p className="text-sm">Conservation des données comptables, lutte anti-blanchiment</p>
                </div>
              </div>
            </div>
          </section>

          {/* Partage des données */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">6. Partage des Données</h2>
            <div className="text-gray-700 space-y-4">
              <p>Vos données personnelles peuvent être partagées dans les cas suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Autres utilisateurs :</strong> Nom, photo et informations de profil visibles selon vos paramètres de confidentialité</li>
                <li><strong>Prestataires de services :</strong> Hébergement (Vercel), paiement, analytics sous contrat de protection des données</li>
                <li><strong>Obligations légales :</strong> Autorités compétentes en cas de demande judiciaire ou administrative</li>
                <li><strong>Protection des droits :</strong> Défense de nos intérêts légitimes ou de ceux des utilisateurs</li>
              </ul>
              <p className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <strong>Important :</strong> Nous ne vendons jamais vos données personnelles à des tiers à des fins commerciales.
              </p>
            </div>
          </section>

          {/* Durée de conservation */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">7. Durée de Conservation</h2>
            <div className="text-gray-700">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 border-b">Type de données</th>
                    <th className="text-left p-4 border-b">Durée de conservation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4">Compte utilisateur actif</td>
                    <td className="p-4">Jusqu'à suppression du compte</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Compte utilisateur supprimé</td>
                    <td className="p-4">30 jours puis suppression définitive</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Messages et communications</td>
                    <td className="p-4">Durée de vie du compte</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Logs de connexion</td>
                    <td className="p-4">12 mois maximum</td>
                  </tr>
                  <tr>
                    <td className="p-4">Données comptables</td>
                    <td className="p-4">10 ans (obligation légale)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Vos droits */}
          <section className="bg-[#00A8CC]/5 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">8. Vos Droits</h2>
            <div className="text-gray-700 space-y-4">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Eye className="w-4 h-4 text-[#00A8CC] mt-1" />
                  <div>
                    <h3 className="font-semibold">Droit d'accès</h3>
                    <p className="text-sm">Consulter vos données personnelles</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Settings className="w-4 h-4 text-[#00A8CC] mt-1" />
                  <div>
                    <h3 className="font-semibold">Droit de rectification</h3>
                    <p className="text-sm">Corriger vos données inexactes</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-[#00A8CC] mt-1" />
                  <div>
                    <h3 className="font-semibold">Droit à l'effacement</h3>
                    <p className="text-sm">Supprimer vos données personnelles</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-[#00A8CC] mt-1" />
                  <div>
                    <h3 className="font-semibold">Droit à la limitation</h3>
                    <p className="text-sm">Limiter le traitement de vos données</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Database className="w-4 h-4 text-[#00A8CC] mt-1" />
                  <div>
                    <h3 className="font-semibold">Droit à la portabilité</h3>
                    <p className="text-sm">Récupérer vos données</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-[#00A8CC] mt-1" />
                  <div>
                    <h3 className="font-semibold">Droit d'opposition</h3>
                    <p className="text-sm">S'opposer au traitement</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#00A8CC]/20">
                <p><strong>Comment exercer vos droits :</strong></p>
                <p>Contactez-nous à <a href="mailto:dpo@teamup.fr" className="text-[#00A8CC] hover:underline">dpo@teamup.fr</a> ou via votre profil utilisateur.</p>
                <p className="text-sm mt-2">Nous répondons sous 30 jours maximum à compter de la réception de votre demande.</p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">9. Cookies et Traceurs</h2>
            <div className="text-gray-700 space-y-4">
              <p>Notre plateforme utilise différents types de cookies :</p>
              <div className="grid gap-4">
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800">Cookies essentiels</h3>
                  <p className="text-sm text-green-700">Nécessaires au fonctionnement de la plateforme (authentification, sécurité)</p>
                  <p className="text-xs text-green-600 mt-1">Ces cookies ne nécessitent pas votre consentement</p>
                </div>
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800">Cookies de performance</h3>
                  <p className="text-sm text-blue-700">Analytics et amélioration de l'expérience utilisateur</p>
                </div>
                <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800">Cookies de personnalisation</h3>
                  <p className="text-sm text-purple-700">Préférences et recommandations personnalisées</p>
                </div>
              </div>
              <p>
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur ou via notre interface de gestion des cookies.
              </p>
            </div>
          </section>

          {/* Sécurité */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">10. Sécurité des Données</h2>
            <div className="text-gray-700 space-y-4">
              <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Chiffrement des données sensibles (SSL/TLS)</li>
                <li>Authentification à deux facteurs disponible</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Audits de sécurité réguliers</li>
                <li>Formation du personnel à la protection des données</li>
                <li>Sauvegarde sécurisée et chiffrée</li>
              </ul>
              <p className="bg-red-50 p-4 rounded-lg border border-red-200">
                <strong>En cas de violation de données</strong> susceptible d'engendrer un risque élevé pour vos droits et libertés, 
                nous vous informerons dans les 72 heures conformément au RGPD.
              </p>
            </div>
          </section>

          {/* Transferts internationaux */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">11. Transferts Internationaux</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Nos données sont hébergées principalement en France et dans l'Union Européenne. 
                Certains prestataires peuvent traiter des données en dehors de l'UE avec les garanties appropriées :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Décision d'adéquation de la Commission européenne</li>
                <li>Clauses contractuelles types approuvées par l'UE</li>
                <li>Certification sous des mécanismes approuvés</li>
              </ul>
            </div>
          </section>

          {/* Contact et réclamations */}
          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">12. Contact et Réclamations</h2>
            <div className="text-gray-700 space-y-4">
              <p><strong>Pour toute question relative à cette politique de confidentialité :</strong></p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Équipe TeamUp</h3>
                  <p>Email : <a href="mailto:dpo@teamup.fr" className="text-[#00A8CC] hover:underline">dpo@teamup.fr</a></p>
                  <p>Réponse sous 48h</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Autorité de contrôle</h3>
                  <p>CNIL (Commission Nationale de l'Informatique et des Libertés)</p>
                  <p>Site web : <a href="https://www.cnil.fr" className="text-[#00A8CC] hover:underline">www.cnil.fr</a></p>
                </div>
              </div>
            </div>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">13. Modifications de cette Politique</h2>
            <p className="text-gray-700">
              Cette politique peut être mise à jour pour refléter les évolutions de nos pratiques ou de la réglementation. 
              Toute modification importante sera communiquée par email ou notification sur la plateforme au moins 30 jours avant son entrée en vigueur.
            </p>
          </section>

          {/* Date de mise à jour */}
          <section className="border-t pt-8">
            <p className="text-gray-500 text-sm">
              <strong>Dernière mise à jour :</strong> 11 septembre 2025<br />
              <strong>Version :</strong> 1.0
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
