import { NextRequest, NextResponse } from 'next/server';
import { eventServiceServer, EventFilters } from '@/backend/services/eventService.server';
import { Sport, SkillLevel, EventStatus } from '@/shared/types';
import { requireAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    console.log('🔍 API Events: GET request avec params:', Object.fromEntries(searchParams.entries()));
    
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
    
    // Géolocalisation
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = searchParams.get('radius');
    console.log('🌍 API Events: Paramètres géo reçus:', { latitude, longitude, radius });
    if (latitude && longitude) {
      filters.latitude = parseFloat(latitude);
      filters.longitude = parseFloat(longitude);
      if (radius) {
        filters.radius = parseFloat(radius);
      }
      console.log('✅ API Events: Filtres géo parsés:', { 
        latitude: filters.latitude, 
        longitude: filters.longitude, 
        radius: filters.radius 
      });
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
    console.log('📋 API Events: Filtres finaux envoyés au service:', filters);
    
    // Si coordonnées géographiques fournies, utiliser findNearbyEvents
    if (filters.latitude && filters.longitude) {
      console.log('🎯 API Events: Utilisation de findNearbyEvents avec géolocalisation');
      const nearbyEvents = await eventServiceServer.findNearbyEvents(
        filters.latitude,
        filters.longitude,
        filters.radius || 10,
        {
          sport: filters.sport,
          level: filters.level,
          city: filters.city,
          status: filters.status,
          startDate: filters.startDate,
          endDate: filters.endDate
        }
      );
      console.log('📦 API Events: Événements proches retournés:', nearbyEvents.length);
      return NextResponse.json(nearbyEvents);
    } else {
      // Sinon, utiliser getEvents normal
      const events = await eventServiceServer.getEvents(filters);
      console.log('📦 API Events: Événements retournés:', events.length);
      return NextResponse.json(events);
    }
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
