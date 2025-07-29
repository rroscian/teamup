// Constantes partagées

export const API_ROUTES = {
  USERS: '/api/users',
  TEAMS: '/api/teams',
  EVENTS: '/api/events',
  AUTH: '/api/auth',
} as const;

export const APP_CONFIG = {
  APP_NAME: 'TeamUp',
  APP_VERSION: '1.0.0',
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  },
} as const;

export const VALIDATION = {
  TEAM_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EVENT_TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  USER_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

export const TEAM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export const PARTICIPATION_STATUS = {
  ATTENDING: 'attending',
  NOT_ATTENDING: 'not_attending',
  MAYBE: 'maybe',
  PENDING: 'pending',
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
