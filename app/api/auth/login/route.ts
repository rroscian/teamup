import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/backend/services/userService';
import jwt from 'jsonwebtoken';
import { loginSchema, validateData } from '@/backend/middleware/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validation = validateData(loginSchema, body);
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { email, password } = validation.data!;

    // Authenticate user
    const user = await UserService.authenticate(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

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
          preferredTimes: user.profile.availability
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

    // Set cookie with the token
    const response = NextResponse.json({
      user: responseUser,
      token,
      message: 'Login successful'
    });

    // Set HTTP-only cookie for security
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
