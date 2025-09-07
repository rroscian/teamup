import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/backend/services/messageService';
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/auth';

// POST: Marquer les messages comme lus
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
      await MessageService.markMessagesAsRead(conversationId, req.user.id);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
