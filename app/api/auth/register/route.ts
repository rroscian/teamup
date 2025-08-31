import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/backend/services/userService';
import { UserRegistration } from '@/shared/types';
import { registerSchema, validateData } from '@/backend/middleware/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validation = validateData(registerSchema, body);
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Create user (cast validated data to UserRegistration type)
    const user = await UserService.register(validation.data as UserRegistration);
    
    return NextResponse.json({
      user: user,
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
