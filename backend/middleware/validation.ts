// Middleware de validation
import { NextRequest } from 'next/server';
import { VALIDATION } from '@/shared/constants';
import { ApiError } from '@/shared/types';
import { z } from 'zod';
import { Sport, SkillLevel } from '@/shared/types';

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  profile: z.object({
    favoriteSports: z.array(z.nativeEnum(Sport)).optional(),
    skillLevels: z.array(z.object({
      sport: z.nativeEnum(Sport),
      level: z.nativeEnum(SkillLevel)
    })).optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    location: z.object({
      city: z.string().min(1, 'City is required'),
      postalCode: z.string().optional()
    }).optional(),
    availability: z.object({
      weekdays: z.array(z.object({
        day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        available: z.boolean(),
        timeSlots: z.array(z.object({
          startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
          endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
        })).optional()
      })),
      preferredTimes: z.array(z.object({
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
      }))
    }).optional()
  }).optional()
});

// Profile update schema
export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  avatar: z.string().url('Invalid URL format').optional(),
  profile: z.object({
    favoriteSports: z.array(z.nativeEnum(Sport)).optional(),
    skillLevels: z.array(z.object({
      sport: z.nativeEnum(Sport),
      level: z.nativeEnum(SkillLevel)
    })).optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    location: z.object({
      city: z.string().min(2, 'City must be at least 2 characters'),
      postalCode: z.string().regex(/^\d{5}$/, 'Postal code must be 5 digits').optional()
    }).optional(),
    availability: z.object({
      weekdays: z.array(z.object({
        day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        available: z.boolean(),
        timeSlots: z.array(z.object({
          startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
          endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
        })).optional()
      })),
      preferredTimes: z.array(z.object({
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
      }))
    }).optional(),
    notifications: z.object({
      events: z.boolean(),
      messages: z.boolean(),
      reminders: z.boolean()
    }).optional()
  }).optional()
});

// Validation helper function
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { data?: T; error?: string } => {
  try {
    const validatedData = schema.parse(data);
    return { data: validatedData };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const errorMessages = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return { error: errorMessages };
    }
    return { error: 'Validation failed' };
  }
};

export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null | Promise<string | null>;
}

export class ValidationService {
  static async validateRequest(
    request: NextRequest,
    rules: ValidationRule[]
  ): Promise<{ isValid: boolean; errors: string[]; data?: any }> {
    try {
      const body = await request.json();
      const errors: string[] = [];

      for (const rule of rules) {
        const value = body[rule.field];
        const error = await this.validateField(value, rule);
        
        if (error) {
          errors.push(error);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        data: errors.length === 0 ? body : undefined,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid JSON format'],
      };
    }
  }

  private static async validateField(value: any, rule: ValidationRule): Promise<string | null> {
    const { field, required, minLength, maxLength, pattern, custom } = rule;

    // Vérification de la présence si requis
    if (required && (value === undefined || value === null || value === '')) {
      return `${field} is required`;
    }

    // Si la valeur n'est pas requise et est vide, passer la validation
    if (!required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // Vérification de la longueur minimale
    if (minLength && String(value).length < minLength) {
      return `${field} must be at least ${minLength} characters long`;
    }

    // Vérification de la longueur maximale
    if (maxLength && String(value).length > maxLength) {
      return `${field} must not exceed ${maxLength} characters`;
    }

    // Vérification du pattern
    if (pattern && !pattern.test(String(value))) {
      return `${field} format is invalid`;
    }

    // Validation personnalisée
    if (custom) {
      return await custom(value);
    }

    return null;
  }
}

// Règles de validation prédéfinies
export const VALIDATION_RULES = {
  USER_NAME: {
    field: 'name',
    required: true,
    minLength: VALIDATION.USER_NAME.MIN_LENGTH,
    maxLength: VALIDATION.USER_NAME.MAX_LENGTH,
  },
  
  EMAIL: {
    field: 'email',
    required: true,
    pattern: VALIDATION.EMAIL.PATTERN,
  },
  
  TEAM_NAME: {
    field: 'name',
    required: true,
    minLength: VALIDATION.TEAM_NAME.MIN_LENGTH,
    maxLength: VALIDATION.TEAM_NAME.MAX_LENGTH,
  },
  
  TEAM_DESCRIPTION: {
    field: 'description',
    required: false,
    maxLength: 500,
  },
  
  EVENT_TITLE: {
    field: 'title',
    required: true,
    minLength: VALIDATION.EVENT_TITLE.MIN_LENGTH,
    maxLength: VALIDATION.EVENT_TITLE.MAX_LENGTH,
  },
  
  EVENT_DESCRIPTION: {
    field: 'description',
    required: false,
    maxLength: 1000,
  },
  
  DATE_FIELD: (fieldName: string) => ({
    field: fieldName,
    required: true,
    custom: (value: any) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return `${fieldName} must be a valid date`;
      }
      return null;
    },
  }),
} as const;

export function createApiError(message: string, code: string, status: number = 400) {
  return Response.json(
    { 
      success: false, 
      error: { message, code } 
    },
    { status }
  );
}
