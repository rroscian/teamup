// API Routes pour les équipes
import { NextRequest } from 'next/server';
import { TeamService } from '@/backend/services/teamService';
import { UserService } from '@/backend/services/userService';
import { ValidationService, VALIDATION_RULES, createApiError } from '@/backend/middleware/validation';
import { ApiResponse } from '@/shared/types';
import { ERROR_CODES } from '@/shared/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let teams;
    
    if (userId) {
      // Récupérer les équipes d'un utilisateur spécifique
      teams = await TeamService.findByUserId(userId);
    } else {
      // Récupérer toutes les équipes
      teams = await TeamService.findAll();
    }
    
    const response: ApiResponse<typeof teams> = {
      data: teams,
      success: true,
      message: 'Teams retrieved successfully',
    };
    
    return Response.json(response);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return createApiError(
      'Failed to retrieve teams',
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validation des données
    const validation = await ValidationService.validateRequest(request, [
      VALIDATION_RULES.TEAM_NAME,
      VALIDATION_RULES.TEAM_DESCRIPTION,
      {
        field: 'ownerId',
        required: true,
        custom: async (value: string) => {
          const user = await UserService.findById(value);
          return user ? null : 'Owner not found';
        },
      },
    ]);

    if (!validation.isValid) {
      return createApiError(
        validation.errors.join(', '),
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const { name, description, ownerId } = validation.data;

    // Créer l'équipe
    const newTeam = await TeamService.create(ownerId, { name, description });
    
    const response: ApiResponse<typeof newTeam> = {
      data: newTeam,
      success: true,
      message: 'Team created successfully',
    };
    
    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return createApiError(
      'Failed to create team',
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
