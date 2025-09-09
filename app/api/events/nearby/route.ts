import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/auth';
import { GeocodingService } from '@/backend/services/geocodingService';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const userId = req.user?.id;
    
    try {
      // Récupérer les paramètres de la requête
      const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '10'; // Rayon par défaut : 10 km
    const limit = searchParams.get('limit') || '20';

    // Vérifier si les coordonnées sont fournies
    if (!lat || !lng) {
      // Si pas de coordonnées, essayer de récupérer la position de l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      });

      // Type assertion for lastKnownPosition since it's a new field
      const profile = user?.profile as { lastKnownPosition?: { lat: number; lng: number; timestamp: number } } | null;
      if (!profile?.lastKnownPosition) {
        return NextResponse.json(
          { error: 'Position non disponible' },
          { status: 400 }
        );
      }

      const position = profile.lastKnownPosition;
      return await getNearbyEvents(
        position.lat,
        position.lng,
        parseFloat(radius),
        parseInt(limit)
      );
    }

    return await getNearbyEvents(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius),
      parseInt(limit)
    );
    
    async function getNearbyEvents(
      userLat: number,
      userLng: number,
      radius: number,
      limit: number
    ) {
    // Récupérer tous les événements actifs
    const events = await prisma.event.findMany({
      where: {
        status: 'active',
        date: {
          gte: new Date()
        }
      },
      include: {
        creator: {
          include: {
            profile: true
          }
        },
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    // Filtrer et enrichir les événements avec la distance
    const nearbyEvents = [];
    
    for (const event of events) {
      let eventLat, eventLng;
      
      // Utiliser les coordonnées si elles existent (type assertion nécessaire car coordinates n'est pas encore dans le schéma Prisma)
      const eventWithCoords = event as typeof event & { coordinates?: { lat: number; lng: number } };
      if (eventWithCoords.coordinates && 
          typeof eventWithCoords.coordinates === 'object' && 
          eventWithCoords.coordinates !== null &&
          'lat' in eventWithCoords.coordinates && 
          'lng' in eventWithCoords.coordinates) {
        eventLat = eventWithCoords.coordinates.lat;
        eventLng = eventWithCoords.coordinates.lng;
      } else {
        // Sinon, géocoder l'adresse
        const location = event.location as { address?: string; city?: string; postalCode?: string };
        if (location.address && location.city) {
          const coords = await GeocodingService.geocodeAddress(
            location.address,
            location.city,
            location.postalCode
          );
          
          if (coords) {
            eventLat = coords.lat;
            eventLng = coords.lng;
            
            // Sauvegarder les coordonnées pour la prochaine fois
            // Note: coordinates field needs to be added to the database schema
            // For now, we'll skip the update to avoid the TypeScript error
          }
        }
      }
      
      // Si on a des coordonnées, calculer la distance
      if (eventLat && eventLng) {
        const distance = GeocodingService.calculateDistance(
          userLat,
          userLng,
          eventLat,
          eventLng
        );
        
        // Si l'événement est dans le rayon demandé
        if (distance <= radius) {
          nearbyEvents.push({
            ...event,
            distance: distance,
            distanceFormatted: GeocodingService.formatDistance(distance),
            coordinates: {
              lat: eventLat,
              lng: eventLng
            }
          });
        }
      }
    }

    // Trier par distance croissante
    nearbyEvents.sort((a, b) => a.distance - b.distance);

    // Limiter le nombre de résultats
    const limitedEvents = nearbyEvents.slice(0, limit);

    // Transformer les événements pour l'API
    const transformedEvents = limitedEvents.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      sport: event.sport,
      location: event.location,
      coordinates: event.coordinates,
      distance: event.distance,
      distanceFormatted: event.distanceFormatted,
      maxParticipants: event.maxParticipants,
      minParticipants: event.minParticipants,
      skillLevel: event.skillLevel,
      status: event.status,
      date: event.date,
      startTime: event.startTime,
      duration: event.duration,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      creator: {
        id: event.creator.id,
        name: event.creator.username,
        avatar: event.creator.profile?.avatar
      },
      participants: event.participants.map((p: { id: string; userId: string; status: string; user: { id: string; username: string } }) => ({
        id: p.id,
        userId: p.userId,
        status: p.status,
        user: {
          id: p.user.id,
          name: p.user.username
        }
      })),
      currentParticipants: event.participants.filter(
        (p: { status: string }) => p.status === 'confirmed'
      ).length
    }));

      return NextResponse.json(transformedEvents);
    }
    
    } catch (error) {
      console.error('Error getting nearby events:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des événements proches' },
        { status: 500 }
      );
    }
  });
}
