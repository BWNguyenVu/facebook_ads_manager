import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Facebook Credentials Save API Called ===');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header');
      return NextResponse.json(
        { success: false, message: 'Authentication token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('Token verification failed');
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', decoded.userId);

    const requestBody = await request.json();
    console.log('Request body received:', {
      has_app_id: !!requestBody.facebook_app_id,
      has_app_secret: !!requestBody.facebook_app_secret,
      has_short_token: !!requestBody.facebook_short_lived_token,
      has_long_token: !!requestBody.long_lived_token
    });

    const { 
      facebook_app_id, 
      facebook_app_secret, 
      facebook_short_lived_token,
      long_lived_token,
      token_expires_at 
    } = requestBody;

    // Validate required fields
    if (!facebook_app_id || !facebook_app_secret) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { success: false, message: 'App ID and App Secret are required' },
        { status: 400 }
      );
    }

    // Prepare credentials object
    const credentials: any = {
      facebook_app_id: facebook_app_id.trim(),
      facebook_app_secret: facebook_app_secret.trim(),
    };

    // Add optional fields if provided
    if (facebook_short_lived_token) {
      credentials.facebook_short_lived_token = facebook_short_lived_token.trim();
    }
    
    if (long_lived_token) {
      credentials.long_lived_token = long_lived_token.trim();
    }
    
    if (token_expires_at) {
      credentials.token_expires_at = new Date(token_expires_at);
    }

    console.log('Credentials prepared for save:', {
      facebook_app_id: credentials.facebook_app_id,
      has_facebook_app_secret: !!credentials.facebook_app_secret,
      has_facebook_short_lived_token: !!credentials.facebook_short_lived_token,
      has_long_lived_token: !!credentials.long_lived_token,
      token_expires_at: credentials.token_expires_at
    });

    // Update user's Facebook credentials
    try {
      const updated = await userService.updateFacebookCredentials(decoded.userId, credentials);
      console.log('Database update result:', updated);

      if (!updated) {
        console.log('Database update failed - no documents modified');
        return NextResponse.json(
          { success: false, message: 'Failed to save credentials - user not found or no changes made' },
          { status: 500 }
        );
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      return NextResponse.json(
        { success: false, message: `Database error: ${errorMessage}` },
        { status: 500 }
      );
    }

    console.log('Credentials saved successfully');
    return NextResponse.json({
      success: true,
      message: 'Facebook credentials saved successfully',
    });

  } catch (error) {
    console.error('Save credentials error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

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

    // Get user's Facebook credentials (excluding sensitive data in response)
    const credentials = await userService.getFacebookCredentials(decoded.userId);

    if (!credentials) {
      return NextResponse.json({
        success: true,
        data: {
          facebook_app_id: '',
          long_lived_token: '',
          token_expires_at: null,
          has_credentials: false,
        },
      });
    }

    // Return credentials with app_secret masked for security
    return NextResponse.json({
      success: true,
      data: {
        facebook_app_id: credentials.facebook_app_id || '',
        facebook_app_secret: credentials.facebook_app_secret ? '••••••••' : '',
        facebook_short_lived_token: credentials.facebook_short_lived_token ? '••••••••' : '',
        long_lived_token: credentials.long_lived_token || '',
        token_expires_at: credentials.token_expires_at,
        has_credentials: !!(credentials.facebook_app_id && credentials.facebook_app_secret),
        token_valid: credentials.token_expires_at ? new Date(credentials.token_expires_at) > new Date() : false,
      },
    });

  } catch (error) {
    console.error('Get credentials error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
