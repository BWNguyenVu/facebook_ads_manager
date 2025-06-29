import { NextRequest, NextResponse } from 'next/server';
import { exchangeForLongLivedToken } from '@/lib/auth';
import { validateFacebookToken, getFacebookUserInfo } from '@/lib/facebookApi';

export async function POST(request: NextRequest) {
  try {
    const { short_lived_token, app_id, app_secret } = await request.json();

    if (!short_lived_token) {
      return NextResponse.json(
        { success: false, message: 'Short-lived token is required' },
        { status: 400 }
      );
    }

    // Use provided app_id and app_secret or fallback to env vars
    const appId = app_id || process.env.FACEBOOK_APP_ID;
    const appSecret = app_secret || process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      return NextResponse.json(
        { success: false, message: 'Facebook App ID and Secret are required' },
        { status: 400 }
      );
    }

    // Validate the short-lived token first
    const isValid = await validateFacebookToken(short_lived_token);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid Facebook token' },
        { status: 400 }
      );
    }

    // Get user info with the short-lived token
    const userInfo = await getFacebookUserInfo(short_lived_token);
    if (!userInfo) {
      return NextResponse.json(
        { success: false, message: 'Could not retrieve user information' },
        { status: 400 }
      );
    }

    // Exchange for long-lived token with provided credentials
    const longLivedTokenData = await exchangeForLongLivedToken(short_lived_token, appId, appSecret);
    if (!longLivedTokenData) {
      return NextResponse.json(
        { success: false, message: 'Could not exchange for long-lived token' },
        { status: 500 }
      );
    }

    const expiresAt = new Date(Date.now() + longLivedTokenData.expires_in * 1000);

    return NextResponse.json({
      success: true,
      message: 'Token exchanged successfully',
      access_token: longLivedTokenData.access_token,
      token_type: longLivedTokenData.token_type,
      expires_in: longLivedTokenData.expires_in,
      expires_at: expiresAt.toISOString(),
      user_info: userInfo,
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
