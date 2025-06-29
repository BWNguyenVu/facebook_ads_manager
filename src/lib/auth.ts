import jwt from 'jsonwebtoken';
import { UserSession } from '@/types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export async function getSessionFromRequest(request: Request): Promise<UserSession | null> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  return {
    user_id: payload.userId,
    email: payload.email,
    role: payload.role,
  };
}

// Facebook token exchange utilities
export async function exchangeForLongLivedToken(
  shortLivedToken: string, 
  appId?: string, 
  appSecret?: string
): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
} | null> {
  const facebookAppId = appId || process.env.FACEBOOK_APP_ID;
  const facebookAppSecret = appSecret || process.env.FACEBOOK_APP_SECRET;

  if (!facebookAppId || !facebookAppSecret) {
    console.error('Facebook App ID or App Secret not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${facebookAppId}&` +
      `client_secret=${facebookAppSecret}&` +
      `fb_exchange_token=${shortLivedToken}`
    );

    if (!response.ok) {
      console.error('Failed to exchange token:', await response.text());
      return null;
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      token_type: data.token_type || 'bearer',
      expires_in: data.expires_in || 5184000, // Default 60 days
    };
  } catch (error) {
    console.error('Error exchanging token:', error);
    return null;
  }
}
