import { NextRequest, NextResponse } from 'next/server';
import { FacebookAPI } from '@/lib/facebookApi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const after = searchParams.get('after');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    const facebookApi = new FacebookAPI(accessToken);
    const result = await facebookApi.getAdAccounts(limit, after);

    return NextResponse.json({ 
      accounts: result.accounts,
      paging: result.paging,
      total: result.accounts.length
    });
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}
