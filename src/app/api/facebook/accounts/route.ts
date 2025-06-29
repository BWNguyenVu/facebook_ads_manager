import { NextRequest, NextResponse } from 'next/server';
import { FacebookAPI } from '@/lib/facebookApi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    const facebookApi = new FacebookAPI(accessToken);
    const accounts = await facebookApi.getAdAccounts();

    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}
