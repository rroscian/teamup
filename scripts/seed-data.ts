// Script pour initialiser des données d'exemple
// Utilisable pour tester l'application

import { prisma } from '../lib/prisma';

export async function seedData() {
  try {
    // Nettoyer les données existantes
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.eventParticipation.deleteMany();
    await prisma.event.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();

    // Créer des utilisateurs d'exemple
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'alice.martin@example.com',
          username: 'alice_martin',
          password: 'hashed_password_123',
          profile: {
            create: {
              firstName: 'Alice',
              lastName: 'Martin',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
              sports: ['Football', 'Basketball'],
              skillLevel: 'intermediate'
            }
          }
        }
      }),
      prisma.user.create({
        data: {
          email: 'bob.dubois@example.com',
          username: 'bob_dubois',
          password: 'hashed_password_456',
          profile: {
            create: {
              firstName: 'Bob',
              lastName: 'Dubois',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
              sports: ['Tennis', 'Swimming'],
              skillLevel: 'advanced'
            }
          }
        }
      }),
      prisma.user.create({
        data: {
          email: 'claire.durand@example.com',
          username: 'claire_durand',
          password: 'hashed_password_789',
          profile: {
            create: {
              firstName: 'Claire',
              lastName: 'Durand',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=claire',
              sports: ['Yoga', 'Running'],
              skillLevel: 'beginner'
            }
          }
        }
      })
    ]);

    // Créer des événements d'exemple
    const events = await Promise.all([
      prisma.event.create({
        data: {
          title: 'Match de Football',
          description: 'Match amical de football au parc',
          sport: 'Football',
          date: new Date('2024-01-15'),
          startTime: '14:00',
          duration: 90,
          location: { address: 'Parc Municipal', coordinates: [48.8566, 2.3522] },
          maxParticipants: 22,
          minParticipants: 10,
          skillLevel: ['beginner', 'intermediate'],
          creatorId: users[0].id
        }
      }),
      prisma.event.create({
        data: {
          title: 'Session Tennis',
          description: 'Entraînement tennis doubles',
          sport: 'Tennis',
          date: new Date('2024-01-20'),
          startTime: '10:00',
          duration: 120,
          location: { address: 'Club Tennis Centre', coordinates: [48.8566, 2.3522] },
          maxParticipants: 4,
          minParticipants: 2,
          skillLevel: ['intermediate', 'advanced'],
          creatorId: users[1].id
        }
      })
    ]);

    // Ajouter des participations
    await Promise.all([
      // Event 1 participations
      prisma.eventParticipation.create({
        data: {
          eventId: events[0].id,
          userId: users[1].id,
          status: 'ACCEPTED'
        }
      }),
      prisma.eventParticipation.create({
        data: {
          eventId: events[0].id,
          userId: users[2].id,
          status: 'PENDING'
        }
      }),
      // Event 2 participations
      prisma.eventParticipation.create({
        data: {
          eventId: events[1].id,
          userId: users[0].id,
          status: 'ACCEPTED'
        }
      })
    ]);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des données :', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exporter pour utilisation dans l'API
export default seedData;
