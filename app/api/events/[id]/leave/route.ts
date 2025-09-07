import { NextRequest, NextResponse } from 'next/server';
import { eventServiceServer } from '@/backend/services/eventService.server';
import { requireAuth } from '@/lib/auth-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const user = await requireAuth(request);
    
    const { id } = await params;
    const event = await eventServiceServer.leaveEvent(id, user.id);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error leaving event:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to leave event' },
      { status: 500 }
    );
  }
}
