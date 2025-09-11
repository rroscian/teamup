import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/api/middleware/auth';
import { eventServiceServer } from '@/backend/services/eventService.server';

export async function POST(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const { city } = await request.json();
      
      if (!city || typeof city !== 'string') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Nom de ville requis' 
          },
          { status: 400 }
        );
      }
      
      const results = await eventServiceServer.forceRegeocodingByCity(city);
      
      return NextResponse.json({
        success: true,
        data: results,
        message: `Re-géocodage terminé pour ${city}: ${results.success} succès, ${results.failed} échecs`
      });
      
    } catch (error) {
      console.error('Erreur lors du re-géocodage:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erreur lors du re-géocodage',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        },
        { status: 500 }
      );
    }
  });
}
