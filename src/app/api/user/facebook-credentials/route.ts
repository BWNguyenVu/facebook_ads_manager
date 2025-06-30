import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { encrypt, decrypt, maskCredential } from '@/lib/encryption';
import { createLogger } from '@/lib/logger';

const logger = createLogger('FacebookCredentialsAPI');

export async function POST(request: NextRequest) {
  try {
    logger.apiRequest('POST', '/api/user/facebook-credentials');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.securityEvent('Missing or invalid authorization header');
      return NextResponse.json(
        { success: false, message: 'Authentication token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      logger.securityEvent('Token verification failed');
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    logger.userAction(decoded.userId, 'Saving Facebook credentials');

    const requestBody = await request.json();
    logger.debug('Request body received', {
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
      logger.warn('Validation failed: missing required fields');
      return NextResponse.json(
        { success: false, message: 'App ID and App Secret are required' },
        { status: 400 }
      );
    }

    // Prepare credentials object with encryption for sensitive data
    const credentials: any = {
      facebook_app_id: facebook_app_id.trim(),
      facebook_app_secret: encrypt(facebook_app_secret.trim()),
    };

    // Add optional fields if provided
    if (facebook_short_lived_token) {
      credentials.facebook_short_lived_token = encrypt(facebook_short_lived_token.trim());
    }
    
    if (long_lived_token) {
      credentials.long_lived_token = encrypt(long_lived_token.trim());
    }
    
    if (token_expires_at) {
      credentials.token_expires_at = new Date(token_expires_at);
    }

    logger.debug('Credentials prepared for save', {
      facebook_app_id: credentials.facebook_app_id,
      has_facebook_app_secret: !!credentials.facebook_app_secret,
      has_facebook_short_lived_token: !!credentials.facebook_short_lived_token,
      has_long_lived_token: !!credentials.long_lived_token,
      token_expires_at: credentials.token_expires_at
    });

    // Update user's Facebook credentials
    try {
      const updated = await userService.updateFacebookCredentials(decoded.userId, credentials);
      logger.debug('Database update result', { updated });

      if (!updated) {
        logger.warn('Database update failed - no documents modified');
        return NextResponse.json(
          { success: false, message: 'Failed to save credentials - user not found or no changes made' },
          { status: 500 }
        );
      }
    } catch (dbError) {
      logger.error('Database operation failed', dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      return NextResponse.json(
        { success: false, message: `Database error: ${errorMessage}` },
        { status: 500 }
      );
    }

    logger.info('Credentials saved successfully', { userId: decoded.userId });
    return NextResponse.json({
      success: true,
      message: 'Facebook credentials saved successfully',
    });

  } catch (error) {
    logger.error('Save credentials error', error);
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

    // Get user's Facebook credentials
    const credentials = await userService.getFacebookCredentials(decoded.userId);

    if (!credentials) {
      return NextResponse.json({
        success: true,
        data: {
          facebook_app_id: '',
          facebook_app_secret_masked: '',
          facebook_short_lived_token_masked: '',
          long_lived_token: '',
          token_expires_at: null,
          has_credentials: false,
          has_app_id: false,
          has_app_secret: false,
          has_short_token: false,
          has_long_token: false,
        },
      });
    }

    // Decrypt and mask sensitive data for frontend display
    let appSecret = '';
    let shortToken = '';
    let longToken = '';

    try {
      if (credentials.facebook_app_secret) {
        appSecret = decrypt(credentials.facebook_app_secret);
      }
      if (credentials.facebook_short_lived_token) {
        shortToken = decrypt(credentials.facebook_short_lived_token);
      }
      if (credentials.long_lived_token) {
        longToken = decrypt(credentials.long_lived_token);
      }
    } catch (error) {
      logger.error('Error decrypting credentials', error);
    }

    // Return credentials with masked sensitive data for security
    return NextResponse.json({
      success: true,
      data: {
        facebook_app_id: credentials.facebook_app_id || '',
        facebook_app_secret_masked: appSecret ? maskCredential(appSecret) : '',
        facebook_short_lived_token_masked: shortToken ? maskCredential(shortToken) : '',
        long_lived_token: longToken,
        token_expires_at: credentials.token_expires_at,
        has_credentials: !!(credentials.facebook_app_id && credentials.facebook_app_secret),
        has_app_id: !!credentials.facebook_app_id,
        has_app_secret: !!credentials.facebook_app_secret,
        has_short_token: !!credentials.facebook_short_lived_token,
        has_long_token: !!credentials.long_lived_token,
        token_valid: credentials.token_expires_at ? new Date(credentials.token_expires_at) > new Date() : false,
      },
    });

  } catch (error) {
    logger.error('Get credentials error', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
