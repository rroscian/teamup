# TeamUp - Application de Gestion d'Équipes

🚀 Application moderne de gestion d'équipes construite avec Next.js 15, TypeScript et Tailwind CSS, respectant les meilleures pratiques de développement.

## ✨ Fonctionnalités

- **🏗️ Architecture Découplée** : Frontend et Backend séparés avec API REST
- **🔷 TypeScript** : Typage strict pour une meilleure sécurité de code
- **🎨 Interface Moderne** : UI responsive avec Tailwind CSS et composants réutilisables
- **📱 Design System** : Composants UI cohérents et personnalisables
- **🔄 Gestion d'État** : Hooks personnalisés pour les appels API
- **✅ Validation** : Validation côté serveur et client
- **🧪 Bonnes Pratiques** : ESLint, TypeScript strict, architecture propre

## 🏗️ Architecture

```
teamup-nextjs/
├── frontend/              # Interface utilisateur
│   ├── components/        # Composants React réutilisables
│   │   ├── ui/           # Design system (Button, Input, Card)
│   │   └── TeamCard.tsx  # Composant métier
│   ├── hooks/            # Hooks personnalisés (useApi)
│   ├── stores/           # Gestion d'état (future)
│   └── utils/            # Utilitaires frontend
├── backend/              # Logique serveur
│   ├── api/             # Logique API
│   ├── services/        # Services métier
│   └── middleware/      # Validation, authentification
├── shared/              # Code partagé
│   ├── types/          # Types TypeScript
│   └── constants/      # Constantes partagées
├── database/           # Modèles de données
│   ├── models/        # Modèles (future DB)
│   └── migrations/    # Migrations (future DB)
└── app/               # Next.js App Router
    ├── api/          # API Routes
    └── page.tsx      # Interface principale
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone [url-du-repository]
cd teamup-nextjs

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure des Composants

### Design System
- **Button** : Composant bouton avec variants (primary, secondary, danger, ghost)
- **Input** : Champ de saisie avec validation et états d'erreur
- **Card** : Conteneur avec sous-composants (Header, Content, Footer)

### Composants Métier
- **TeamCard** : Affichage et gestion des équipes
- **Page principale** : Dashboard avec stats et gestion

## 🔌 API Routes

### Utilisateurs (`/api/users`)
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `GET /api/users/[id]` - Détails d'un utilisateur
- `PUT /api/users/[id]` - Modifier un utilisateur
- `DELETE /api/users/[id]` - Supprimer un utilisateur

### Équipes (`/api/teams`)
- `GET /api/teams` - Liste des équipes
- `GET /api/teams?userId=123` - Équipes d'un utilisateur
- `POST /api/teams` - Créer une équipe

## 🧪 Technologies Utilisées

- **Framework** : Next.js 15 (App Router)
- **Language** : TypeScript 5
- **Styling** : Tailwind CSS 4
- **Qualité** : ESLint
- **Utilitaires** : clsx pour les classes conditionnelles

## 📊 Fonctionnalités Implémentées

✅ **Architecture découplée** Frontend/Backend  
✅ **Types TypeScript** partagés  
✅ **Composants UI réutilisables**  
✅ **Hooks personnalisés** pour API  
✅ **Validation** des données  
✅ **Interface responsive**  
✅ **Gestion d'erreurs**  
✅ **Loading states**  

## 🔜 Prochaines Étapes

- [ ] Authentification JWT
- [ ] Base de données (Prisma + PostgreSQL)
- [ ] Tests unitaires (Jest + Testing Library)
- [ ] Gestion des événements
- [ ] Notifications temps réel
- [ ] Upload d'images

## 🛠️ Développement

### Scripts Disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Lancer en production
npm start

# Linting
npm run lint
```

### Bonnes Pratiques Respectées

- **Séparation des responsabilités** : Frontend/Backend/Shared
- **Types stricts** : Pas d'`any`, interfaces bien définies
- **Composants réutilisables** : Design system cohérent
- **Gestion d'erreurs** : Validation et feedback utilisateur
- **Performance** : Loading states et optimisations
- **Accessibilité** : Labels, ARIA, navigation clavier

## 📄 License

MIT License - voir le fichier LICENSE pour les détails.

---

**Développé avec ❤️ en utilisant les meilleures pratiques Next.js et TypeScript**
