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
    const pages = await facebookApi.getPages();

    return NextResponse.json({ pages });
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}
