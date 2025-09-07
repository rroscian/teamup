import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/backend/services/userService';
import { UserRegistration } from '@/shared/types';
import { registerSchema, validateData } from '@/backend/middleware/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Registration request body:', JSON.stringify(body, null, 2));
    
    // Validate input data
    const validation = validateData(registerSchema, body);
    if (validation.error) {
      console.error('Validation error:', validation.error);
      return NextResponse.json(
        { 
          success: false,
          error: {
            message: validation.error,
            code: 'VALIDATION_ERROR'
          }
        },
        { status: 400 }
      );
    }
    
    console.log('Validation passed, creating user...');
    
    // Create user (cast validated data to UserRegistration type)
    const user = await UserService.register(validation.data as UserRegistration);
    console.log('User created successfully:', { id: user.id, email: user.email });
    
    return NextResponse.json({
      success: true,
      data: user,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    
    if (errorMessage === 'User with this email already exists') {
      return NextResponse.json(
        { 
          success: false,
          error: {
            message: errorMessage,
            code: 'EMAIL_EXISTS'
          }
        },
        { status: 409 } // Conflict
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          message: 'Registration failed',
          code: 'REGISTRATION_ERROR'
        }
      },
      { status: 500 }
    );
  }
}
