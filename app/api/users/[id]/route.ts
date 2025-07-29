// API Routes pour un utilisateur spécifique
import { NextRequest } from 'next/server';
import { UserService } from '@/backend/services/userService';
import { ValidationService, VALIDATION_RULES, createApiError } from '@/backend/middleware/validation';
import { ApiResponse } from '@/shared/types';
import { ERROR_CODES } from '@/shared/constants';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const user = await UserService.findById(id);
    
    if (!user) {
      return createApiError(
        'User not found',
        ERROR_CODES.NOT_FOUND,
        404
      );
    }
    
    const response: ApiResponse<typeof user> = {
      data: user,
      success: true,
    };
    
    return Response.json(response);
  } catch (error) {
    console.error('Error fetching user:', error);
    return createApiError(
      'Failed to retrieve user',
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    // Vérifier si l'utilisateur existe
    const existingUser = await UserService.findById(id);
    if (!existingUser) {
      return createApiError(
        'User not found',
        ERROR_CODES.NOT_FOUND,
        404
      );
    }

    // Validation des données
    const validation = await ValidationService.validateRequest(request, [
      { ...VALIDATION_RULES.USER_NAME, required: false },
      { ...VALIDATION_RULES.EMAIL, required: false },
    ]);

    if (!validation.isValid) {
      return createApiError(
        validation.errors.join(', '),
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const updateData = validation.data;

    // Vérifier si le nouvel email existe déjà (si fourni)
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await UserService.findByEmail(updateData.email);
      if (emailExists) {
        return createApiError(
          'Email already exists',
          ERROR_CODES.VALIDATION_ERROR
        );
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await UserService.update(id, updateData);
    
    const response: ApiResponse<typeof updatedUser> = {
      data: updatedUser,
      success: true,
      message: 'User updated successfully',
    };
    
    return Response.json(response);
  } catch (error) {
    console.error('Error updating user:', error);
    return createApiError(
      'Failed to update user',
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    const deleted = await UserService.delete(id);
    
    if (!deleted) {
      return createApiError(
        'User not found',
        ERROR_CODES.NOT_FOUND,
        404
      );
    }
    
    const response: ApiResponse<null> = {
      data: null,
      success: true,
      message: 'User deleted successfully',
    };
    
    return Response.json(response);
  } catch (error) {
    console.error('Error deleting user:', error);
    return createApiError(
      'Failed to delete user',
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
