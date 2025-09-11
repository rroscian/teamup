import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/api/middleware/auth';
import { eventServiceServer } from '@/backend/services/eventService.server';
import { Sport, SkillLevel, EventStatus } from '@/shared/types';

export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      // Récupérer les paramètres de la requête
      const searchParams = request.nextUrl.searchParams;
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      const radius = searchParams.get('radius') || '10';
      const sport = searchParams.get('sport') as Sport | null;
      const level = searchParams.get('level') as SkillLevel | null;
      const city = searchParams.get('city');

      // Vérifier si les coordonnées sont fournies
      if (!lat || !lng) {
        // Si pas de coordonnées, nous ne pouvons pas rechercher d'événements proches

        // Fallback: retourner une erreur si pas de position
        return NextResponse.json(
          { error: 'Coordonnées GPS requises. Veuillez activer la géolocalisation.' },
          { status: 400 }
        );
      }

      // Construire les filtres additionnels
      const additionalFilters: {
        status: EventStatus;
        sport?: Sport;
        level?: SkillLevel;
        city?: string;
      } = {
        status: EventStatus.Published
      };

      if (sport) additionalFilters.sport = sport;
      if (level) additionalFilters.level = level;
      if (city) additionalFilters.city = city;

      // Utiliser l'algorithme de géolocalisation du service
      const nearbyEvents = await eventServiceServer.findNearbyEvents(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius),
        additionalFilters
      );

      // Transformer les événements pour l'API avec informations de distance
      const transformedEvents = nearbyEvents.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        sport: event.sport,
        location: {
          ...event.location,
          coordinates: event.coordinates
        },
        distance: event.distance,
        distanceFormatted: `${event.distance}km`,
        maxParticipants: event.maxParticipants,
        minParticipants: event.minParticipants,
        skillLevel: event.skillLevel,
        status: event.status,
        date: event.date,
        startDate: event.startDate,
        endDate: event.endDate,
        startTime: event.startTime,
        duration: event.duration,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        createdById: event.createdById,
        participants: event.participants,
        currentParticipants: event.participants.filter(p => p.status === 'attending').length
      }));

      return NextResponse.json({
        success: true,
        data: transformedEvents,
        metadata: {
          userPosition: { lat: parseFloat(lat), lng: parseFloat(lng) },
          radius: parseFloat(radius),
          totalFound: transformedEvents.length,
          filters: additionalFilters
        }
      });
    
    } catch (error) {
      console.error('Error getting nearby events:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erreur lors de la récupération des événements proches',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        },
        { status: 500 }
      );
    }
  });
}
