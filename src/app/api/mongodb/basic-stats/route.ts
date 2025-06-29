import { NextRequest, NextResponse } from 'next/server';
import { campaignLogService } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user session from JWT
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id');

    let stats;
    if (accountId) {
      stats = await campaignLogService.getStatsByUserAndAccount(session.user_id, accountId);
    } else {
      stats = await campaignLogService.getStatsByUser(session.user_id);
    }

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Error fetching basic stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
