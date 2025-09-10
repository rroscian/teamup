import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/api/middleware/auth';
import { eventServiceServer } from '@/backend/services/eventService.server';

export async function POST(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      console.log('🧪 Démarrage du test de géocodage...');
      
      const results = await eventServiceServer.testGeocodingWithFrenchCities();
      
      const successCount = Object.values(results).filter(r => r.success).length;
      const totalCount = Object.keys(results).length;
      const successRate = Math.round((successCount / totalCount) * 100);
      
      return NextResponse.json({
        success: true,
        data: results,
        summary: {
          totalCities: totalCount,
          successful: successCount,
          failed: totalCount - successCount,
          successRate: successRate
        },
        message: `Test de géocodage terminé: ${successCount}/${totalCount} villes géocodées avec succès (${successRate}%)`
      });
      
    } catch (error) {
      console.error('Erreur lors du test de géocodage:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erreur lors du test de géocodage',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        },
        { status: 500 }
      );
    }
  });
}
