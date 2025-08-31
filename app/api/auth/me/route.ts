import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/auth';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const user = req.user;
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }
    
    // Convert Prisma user to our User type format
    const responseUser = {
      id: user.id,
      email: user.email,
      name: user.username,
      avatar: user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      profile: user.profile ? {
        favoriteSports: user.profile.sports,
        skillLevels: user.profile.skillLevel ? [{
          sport: user.profile.sports[0] || '',
          level: user.profile.skillLevel as 'beginner' | 'intermediate' | 'advanced'
        }] : [],
        availability: {
          weekdays: [],
          preferredTimes: user.profile.availability.map((avail: string) => {
            const [startTime, endTime] = avail.split('-');
            return { startTime, endTime };
          })
        },
        bio: user.profile.bio || undefined,
        location: user.profile.location ? {
          city: typeof user.profile.location === 'string' ? user.profile.location : (user.profile.location as { city: string; postalCode?: string }).city,
          postalCode: typeof user.profile.location === 'object' ? (user.profile.location as { city: string; postalCode?: string }).postalCode : undefined
        } : undefined,
        notifications: {
          events: true,
          messages: true,
          reminders: true
        }
      } : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json({ user: responseUser });
  });
}
