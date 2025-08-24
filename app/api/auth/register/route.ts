import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/backend/services/userService';
import { UserRegistration } from '@/shared/types';

export async function POST(request: NextRequest) {
  try {
    const registrationData: UserRegistration = await request.json();

    // Validate required fields
    if (!registrationData.email || !registrationData.password || !registrationData.name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Register the user
    const newUser = await UserService.register(registrationData);
    
    return NextResponse.json({
      user: newUser,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    
    if (errorMessage === 'User with this email already exists') {
      return NextResponse.json(
        { error: errorMessage },
        { status: 409 } // Conflict
      );
    }
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
