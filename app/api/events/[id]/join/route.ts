import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/backend/services/eventService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Get actual user ID from authentication
    const userId = '1'; // Mock user ID for now
    
    const { id } = await params;
    const event = await eventService.joinEvent(id, userId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error joining event:', error);
    
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
