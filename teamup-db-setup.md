# Guide complet : PostgreSQL + Render pour TeamUp!

## Étape 1 : Création de la base de données sur Render

### 1.1 Connexion à Render
1. Allez sur [render.com](https://render.com) et connectez-vous
2. Cliquez sur **"New +"** dans le dashboard
3. Sélectionnez **"PostgreSQL"**

### 1.2 Configuration de la base de données
1. **Name** : `teamup-database` (ou votre choix)
2. **Database** : `teamup` (nom de la base)
3. **User** : `teamup_user` (nom d'utilisateur)
4. **Region** : Choisissez la plus proche (Europe West pour la France)
5. **PostgreSQL Version** : Laissez la dernière version
6. **Plan** : Starter (gratuit) pour le MVP, ou Starter+ ($7/mois) pour plus d'espace

### 1.3 Création
1. Cliquez sur **"Create Database"**
2. Attendez quelques minutes que la base soit provisionnée
3. Notez les informations de connexion qui apparaissent

## Étape 2 : Configuration du projet Next.js

### 2.1 Installation des dépendances
```bash
npm install prisma @prisma/client
npm install -D prisma
```

### 2.2 Initialisation de Prisma
```bash
npx prisma init
```

### 2.3 Configuration de la base de données (.env)
Créez/modifiez le fichier `.env.local` :

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Secrets
JWT_SECRET="votre-jwt-secret-très-sécurisé"
JWT_REFRESH_SECRET="votre-refresh-secret-très-sécurisé"

# App
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-nextauth-secret"
```

**Important** : Récupérez l'URL complète depuis votre dashboard Render, section "Connections" > "External Database URL"

## Étape 3 : Schéma de base de données Prisma

### 3.1 Fichier prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id       String @id @default(cuid())
  email    String @unique
  username String @unique
  password String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  profile       UserProfile?
  events        Event[]
  participations EventParticipation[]
  sentMessages   Message[] @relation("MessageSender")
  receivedMessages Message[] @relation("MessageReceiver")
  conversations  ConversationParticipant[]
  
  @@map("users")
}

model UserProfile {
  id           String @id @default(cuid())
  userId       String @unique
  firstName    String?
  lastName     String?
  avatar       String?
  bio          String?
  location     Json? // { address: string, coordinates: [lat, lng] }
  sports       String[] // Array of preferred sports
  skillLevel   String? // beginner, intermediate, advanced
  availability String[] // Array of preferred time slots
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_profiles")
}

model Event {
  id              String   @id @default(cuid())
  title           String
  description     String?
  sport           String
  date            DateTime
  startTime       String
  duration        Int // minutes
  location        Json // { address: string, coordinates: [lat, lng] }
  maxParticipants Int
  minParticipants Int      @default(1)
  skillLevel      String[] // Array of accepted skill levels
  status          String   @default("active") // active, cancelled, completed
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  creatorId     String
  creator       User @relation(fields: [creatorId], references: [id])
  participants  EventParticipation[]
  conversations Conversation[]
  
  // Indexes pour optimiser les requêtes
  @@index([sport, date])
  @@index([date])
  @@index([creatorId])
  @@map("events")
}

model EventParticipation {
  id        String   @id @default(cuid())
  eventId   String
  userId    String
  status    String   @default("interested") // interested, confirmed, waitlist, declined, no_show
  joinedAt  DateTime @default(now())
  confirmedAt DateTime?
  
  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([eventId, userId])
  @@map("event_participations")
}

model Conversation {
  id        String   @id @default(cuid())
  eventId   String?
  type      String   // event, direct
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  event        Event? @relation(fields: [eventId], references: [id], onDelete: Cascade)
  messages     Message[]
  participants ConversationParticipant[]
  
  @@map("conversations")
}

model ConversationParticipant {
  id             String @id @default(cuid())
  conversationId String
  userId         String
  joinedAt       DateTime @default(now())
  lastReadAt     DateTime @default(now())
  
  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([conversationId, userId])
  @@map("conversation_participants")
}

model Message {
  id             String   @id @default(cuid())
  content        String
  senderId       String
  receiverId     String?
  conversationId String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  isEdited       Boolean  @default(false)
  isDeleted      Boolean  @default(false)
  
  sender       User          @relation("MessageSender", fields: [senderId], references: [id])
  receiver     User?         @relation("MessageReceiver", fields: [receiverId], references: [id])
  conversation Conversation? @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  @@index([conversationId, createdAt])
  @@map("messages")
}
```

## Étape 4 : Migration et génération du client

### 4.1 Générer et appliquer la migration
```bash
# Générer la migration
npx prisma migrate dev --name init

# Générer le client Prisma
npx prisma generate
```

### 4.2 Vérification
```bash
# Ouvrir Prisma Studio pour visualiser les données
npx prisma studio
```

## Étape 5 : Configuration Render pour le déploiement

### 5.1 Création du service web sur Render
1. Dans le dashboard Render, cliquez sur **"New +"**
2. Sélectionnez **"Web Service"**
3. Connectez votre repository GitHub contenant le projet TeamUp!

### 5.2 Configuration du service
- **Name** : `teamup-app`
- **Environment** : `Node`
- **Region** : Même que votre base de données
- **Branch** : `main`
- **Build Command** : `npm install && npx prisma generate && npm run build`
- **Start Command** : `npm start`

### 5.3 Variables d'environnement sur Render
Dans les paramètres du service web, ajoutez :

```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=votre-jwt-secret-très-sécurisé
JWT_REFRESH_SECRET=votre-refresh-secret-très-sécurisé
NEXTAUTH_URL=https://votre-app.onrender.com
NEXTAUTH_SECRET=votre-nextauth-secret
NODE_ENV=production
```

## Étape 6 : Configuration des migrations en production

### 6.1 Script de déploiement
Créez un fichier `package.json` avec ces scripts :

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "deploy": "prisma migrate deploy && next start",
    "start": "next start",
    "dev": "next dev",
    "postinstall": "prisma generate"
  }
}
```

### 6.2 Script de migration (optionnel)
Créez `scripts/migrate.js` :

```javascript
const { exec } = require('child_process');

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    exec('npx prisma migrate deploy', (error, stdout, stderr) => {
      if (error) {
        console.error(`Migration error: ${error}`);
        return;
      }
      console.log('Migrations completed successfully');
      console.log(stdout);
    });
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
```

## Étape 7 : Tests et vérifications

### 7.1 Test local
```bash
# Tester la connexion
npm run dev

# Vérifier Prisma Studio
npx prisma studio
```

### 7.2 Utilitaire de connexion
Créez `lib/prisma.js` :

```javascript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 7.3 Test d'API simple
Créez `pages/api/test-db.js` :

```javascript
import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
  try {
    const userCount = await prisma.user.count()
    res.status(200).json({ 
      message: 'Database connected successfully',
      userCount 
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message 
    })
  }
}
```

## Étape 8 : Surveillance et maintenance

### 8.1 Monitoring sur Render
1. Consultez les logs dans le dashboard Render
2. Configurez les alertes de santé
3. Surveillez l'utilisation des ressources

### 8.2 Sauvegarde
```bash
# Commande pour backup (à configurer en cron job)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 8.3 Commandes utiles
```bash
# Reset de la base (développement uniquement)
npx prisma migrate reset

# Voir le statut des migrations
npx prisma migrate status

# Seed de données (créer prisma/seed.js)
npx prisma db seed
```

## Points importants à retenir

1. **Sécurité** : Ne jamais commiter les fichiers `.env`
2. **Performance** : Utilisez les index définis dans le schéma
3. **Migrations** : Toujours tester en local avant production
4. **Monitoring** : Surveillez les performances de la base
5. **Backup** : Configurez des sauvegardes régulières

Votre base de données PostgreSQL est maintenant prête pour TeamUp! 🚀