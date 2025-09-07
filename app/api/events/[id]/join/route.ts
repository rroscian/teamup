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
    const event = await eventServiceServer.joinEvent(id, user.id);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error joining event:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to join event';
    
    if (errorMessage === 'Event is full') {
      return NextResponse.json(
        { error: 'Event is full' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to join event' },
      { status: 500 }
    );
  }
}
