import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Create user
    const user = await userService.createUser({
      email,
      password,
      full_name,
      role: role || 'user',
    });

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: userResponse,
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
