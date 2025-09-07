import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/backend/services/messageService';
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/auth';

// GET: Obtenir toutes les conversations de l'utilisateur
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const conversations = await MessageService.getUserConversations(req.user.id);
      return NextResponse.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

// POST: Créer ou obtenir une conversation directe
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { userId } = await req.json();
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }

      const conversation = await MessageService.getOrCreateDirectConversation(
        req.user.id,
        userId
      );
      return NextResponse.json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
