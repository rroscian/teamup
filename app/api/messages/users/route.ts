import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/backend/services/messageService';
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/auth';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const searchParams = req.nextUrl.searchParams;
      const query = searchParams.get('q') || '';

      if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
      }

      const users = await MessageService.searchUsers(query, req.user.id);
      return NextResponse.json(users);
    } catch (error) {
      console.error('Error searching users:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
