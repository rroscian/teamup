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
    const event = await eventService.leaveEvent(id, userId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error leaving event:', error);
    return NextResponse.json(
      { error: 'Failed to leave event' },
      { status: 500 }
    );
  }
}
