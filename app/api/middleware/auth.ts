import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { UserService } from '@/backend/services/userService';
import { User as PrismaUser, UserProfile } from '@prisma/client';

export interface AuthenticatedRequest extends NextRequest {
  user?: PrismaUser & {
    profile: UserProfile | null;
  };
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  try {
    // Get token from cookie or header
    const cookieToken = request.cookies.get('auth-token')?.value;
    const headerToken = AuthService.extractTokenFromHeader(request.headers.get('authorization') || '');
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = AuthService.verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await UserService.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Add user to request
    (request as AuthenticatedRequest).user = user;

    // Call the handler
    return handler(request as AuthenticatedRequest);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
