import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/backend/services/eventService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get actual user ID from authentication
    const userId = '1'; // Mock user ID for now
    
    const event = await eventService.joinEvent(params.id, userId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event);
  } catch (error: any) {
    console.error('Error joining event:', error);
    
    if (error.message === 'Event is full') {
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
