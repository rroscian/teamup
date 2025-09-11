'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/frontend/components/Footer';

export default function MentionsLegales() {
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
        <h1 className="text-4xl font-bold text-[#2C3E50] mb-8">Mentions Légales</h1>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-8">
          {/* Éditeur */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">1. Éditeur du site</h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>Raison sociale :</strong> TeamUp</p>
              <p><strong>Forme juridique :</strong> Société par actions simplifiée (SAS)</p>
              <p><strong>Capital social :</strong> FICTIF</p>
              <p><strong>RCS :</strong> FICTIF</p>
              <p><strong>SIRET :</strong> FICTIF</p>
              <p><strong>Code APE :</strong> FICTIF</p>
              <p><strong>Adresse du siège social :</strong> FICTIVE</p>
              <p><strong>Téléphone :</strong> FICTIF</p>
              <p><strong>Email :</strong> contact@teamup.fr</p>
            </div>
          </section>

          {/* Directeur de publication */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">2. Directeur de publication</h2>
            <p className="text-gray-700">
              Le directeur de publication du site est Raphaël ROSCIAN, en qualité de développeur.
            </p>
          </section>

          {/* Hébergeur */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">3. Hébergeur</h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>Render</strong></p>
              <p>525 Brannan Street Ste 300</p>
              <p>San Francisco, CA 94107, États-Unis</p>
              <p>Site web : <a href="https://render.com" className="text-[#00A8CC] hover:underline">https://render.com</a></p>
            </div>
          </section>

          {/* Données personnelles */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">4. Données personnelles et RGPD</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée, vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité, de limitation du traitement et d'opposition concernant vos données personnelles.
              </p>
              <p>
                <strong>Responsable du traitement :</strong> TeamUp
              </p>
              <p>
                <strong>Délégué à la Protection des Données (DPO) :</strong> Non désigné
              </p>
              <p>
                Pour exercer vos droits, vous pouvez nous contacter à l'adresse : <a href="mailto:dpo@teamup.fr" className="text-[#00A8CC] hover:underline">dpo@teamup.fr</a>
              </p>
              <p>
                Vous avez également le droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" className="text-[#00A8CC] hover:underline">www.cnil.fr</a>
              </p>
              <p>
                Pour plus d'informations sur le traitement de vos données personnelles, consultez notre <Link href="/politique-confidentialite" className="text-[#00A8CC] hover:underline">Politique de Confidentialité</Link>.
              </p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">5. Propriété intellectuelle</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
              <p>
                La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse de l'éditeur.
              </p>
              <p>
                Les marques citées sur ce site sont déposées par les sociétés qui en sont propriétaires.
              </p>
            </div>
          </section>

          {/* Limitation de responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">6. Limitation de responsabilité</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes.
              </p>
              <p>
                Si vous constatez une lacune, erreur ou ce qui paraît être un dysfonctionnement, merci de bien vouloir le signaler par email à l'adresse <a href="mailto:contact@teamup.fr" className="text-[#00A8CC] hover:underline">contact@teamup.fr</a>, en décrivant le problème de la manière la plus précise possible.
              </p>
              <p>
                Tout contenu téléchargé se fait aux risques et périls de l'utilisateur et sous sa seule responsabilité.
              </p>
            </div>
          </section>

          {/* Droit applicable */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">7. Droit applicable et juridiction compétente</h2>
            <p className="text-gray-700">
              Tout litige en relation avec l'utilisation du site TeamUp est soumis au droit français. En dehors des cas où la loi ne le permet pas, il est fait attribution exclusive de juridiction aux tribunaux compétents de Paris.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">8. Cookies</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Le site TeamUp utilise des cookies pour améliorer l'expérience utilisateur et mesurer l'audience du site.
              </p>
              <p>
                Vous pouvez configurer votre navigateur pour refuser les cookies. Cependant, certaines fonctionnalités du site peuvent ne pas fonctionner correctement.
              </p>
              <p>
                Pour plus d'informations sur les cookies utilisés, consultez notre <Link href="/politique-confidentialite" className="text-[#00A8CC] hover:underline">Politique de Confidentialité</Link>.
              </p>
            </div>
          </section>

          {/* Date de mise à jour */}
          <section className="border-t pt-8">
            <p className="text-gray-500 text-sm">
              <strong>Dernière mise à jour :</strong> 12 septembre 2025
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
