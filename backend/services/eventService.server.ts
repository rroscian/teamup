import { Event, EventStatus, Sport, SkillLevel, LocationType } from '@/shared/types';
import { prisma } from '@/lib/prisma';

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
    price: 0, // Not in current schema, defaulting to 0
    equipment: [], // Not in current schema
    skillLevel: prismaEvent.skillLevel || [SkillLevel.Mixed]
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

  // Create a new event
  async createEvent(data: CreateEventForm, userId: string): Promise<Event> {
    try {
      // Ensure we have a valid user - create a default one if needed
      let validUserId = userId;
      
      console.log('createEvent called with userId:', userId);
      
      if (userId === 'temp-user-id' || userId === '1') {
        console.log('Creating/finding user for ID:', userId);
        
        // Try to find the specific user first, then any user
        let defaultUser = userId === '1' 
          ? await prisma.user.findUnique({ where: { id: '1' } })
          : await prisma.user.findFirst();
        console.log('Found existing user:', defaultUser?.id);
        
        if (!defaultUser) {
          console.log('No user found, creating default user...');
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
            console.log('Created default user:', defaultUser.id);
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
        console.log('Using validUserId:', validUserId);
      }

      // Verify the user exists before creating the event
      const userExists = await prisma.user.findUnique({
        where: { id: validUserId }
      });
      
      if (!userExists) {
        console.error('User does not exist:', validUserId);
        throw new Error(`User with ID ${validUserId} does not exist`);
      }

      console.log('Creating event with validUserId:', validUserId);

      // Calculate duration in minutes
      const duration = Math.round((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60));

      const prismaEvent = await prisma.event.create({
        data: {
          title: data.title,
          description: data.description || null,
          sport: data.sport,
          date: data.startDate,
          startTime: data.startDate.toTimeString().slice(0, 5), // HH:mm format
          duration: duration,
          location: JSON.stringify(data.location),
          maxParticipants: data.maxParticipants,
          minParticipants: data.minParticipants,
          skillLevel: [data.level],
          status: 'active',
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
