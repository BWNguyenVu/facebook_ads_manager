import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Test database connection and user lookup
    const user = await userService.findByEmail(decoded.email);
    
    return NextResponse.json({
      success: true,
      debug: {
        decoded_user_id: decoded.userId,
        decoded_email: decoded.email,
        user_found: !!user,
        user_id_from_db: user?._id,
        user_email_from_db: user?.email,
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: `Debug error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
