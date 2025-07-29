// API Routes pour les utilisateurs
import { NextRequest } from 'next/server';
import { UserService } from '@/backend/services/userService';
import { ValidationService, VALIDATION_RULES, createApiError } from '@/backend/middleware/validation';
import { ApiResponse } from '@/shared/types';
import { ERROR_CODES } from '@/shared/constants';

export async function GET() {
  try {
    const users = await UserService.findAll();
    
    const response: ApiResponse<typeof users> = {
      data: users,
      success: true,
      message: 'Users retrieved successfully',
    };
    
    return Response.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    return createApiError(
      'Failed to retrieve users',
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validation des données
    const validation = await ValidationService.validateRequest(request, [
      VALIDATION_RULES.USER_NAME,
      VALIDATION_RULES.EMAIL,
    ]);

    if (!validation.isValid) {
      return createApiError(
        validation.errors.join(', '),
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const { name, email, avatar } = validation.data;

    // Vérifier si l'email existe déjà
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      return createApiError(
        'Email already exists',
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Créer l'utilisateur
    const newUser = await UserService.create({ name, email, avatar });
    
    const response: ApiResponse<typeof newUser> = {
      data: newUser,
      success: true,
      message: 'User created successfully',
    };
    
    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return createApiError(
      'Failed to create user',
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
