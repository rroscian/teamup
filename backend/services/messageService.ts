import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class MessageService {
  // Rechercher des utilisateurs (exclut l'utilisateur actuel)
  static async searchUsers(query: string, currentUserId: string) {
    return await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: currentUserId
            }
          },
          {
            OR: [
              {
                username: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                profile: {
                  OR: [
                    {
                      firstName: {
                        contains: query,
                        mode: 'insensitive'
                      }
                    },
                    {
                      lastName: {
                        contains: query,
                        mode: 'insensitive'
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      },
      include: {
        profile: true
      },
      take: 10 // Limiter à 10 résultats
    });
  }

  // Obtenir ou créer une conversation d'événement
  static async getOrCreateEventConversation(eventId: string, eventTitle: string) {
    // Vérifier si une conversation d'événement existe déjà
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        type: 'event',
        eventId: eventId
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Créer une nouvelle conversation d'événement
    return await prisma.conversation.create({
      data: {
        type: 'event',
        eventId: eventId
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        messages: true
      }
    });
  }

  // Ajouter un participant à une conversation d'événement
  static async addParticipantToEventConversation(conversationId: string, userId: string) {
    // Vérifier si l'utilisateur est déjà participant
    const existingParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId
      }
    });

    if (existingParticipant) {
      return existingParticipant;
    }

    // Ajouter le participant
    return await prisma.conversationParticipant.create({
      data: {
        conversationId,
        userId
      }
    });
  }

  // Synchroniser les participants d'un événement avec sa conversation
  static async syncEventConversationParticipants(eventId: string) {
    // Récupérer l'événement avec tous ses participants
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: true
      }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Obtenir ou créer la conversation de l'événement
    const conversation = await this.getOrCreateEventConversation(eventId, event.title);

    // Récupérer tous les utilisateurs qui devraient être dans la conversation
    // (créateur + tous les participants confirmés)
    const userIds = [
      event.creatorId,
      ...event.participants
        .filter(p => p.status === 'confirmed')
        .map(p => p.userId)
    ];

    // Ajouter chaque utilisateur à la conversation s'il n'y est pas déjà
    for (const userId of userIds) {
      await this.addParticipantToEventConversation(conversation.id, userId);
    }

    return conversation;
  }

  // Obtenir ou créer une conversation directe entre deux utilisateurs
  static async getOrCreateDirectConversation(userId1: string, userId2: string) {
    // Vérifier si une conversation directe existe déjà
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        type: 'direct',
        AND: [
          {
            participants: {
              some: {
                userId: userId1
              }
            }
          },
          {
            participants: {
              some: {
                userId: userId2
              }
            }
          }
        ]
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Créer une nouvelle conversation
    return await prisma.conversation.create({
      data: {
        type: 'direct',
        participants: {
          create: [
            { userId: userId1 },
            { userId: userId2 }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        messages: true
      }
    });
  }

  // Obtenir toutes les conversations d'un utilisateur
  static async getUserConversations(userId: string) {
    return await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Récupérer uniquement le dernier message
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  // Obtenir les messages d'une conversation
  static async getConversationMessages(conversationId: string, userId: string, limit = 50, offset = 0) {
    // Vérifier que l'utilisateur fait partie de la conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId
      }
    });

    if (!participant) {
      throw new Error('Unauthorized: User is not part of this conversation');
    }

    // Mettre à jour lastReadAt
    await prisma.conversationParticipant.update({
      where: {
        id: participant.id
      },
      data: {
        lastReadAt: new Date()
      }
    });

    // Récupérer les messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false
      },
      include: {
        sender: {
          include: {
            profile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    return messages.reverse(); // Inverser pour avoir l'ordre chronologique
  }

  // Envoyer un message
  static async sendMessage(senderId: string, conversationId: string, content: string) {
    // Vérifier que l'utilisateur fait partie de la conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: senderId
      }
    });

    if (!participant) {
      throw new Error('Unauthorized: User is not part of this conversation');
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        conversationId
      },
      include: {
        sender: {
          include: {
            profile: true
          }
        }
      }
    });

    // Mettre à jour la conversation
    await prisma.conversation.update({
      where: {
        id: conversationId
      },
      data: {
        updatedAt: new Date()
      }
    });

    return message;
  }

  // Marquer les messages comme lus
  static async markMessagesAsRead(conversationId: string, userId: string) {
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId
      }
    });

    if (!participant) {
      throw new Error('Unauthorized: User is not part of this conversation');
    }

    await prisma.conversationParticipant.update({
      where: {
        id: participant.id
      },
      data: {
        lastReadAt: new Date()
      }
    });
  }

  // Obtenir le nombre de messages non lus
  static async getUnreadCount(userId: string) {
    const conversations = await prisma.conversationParticipant.findMany({
      where: {
        userId
      }
    });

    let unreadCount = 0;
    for (const participant of conversations) {
      const unreadMessages = await prisma.message.count({
        where: {
          conversationId: participant.conversationId,
          senderId: {
            not: userId
          },
          createdAt: {
            gt: participant.lastReadAt
          }
        }
      });
      unreadCount += unreadMessages;
    }

    return unreadCount;
  }
}
