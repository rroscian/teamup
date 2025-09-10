import { Event, EventStatus, Sport, SkillLevel, LocationType } from '@/shared/types';
import { prisma } from '@/lib/prisma';
import { GeocodingService } from './geocodingService';

// Helper function to transform Prisma Event to shared Event type
function transformPrismaEvent(prismaEvent: any): Event {
  const location = typeof prismaEvent.location === 'string' 
    ? JSON.parse(prismaEvent.location) 
    : prismaEvent.location;

  // Calculate start date and end date with proper time
  const startDate = new Date(prismaEvent.date);
  
  // If we have a startTime, use it to set the correct time
  if (prismaEvent.startTime) {
    const [hours, minutes] = prismaEvent.startTime.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
  }
  
  const endDate = new Date(startDate.getTime() + (prismaEvent.duration * 60 * 1000));

  return {
    id: prismaEvent.id,
    title: prismaEvent.title,
    description: prismaEvent.description || '',
    sport: prismaEvent.sport as Sport,
    location: {
      name: location.address || 'Lieu non spécifié',
      address: location.address || '',
      city: location.city || '',
      postalCode: location.postalCode || '',
      latitude: location.coordinates?.[0] || 0,
      longitude: location.coordinates?.[1] || 0,
      type: LocationType.Outdoor // Default
    },
    maxParticipants: prismaEvent.maxParticipants,
    minParticipants: prismaEvent.minParticipants,
    level: prismaEvent.skillLevel?.[0] as SkillLevel || SkillLevel.Mixed,
    startDate: startDate,
    endDate: endDate,
    startTime: prismaEvent.startTime || '12:00',
    duration: prismaEvent.duration || 60,
    date: startDate,
    createdById: prismaEvent.creatorId,
    participants: prismaEvent.participants?.map((p: any) => ({
      id: p.id,
      eventId: p.eventId,
      userId: p.userId,
      status: p.status,
      user: p.user
    })) || [],
    createdAt: prismaEvent.createdAt,
    updatedAt: prismaEvent.updatedAt,
    status: getEventStatus(prismaEvent.status),
    price: undefined, // Champ temporairement désactivé - migration Prisma requise
    equipment: [], // Champ temporairement désactivé - migration Prisma requise
    skillLevel: prismaEvent.skillLevel || [SkillLevel.Mixed],
    coordinates: location.coordinates ? { lat: location.coordinates[0], lng: location.coordinates[1] } : undefined
  };
}

// Helper to map status from Prisma to Event type
function getEventStatus(prismaStatus: string): EventStatus {
  switch (prismaStatus) {
    case 'active':
      return EventStatus.Published;
    case 'cancelled':
      return EventStatus.Cancelled;
    case 'completed':
      return EventStatus.Completed;
    default:
      return EventStatus.Published;
  }
}

export interface EventFilters {
  sport?: Sport;
  city?: string;
  level?: SkillLevel;
  startDate?: Date;
  endDate?: Date;
  status?: EventStatus;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface CreateEventForm {
  title: string;
  description?: string;
  sport: Sport;
  location: any;
  maxParticipants: number;
  minParticipants: number;
  level: SkillLevel;
  startDate: Date;
  endDate: Date;
  price?: number;
  equipment?: string[];
  teamId?: string;
  category?: 'sports' | 'social' | 'corporate';
  type?: string;
  skillLevel?: SkillLevel;
  currentParticipants?: number;
  createdById?: string;
  participants?: any[];
  status?: any;
}

export const eventServiceServer = {
  // Get all events with optional filters
  async getEvents(filters?: EventFilters): Promise<Event[]> {
    try {
      const where: any = {};

      // Build Prisma where clause from filters
      if (filters?.sport) {
        where.sport = filters.sport;
      }
      if (filters?.level) {
        where.skillLevel = {
          has: filters.level
        };
      }
      if (filters?.status) {
        const prismaStatus = filters.status === EventStatus.Published ? 'active' : 
                            filters.status === EventStatus.Cancelled ? 'cancelled' : 
                            filters.status === EventStatus.Completed ? 'completed' : 'active';
        where.status = prismaStatus;
      }
      if (filters?.startDate || filters?.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.date.lte = filters.endDate;
        }
      }

      const prismaEvents = await prisma.event.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          sport: true,
          date: true,
          startTime: true,
          duration: true,
          location: true,
          maxParticipants: true,
          minParticipants: true,
          skillLevel: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          creatorId: true,
          creator: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      avatar: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          date: 'asc'
        }
      });

      let events = prismaEvents.map(transformPrismaEvent);

      // Apply additional filters that aren't easily done in Prisma
      if (filters?.city) {
        events = events.filter(e => 
          e.location.city.toLowerCase().includes(filters.city!.toLowerCase())
        );
      }
      if (filters?.maxPrice !== undefined) {
        events = events.filter(e => (e.price || 0) <= filters.maxPrice!);
      }

      // Filtrage géographique
      if (filters?.latitude !== undefined && filters?.longitude !== undefined) {
        const radius = filters.radius || 10; // 10 km par défaut
        console.log('🌍 Backend: Filtrage géographique activé', {
          userLat: filters.latitude,
          userLng: filters.longitude,
          radius,
          totalEvents: events.length
        });
        
        const eventsWithGeo = events.filter(event => {
          const hasGeo = event.location.latitude && event.location.longitude;
          if (!hasGeo) {
            console.log('❌ Backend: Événement sans géo:', event.title);
          }
          return hasGeo;
        });
        console.log('📍 Backend: Événements avec géolocalisation:', eventsWithGeo.length);
        
        const nearbyEvents = eventsWithGeo.filter(event => {
          const distance = GeocodingService.calculateDistance(
            filters.latitude!,
            filters.longitude!,
            event.location.latitude!,
            event.location.longitude!
          );
          
          const isNearby = distance <= radius;
          console.log(`📏 Backend: ${event.title} - Distance: ${distance.toFixed(2)}km, Nearby: ${isNearby}`);
          
          return isNearby;
        });
        
        console.log('✅ Backend: Événements dans le rayon:', nearbyEvents.length);
        events = nearbyEvents;
      }

      return events;
    } catch (error) {
      console.error('Error fetching events from database:', error);
      throw new Error('Failed to fetch events');
    }
  },

  // Get event by ID
  async getEventById(id: string): Promise<Event | null> {
    try {
      const prismaEvent = await prisma.event.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          sport: true,
          date: true,
          startTime: true,
          duration: true,
          location: true,
          maxParticipants: true,
          minParticipants: true,
          skillLevel: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          creatorId: true,
          creator: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      avatar: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      return prismaEvent ? transformPrismaEvent(prismaEvent) : null;
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      return null;
    }
  },

  // Géocoder et enrichir les événements avec coordonnées GPS
  async enrichEventsWithCoordinates(events: Event[]): Promise<Event[]> {
    console.log(`\n🔍 DEBUG: ANALYSE DE TOUS LES ÉVÉNEMENTS:`);
    
    // Debug pour TOUS les événements
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      console.log(`\n📋 Événement ${i + 1}/${events.length}: "${event.title}"`);
      console.log(`   📍 VILLE: ${event.location.city || 'AUCUNE'}`);
      console.log(`   📐 LATITUDE: ${event.location.latitude || 'AUCUNE'}`);
      console.log(`   📐 LONGITUDE: ${event.location.longitude || 'AUCUNE'}`);
    }

    const eventsToGeocode = events.filter(event => 
      (!event.location.latitude || !event.location.longitude) && 
      event.location.city  // Seulement besoin de la ville
    );

    if (eventsToGeocode.length === 0) {
      console.log(`✅ Tous les événements sont déjà géocodés`);
      return events;
    }

    console.log(`\n🌍 GÉOCODAGE DE ${eventsToGeocode.length} ÉVÉNEMENTS SANS COORDONNÉES...`);

    // Géocoder les événements sans coordonnées - UTILISER UNIQUEMENT LE NOM DE VILLE
    const geocodingPromises = eventsToGeocode.map(async (event) => {
      try {
        console.log(`🎯 Géocodage VILLE UNIQUEMENT: "${event.location.city}"`);
        
        // UNIQUEMENT le nom de ville, pas d'adresse ni code postal
        const coords = await GeocodingService.geocodeAddress(
          '',  // Pas d'adresse
          event.location.city,
          undefined  // Pas de code postal
        );

        if (coords) {
          // Mettre à jour l'événement en base avec les nouvelles coordonnées
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

          // Mettre à jour l'objet event en mémoire
          event.location.latitude = coords.lat;
          event.location.longitude = coords.lng;
          event.coordinates = { lat: coords.lat, lng: coords.lng };

          console.log(`✅ GÉOCODÉ: ${event.title} (${event.location.city}) -> ${coords.lat}, ${coords.lng}`);
        } else {
          console.log(`❌ ÉCHEC GÉOCODAGE: ${event.title} (${event.location.city})`);
        }
      } catch (error) {
        console.error(`❌ ERREUR GÉOCODAGE: ${event.title} (${event.location.city}):`, error);
      }
    });

    await Promise.all(geocodingPromises);
    
    console.log(`\n🔍 RÉSULTAT FINAL - ANALYSE DE TOUS LES ÉVÉNEMENTS APRÈS GÉOCODAGE:`);
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      console.log(`📋 ${i + 1}. "${event.title}" - VILLE: ${event.location.city || 'AUCUNE'} - COORDS: ${event.location.latitude || 'AUCUNE'}, ${event.location.longitude || 'AUCUNE'}`);
    }
    
    return events;
  },

  // Filtrer les événements par proximité géographique
  async filterEventsByProximity(
    events: Event[], 
    userLatitude: number, 
    userLongitude: number, 
    radiusKm: number
  ): Promise<(Event & { distance: number; coordinates: { lat: number; lng: number } })[]> {
    console.log(`🌍 Backend: Filtrage géographique activé`, { 
      userLat: userLatitude, 
      userLng: userLongitude, 
      radius: radiusKm,
      totalEvents: events.length
    });

    const nearbyEvents: (Event & { distance: number; coordinates: { lat: number; lng: number } })[] = [];

    console.log(`\n🔍 DEBUG: Analyse détaillée des coordonnées de chaque événement:`);
    
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      let eventLat: number | null = null;
      let eventLng: number | null = null;

      // Debug détaillé pour chaque événement
      console.log(`\n📋 Événement ${i + 1}/${events.length}: "${event.title}"`);
      console.log(`   📍 Ville: ${event.location.city || 'N/A'}`);
      console.log(`   🏠 Adresse: ${event.location.address || 'N/A'}`);
      console.log(`   📦 Location object:`, JSON.stringify(event.location, null, 2));
      
      // Vérifier différents formats de coordonnées
      console.log(`   🎯 Coordonnées dans location:`);
      console.log(`      - latitude: ${event.location.latitude} (type: ${typeof event.location.latitude})`);
      console.log(`      - longitude: ${event.location.longitude} (type: ${typeof event.location.longitude})`);
      console.log(`      - lat: ${(event.location as any).lat} (type: ${typeof (event.location as any).lat})`);
      console.log(`      - lng: ${(event.location as any).lng} (type: ${typeof (event.location as any).lng})`);

      // Vérifier si l'événement a des coordonnées
      if (event.location.latitude && event.location.longitude) {
        eventLat = typeof event.location.latitude === 'string' 
          ? parseFloat(event.location.latitude) 
          : event.location.latitude;
        eventLng = typeof event.location.longitude === 'string' 
          ? parseFloat(event.location.longitude) 
          : event.location.longitude;
          
        console.log(`   ✅ Coordonnées trouvées: ${eventLat}, ${eventLng}`);
      } else if ((event.location as any).lat && (event.location as any).lng) {
        // Fallback pour format alternatif
        eventLat = typeof (event.location as any).lat === 'string' 
          ? parseFloat((event.location as any).lat) 
          : (event.location as any).lat;
        eventLng = typeof (event.location as any).lng === 'string' 
          ? parseFloat((event.location as any).lng) 
          : (event.location as any).lng;
          
        console.log(`   ✅ Coordonnées trouvées (format alternatif): ${eventLat}, ${eventLng}`);
      } else {
        console.log(`   ❌ Aucune coordonnée trouvée pour: ${event.title}`);
        continue;
      }

      // Vérifier que les coordonnées sont valides
      if (eventLat === null || eventLng === null || isNaN(eventLat) || isNaN(eventLng)) {
        console.log(`   ⚠️  Coordonnées invalides (null ou NaN) pour: ${event.title}`);
        continue;
      }

      // Calculer la distance
      const distance = GeocodingService.calculateDistance(
        userLatitude,
        userLongitude,
        eventLat,
        eventLng
      );

      console.log(`   📏 Distance calculée: ${distance.toFixed(2)}km`);

      // Vérifier si dans le rayon
      if (distance <= radiusKm) {
        console.log(`   ✅ Dans le rayon (${radiusKm}km) - AJOUTÉ`);
        nearbyEvents.push({
          ...event,
          distance: Math.round(distance * 100) / 100, // Arrondir à 2 décimales
          coordinates: { lat: eventLat, lng: eventLng }
        });
      } else {
        console.log(`   ❌ Hors rayon (${radiusKm}km) - distance: ${distance.toFixed(2)}km`);
      }
    }

    console.log(`\n📊 RÉSUMÉ:`);
    console.log(`📍 Backend: Total événements analysés: ${events.length}`);
    console.log(`✅ Backend: Événements dans le rayon: ${nearbyEvents.length}`);

    // Trier par distance croissante
    nearbyEvents.sort((a, b) => a.distance - b.distance);

    return nearbyEvents;
  },

  // Algorithme principal de recherche d'événements par localisation
  async findNearbyEvents(
    userLatitude: number,
    userLongitude: number,
    radiusKm: number = 10,
    additionalFilters?: Omit<EventFilters, 'latitude' | 'longitude' | 'radius'>
  ): Promise<Array<Event & { distance: number }>> {
    try {
      console.log(`🎯 Recherche d'événements proches de ${userLatitude}, ${userLongitude} (${radiusKm}km)`);
      
      // 1. Récupérer tous les événements avec filtres de base
      let events = await this.getEvents(additionalFilters);
      console.log(`📋 ${events.length} événements récupérés`);

      // 2. Enrichir avec coordonnées GPS si nécessaire
      events = await this.enrichEventsWithCoordinates(events);
      
      // 3. Filtrer par proximité
      const nearbyEvents = await this.filterEventsByProximity(
        events,
        userLatitude,
        userLongitude,
        radiusKm
      );

      return nearbyEvents;
    } catch (error) {
      console.error('Erreur dans findNearbyEvents:', error);
      throw new Error('Impossible de rechercher les événements proches');
    }
  },

  // Forcer le re-géocodage de tous les événements d'une ville donnée
  async forceRegeocodingByCity(cityName: string): Promise<{ success: number; failed: number; details: string[] }> {
    try {
      console.log(`🔄 Re-géocodage forcé pour la ville: ${cityName}`);
      
      // Rechercher les événements de cette ville
      const events = await this.getEvents({ city: cityName });
      console.log(`📋 ${events.length} événements trouvés pour ${cityName}`);
      
      let successCount = 0;
      let failedCount = 0;
      const details: string[] = [];
      
      for (const event of events) {
        try {
          const coords = await GeocodingService.geocodeAddress(
            event.location.address || '',
            event.location.city,
            event.location.postalCode
          );
          
          if (coords) {
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
            
            successCount++;
            details.push(`✅ ${event.title}: ${coords.lat}, ${coords.lng}`);
            console.log(`✅ Re-géocodé: ${event.title} -> ${coords.lat}, ${coords.lng}`);
          } else {
            failedCount++;
            details.push(`❌ ${event.title}: Géocodage échoué`);
            console.log(`❌ Échec re-géocodage: ${event.title}`);
          }
        } catch (error) {
          failedCount++;
          details.push(`❌ ${event.title}: Erreur - ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
          console.error(`Erreur re-géocodage ${event.title}:`, error);
        }
      }
      
      console.log(`🏁 Re-géocodage terminé: ${successCount} succès, ${failedCount} échecs`);
      return { success: successCount, failed: failedCount, details };
    } catch (error) {
      console.error('Erreur lors du re-géocodage:', error);
      throw new Error('Impossible de re-géocoder les événements');
    }
  },

  // Utilitaire de test du géocodage pour différentes villes françaises
  async testGeocodingWithFrenchCities(): Promise<{ [city: string]: { success: boolean; coords?: { lat: number; lng: number }; error?: string } }> {
    const testCities = [
      // Grandes villes
      'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille',
      // Villes moyennes
      'Rennes', 'Reims', 'Saint-Étienne', 'Le Havre', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne',
      // Petites villes
      'Bourg-en-Bresse', 'Châteauroux', 'Laval', 'Vannes', 'Auxerre', 'Nevers', 'Mâcon', 'Alès', 'Montauban', 'Agen'
    ];
    
    console.log(`🧪 Test de géocodage sur ${testCities.length} villes françaises...`);
    const results: { [city: string]: { success: boolean; coords?: { lat: number; lng: number }; error?: string } } = {};
    
    for (const city of testCities) {
      try {
        console.log(`🔍 Test géocodage: ${city}`);
        const coords = await GeocodingService.geocodeAddress('', city, '', 'France');
        
        if (coords) {
          results[city] = {
            success: true,
            coords: coords
          };
          console.log(`✅ ${city}: ${coords.lat}, ${coords.lng}`);
        } else {
          results[city] = {
            success: false,
            error: 'Aucune coordonnée trouvée'
          };
          console.log(`❌ ${city}: Aucune coordonnée trouvée`);
        }
        
        // Délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results[city] = {
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        };
        console.error(`❌ ${city}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
    
    const successCount = Object.values(results).filter(r => r.success).length;
    const failureCount = Object.values(results).filter(r => !r.success).length;
    
    console.log(`🏁 Test terminé: ${successCount}/${testCities.length} succès (${Math.round(successCount/testCities.length*100)}%)`);
    
    return results;
  },

  // Create a new event
  async createEvent(data: CreateEventForm, userId: string): Promise<Event> {
    try {
      // Ensure we have a valid user - create a default one if needed
      let validUserId = userId;
      
      
      if (userId === 'temp-user-id' || userId === '1') {
        
        // Try to find the specific user first, then any user
        let defaultUser = userId === '1' 
          ? await prisma.user.findUnique({ where: { id: '1' } })
          : await prisma.user.findFirst();
        
        if (!defaultUser) {
          try {
            // Create a default user if none exists
            defaultUser = await prisma.user.create({
              data: {
                ...(userId === '1' && { id: '1' }),
                email: userId === '1' ? 'user1@teamup.com' : 'default@teamup.com',
                username: userId === '1' ? 'user_1' : 'default_user',
                password: 'hashed_password_default',
                profile: {
                  create: {
                    firstName: 'Utilisateur',
                    lastName: 'Par défaut',
                    skillLevel: 'intermediate'
                  }
                }
              }
            });
          } catch (userError) {
            console.error('Error creating default user:', userError);
            // If user creation fails, try to find if one was created in the meantime
            defaultUser = await prisma.user.findFirst();
            if (!defaultUser) {
              throw new Error('Unable to create or find a default user');
            }
          }
        }
        
        validUserId = defaultUser.id;
      }

      // Verify the user exists before creating the event
      const userExists = await prisma.user.findUnique({
        where: { id: validUserId }
      });
      
      if (!userExists) {
        console.error('User does not exist:', validUserId);
        throw new Error(`User with ID ${validUserId} does not exist`);
      }


      // Calculate duration in minutes
      const duration = Math.round((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60));

      // Géocoder automatiquement la localisation si nécessaire
      let locationData = data.location;
      if (data.location.city && (!data.location.latitude || !data.location.longitude)) {
        console.log(`🌍 GÉOCODAGE AUTOMATIQUE VILLE UNIQUEMENT: "${data.location.city}"`);
        
        // UTILISER UNIQUEMENT LE NOM DE VILLE
        const coords = await GeocodingService.geocodeAddress(
          '',  // Pas d'adresse
          data.location.city,
          undefined  // Pas de code postal
        );
        
        if (coords) {
          locationData = {
            ...data.location,
            latitude: coords.lat,
            longitude: coords.lng
          };
          console.log(`✅ ÉVÉNEMENT GÉOCODÉ: "${data.location.city}" -> ${coords.lat}, ${coords.lng}`);
        } else {
          console.log(`❌ GÉOCODAGE ÉCHOUÉ POUR: "${data.location.city}"`);
        }
      }

      const prismaEvent = await prisma.event.create({
        data: {
          title: data.title,
          description: data.description || null,
          sport: data.sport,
          date: data.startDate,
          startTime: data.startDate.toTimeString().slice(0, 5), // HH:mm format
          duration: duration,
          location: JSON.stringify(locationData),
          maxParticipants: data.maxParticipants,
          minParticipants: data.minParticipants,
          skillLevel: [data.level],
          status: 'active',
          // price: data.price || null, // Champ temporairement désactivé - migration Prisma requise
          // equipment: data.equipment || [], // Champ temporairement désactivé - migration Prisma requise
          creatorId: validUserId,
          // Automatically add creator as participant
          participants: {
            create: {
              userId: validUserId,
              status: 'confirmed'
            }
          }
        },
        select: {
          id: true,
          title: true,
          description: true,
          sport: true,
          date: true,
          startTime: true,
          duration: true,
          location: true,
          maxParticipants: true,
          minParticipants: true,
          skillLevel: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          creatorId: true,
          creator: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      avatar: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Import MessageService dynamically to avoid circular dependencies
      const { MessageService } = await import('./messageService');
      
      // Create event conversation and add creator as participant
      await MessageService.syncEventConversationParticipants(prismaEvent.id);

      return transformPrismaEvent(prismaEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  },

  // Update an event
  async updateEvent(id: string, data: Partial<CreateEventForm>): Promise<Event | null> {
    try {
      const updateData: any = {
        updatedAt: new Date()
      };

      if (data.title) updateData.title = data.title;
      if (data.description) updateData.description = data.description;
      if (data.sport) updateData.sport = data.sport;
      if (data.location) updateData.location = JSON.stringify(data.location);
      if (data.maxParticipants) updateData.maxParticipants = data.maxParticipants;
      if (data.minParticipants) updateData.minParticipants = data.minParticipants;
      if (data.level) updateData.skillLevel = [data.level];
      if (data.startDate) {
        updateData.date = data.startDate;
        updateData.startTime = data.startDate.toTimeString().slice(0, 5);
      }
      if (data.startDate && data.endDate) {
        updateData.duration = Math.round((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60));
      }
      // if (data.price !== undefined) updateData.price = data.price; // Champ temporairement désactivé - migration Prisma requise
      // if (data.equipment !== undefined) updateData.equipment = data.equipment; // Champ temporairement désactivé - migration Prisma requise

      const prismaEvent = await prisma.event.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          title: true,
          description: true,
          sport: true,
          date: true,
          startTime: true,
          duration: true,
          location: true,
          maxParticipants: true,
          minParticipants: true,
          skillLevel: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          creatorId: true,
          creator: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      avatar: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      return transformPrismaEvent(prismaEvent);
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  },

  // Delete an event
  async deleteEvent(id: string): Promise<boolean> {
    try {
      await prisma.event.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  },

  // Join an event
  async joinEvent(eventId: string, userId: string): Promise<Event | null> {
    try {
      // Check if user already joined
      const existingParticipation = await prisma.eventParticipation.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId
          }
        }
      });

      if (existingParticipation) {
        // User already joined, return current event
        return this.getEventById(eventId);
      }

      // Check if event is full
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          participants: true
        }
      });

      if (!event) return null;

      if (event.participants.length >= event.maxParticipants) {
        throw new Error('Event is full');
      }

      // Add participant
      await prisma.eventParticipation.create({
        data: {
          eventId,
          userId,
          status: 'confirmed'
        }
      });

      // Import MessageService dynamically to avoid circular dependencies
      const { MessageService } = await import('./messageService');
      
      // Sync event conversation participants (adds user to conversation)
      await MessageService.syncEventConversationParticipants(eventId);

      return this.getEventById(eventId);
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  },

  // Leave an event
  async leaveEvent(eventId: string, userId: string): Promise<Event | null> {
    try {
      await prisma.eventParticipation.delete({
        where: {
          eventId_userId: {
            eventId,
            userId
          }
        }
      });

      return this.getEventById(eventId);
    } catch (error) {
      console.error('Error leaving event:', error);
      return null;
    }
  }
};
