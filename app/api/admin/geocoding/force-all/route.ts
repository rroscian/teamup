import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/api/middleware/auth';
import { eventServiceServer } from '@/backend/services/eventService.server';

export async function POST(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      console.log('🚀 Démarrage du géocodage forcé de tous les événements...');
      
      // Récupérer tous les événements
      const allEvents = await eventServiceServer.getEvents({});
      
      // Filtrer ceux sans coordonnées mais avec une ville
      const eventsToGeocode = allEvents.filter(event => 
        (!event.location.latitude || !event.location.longitude) && 
        event.location.city
      );
      
      console.log(`📋 ${eventsToGeocode.length} événements trouvés sans coordonnées sur ${allEvents.length} total`);
      
      if (eventsToGeocode.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'Tous les événements sont déjà géocodés',
          data: {
            total: allEvents.length,
            alreadyGeocoded: allEvents.length,
            processed: 0,
            successful: 0,
            failed: 0
          }
        });
      }
      
      // Traitement par batch pour éviter de surcharger l'API
      const batchSize = 5;
      let totalSuccess = 0;
      let totalFailed = 0;
      const details: Array<{
        success: boolean;
        event: string;
        city: string;
        coords?: { lat: number; lng: number };
        error?: string;
      }> = [];
      
      for (let i = 0; i < eventsToGeocode.length; i += batchSize) {
        const batch = eventsToGeocode.slice(i, i + batchSize);
        console.log(`🔄 Traitement batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(eventsToGeocode.length/batchSize)}`);
        
        const batchPromises = batch.map(async (event) => {
          try {
            // Utiliser l'utilitaire de géocodage amélioré
            const geocodingService = await import('@/backend/services/geocodingService');
            const coords = await geocodingService.GeocodingService.geocodeAddress(
              event.location.address || '',
              event.location.city,
              event.location.postalCode
            );
            
            if (coords) {
              // Mettre à jour directement en base de données
              const { prisma } = await import('@/lib/prisma');
              const locationData = {
                ...event.location,
                latitude: coords.lat,
                longitude: coords.lng
              };
              
              await prisma.event.update({
                where: { id: event.id },
                data: {
                  location: JSON.stringify(locationData)
                }
              });
              
              console.log(`✅ Géocodé: ${event.title} (${event.location.city}) -> ${coords.lat}, ${coords.lng}`);
              return {
                success: true,
                event: event.title,
                city: event.location.city,
                coords: coords
              };
            } else {
              console.log(`❌ Échec géocodage: ${event.title} (${event.location.city})`);
              return {
                success: false,
                event: event.title,
                city: event.location.city,
                error: 'Coordonnées non trouvées'
              };
            }
          } catch (error) {
            console.error(`❌ Erreur géocodage ${event.title}:`, error);
            return {
              success: false,
              event: event.title,
              city: event.location.city,
              error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        // Comptabiliser les résultats
        batchResults.forEach(result => {
          if (result.success) {
            totalSuccess++;
          } else {
            totalFailed++;
          }
          details.push(result);
        });
        
        // Attendre 2 secondes entre les batches pour éviter de surcharger l'API
        if (i + batchSize < eventsToGeocode.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      const successRate = Math.round((totalSuccess / eventsToGeocode.length) * 100);
      
      console.log(`🏁 Géocodage forcé terminé: ${totalSuccess}/${eventsToGeocode.length} succès (${successRate}%)`);
      
      return NextResponse.json({
        success: true,
        message: `Géocodage forcé terminé: ${totalSuccess} succès, ${totalFailed} échecs`,
        data: {
          total: allEvents.length,
          alreadyGeocoded: allEvents.length - eventsToGeocode.length,
          processed: eventsToGeocode.length,
          successful: totalSuccess,
          failed: totalFailed,
          successRate: successRate,
          details: details
        }
      });
      
    } catch (error) {
      console.error('Erreur lors du géocodage forcé:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erreur lors du géocodage forcé',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        },
        { status: 500 }
      );
    }
  });
}
