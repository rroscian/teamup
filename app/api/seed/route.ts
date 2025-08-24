// API Route pour initialiser des données d'exemple
import seedData from '@/scripts/seed-data';
import { ApiResponse } from '@/shared/types';

export async function POST() {
  try {
    // Sécurité : ne pas permettre en production
    if (process.env.NODE_ENV === 'production') {
      return Response.json(
        { 
          success: false, 
          error: { 
            message: 'Seed data not allowed in production',
            code: 'FORBIDDEN'
          } 
        },
        { status: 403 }
      );
    }

    // Exécuter le script de seed
    await seedData();
    
    const response: ApiResponse<null> = {
      data: null,
      success: true,
      message: 'Sample data created successfully',
    };
    
    return Response.json(response);
  } catch (error) {
    console.error('Error seeding data:', error);
    return Response.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to seed data',
          code: 'INTERNAL_ERROR'
        } 
      },
      { status: 500 }
    );
  }
}
