// Middleware de validation
import { NextRequest } from 'next/server';
import { VALIDATION } from '@/shared/constants';
import { ApiError } from '@/shared/types';

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
