import { NextRequest, NextResponse } from 'next/server';
import { eventServiceServer, EventFilters } from '@/backend/services/eventService.server';
import { Sport, SkillLevel, EventStatus } from '@/shared/types';
import { requireAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters from query params
    const filters: EventFilters = {};
    
    const sport = searchParams.get('sport');
    if (sport && Object.values(Sport).includes(sport as Sport)) {
      filters.sport = sport as Sport;
    }
    
    const city = searchParams.get('city');
    if (city) {
      filters.city = city;
    }
    
    const level = searchParams.get('level');
    if (level && Object.values(SkillLevel).includes(level as SkillLevel)) {
      filters.level = level as SkillLevel;
    }
    
    const status = searchParams.get('status');
    if (status && Object.values(EventStatus).includes(status as EventStatus)) {
      filters.status = status as EventStatus;
    }
    
    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) {
      filters.maxPrice = parseFloat(maxPrice);
    }
    
    const startDate = searchParams.get('startDate');
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    
    const endDate = searchParams.get('endDate');
    if (endDate) {
      filters.endDate = new Date(endDate);
    }
    
    // Special endpoints
    const upcoming = searchParams.get('upcoming');
    if (upcoming === 'true') {
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const events = await eventServiceServer.getEvents({
        startDate: now,
        endDate: thirtyDaysFromNow,
        status: EventStatus.Published
      });
      return NextResponse.json(events);
    }
    
    // Get events with filters
    const events = await eventServiceServer.getEvents(filters);
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth(request);
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.sport || !body.location || !body.maxParticipants || 
        !body.minParticipants || !body.level || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Convert date strings to Date objects
    body.startDate = new Date(body.startDate);
    body.endDate = new Date(body.endDate);
    
    // Create the event
    const newEvent = await eventServiceServer.createEvent(body, user.id);
    
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
