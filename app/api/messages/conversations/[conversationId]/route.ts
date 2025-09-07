import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/backend/services/messageService';
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/auth';

// GET: Obtenir les messages d'une conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { conversationId } = await params;
      const searchParams = req.nextUrl.searchParams;
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const messages = await MessageService.getConversationMessages(
        conversationId,
        req.user.id,
        limit,
        offset
      );
      return NextResponse.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // Handle authorization errors more gracefully
      if (error instanceof Error && error.message.includes('Unauthorized: User is not part of this conversation')) {
        return NextResponse.json({ error: 'Access denied to this conversation' }, { status: 403 });
      }
      
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

// POST: Envoyer un message dans une conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { conversationId } = await params;
      const { content } = await req.json();
      if (!content) {
        return NextResponse.json({ error: 'Content is required' }, { status: 400 });
      }

      const message = await MessageService.sendMessage(
        req.user.id,
        conversationId,
        content
      );
      return NextResponse.json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Handle authorization errors more gracefully
      if (error instanceof Error && error.message.includes('Unauthorized: User is not part of this conversation')) {
        return NextResponse.json({ error: 'Access denied to this conversation' }, { status: 403 });
      }
      
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
