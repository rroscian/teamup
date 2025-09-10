# TeamUp - Progressive Web App (PWA)

## 🚀 Installation PWA

### Fonctionnalités PWA Implémentées

- **✅ Installable** : L'application peut être installée sur mobile et desktop
- **✅ Mode Offline** : Fonctionnement hors ligne avec cache intelligent
- **✅ Service Worker** : Gestion automatique du cache et mises à jour
- **✅ Responsive** : Interface optimisée mobile et desktop
- **✅ Notifications** : Support des notifications push (à étendre)
- **✅ Icônes** : Icônes adaptées à toutes les plateformes

### Installation sur Mobile (Android/iOS)

1. **Ouvrir TeamUp** dans Chrome, Firefox ou Safari
2. **Rechercher l'icône d'installation** dans la barre d'adresse
3. **Cliquer sur "Installer"** ou "Ajouter à l'écran d'accueil"
4. **Confirmer l'installation**
5. L'application apparaît comme une app native sur votre écran d'accueil

### Installation sur Desktop

1. **Ouvrir TeamUp** dans Chrome ou Edge
2. **Cliquer sur l'icône d'installation** dans la barre d'adresse (à droite)
3. **Cliquer sur "Installer TeamUp"**
4. L'application s'ouvre dans sa propre fenêtre
5. Accessible via le menu Démarrer ou Applications

### Fonctionnement Hors Ligne

#### Pages Disponibles Offline :
- **Page d'accueil** (/)
- **Événements** (/events) - données en cache
- **Profil** (/profile) - informations locales
- **Messages** (/messages) - conversations en cache

#### Stratégies de Cache :

**Assets Statiques** (Cache First)
- Images, CSS, JavaScript
- Icônes et polices
- Cache longue durée avec mise à jour automatique

**API Calls** (Network First)
- Données des événements
- Profils utilisateurs
- Messages
- Fallback vers cache si hors ligne

**Pages HTML** (Cache First avec Network Fallback)
- Pages principales en cache
- Mise à jour en arrière-plan
- Fallback vers page d'accueil si route introuvable

### Indicateurs d'État

- **🟢 En ligne** : Toutes les fonctionnalités disponibles
- **🔴 Hors ligne** : Mode limité avec données en cache
- **🔄 Synchronisation** : Notification de retour en ligne

### Mises à Jour Automatiques

Le Service Worker :
1. **Détecte automatiquement** les nouvelles versions
2. **Propose l'installation** via notification
3. **Met à jour en arrière-plan** sans interruption
4. **Synchronise les données** au retour en ligne

## 🛠 Développement

### Fichiers PWA

```
public/
├── manifest.json          # Métadonnées PWA
├── sw.js                  # Service Worker
├── icon-*.svg            # Icônes PWA (toutes tailles)
└── teamup_logo.png       # Icône de fallback

frontend/components/
├── PWAInstaller.tsx      # Composant d'installation
└── OfflineIndicator.tsx  # Indicateur d'état réseau

frontend/hooks/
└── useOfflineStatus.ts   # Hook de détection offline
```

### Configuration Next.js

Le fichier `next.config.ts` inclut :
- Headers pour Service Worker
- Configuration du manifest
- Optimisations PWA

### Test en Développement

```bash
# Démarrer en mode développement
npm run dev

# Build et test PWA
npm run build
npm start

# Ouvrir dans Chrome
# Activer les outils développeur > Application > Service Workers
```

### Déploiement PWA

1. **Build de production** : `npm run build`
2. **Vérifier le manifest** : `/manifest.json` accessible
3. **Tester le Service Worker** : `/sw.js` fonctionnel
4. **Audit Lighthouse** : Score PWA > 90
5. **Test installation** : Sur mobile et desktop

### Debug PWA

**Chrome DevTools :**
- **Application > Manifest** : Vérifier les métadonnées
- **Application > Service Workers** : État du SW
- **Application > Storage** : Cache du navigateur
- **Network** : Requêtes offline/cache

**Erreurs Communes :**
- Manifest mal formé → Vérifier JSON
- Service Worker non enregistré → Vérifier chemin
- Icônes manquantes → Vérifier tailles
- Cache obsolète → Clear Storage

## 📱 Compatibilité

### Support Navigateurs

- **Chrome/Chromium** : Support complet ✅
- **Firefox** : Support complet ✅
- **Safari** : Support partiel (iOS 11.3+) ✅
- **Edge** : Support complet ✅

### Plateformes Testées

- **Android** : Chrome, Firefox ✅
- **iOS** : Safari ✅
- **Windows** : Chrome, Edge ✅
- **macOS** : Chrome, Safari ✅
- **Linux** : Chrome, Firefox ✅

## 🔧 Personnalisation

### Modifier les Icônes

1. Remplacer les fichiers `icon-*.svg` dans `/public`
2. Utiliser des images PNG optimisées pour production
3. Respecter les tailles : 72, 96, 128, 144, 152, 192, 384, 512px
4. Format recommandé : PNG avec fond transparent

### Modifier le Manifest

Éditer `/public/manifest.json` :
- `name` : Nom complet de l'application
- `short_name` : Nom court (12 caractères max)
- `theme_color` : Couleur de thème
- `background_color` : Couleur de fond

### Stratégie de Cache Custom

Modifier `/public/sw.js` :
- Ajouter des URLs à `STATIC_CACHE_URLS`
- Personnaliser la logique de cache par route
- Gérer les erreurs offline spécifiquement

---

**🎯 TeamUp PWA est maintenant prête à être installée et utilisée comme une application native !**
