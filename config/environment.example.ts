// Configuration d'environnement d'exemple
// Copiez ce fichier et adaptez selon vos besoins

export const config = {
  // Configuration de l'application
  app: {
    name: 'TeamUp',
    version: '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Configuration API
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 10000, // 10 secondes
  },
  
  // Configuration de développement
  development: {
    enableDebugLogs: process.env.NODE_ENV === 'development',
    mockData: true, // Utiliser les données simulées
  },
  
  // Configuration future base de données
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/teamup',
    // Prisma configuration would go here
  },
  
  // Configuration authentification (future)
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    tokenExpiration: '7d',
  },
  
  // Configuration upload de fichiers (future)
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    destination: process.env.UPLOAD_DIR || './public/uploads',
  },
} as const;

export default config;
