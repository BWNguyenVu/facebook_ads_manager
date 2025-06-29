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
    const timeRange = searchParams.get('time_range') || '30d';

    // Calculate date range
    let startDate: Date | undefined;
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = undefined;
        break;
    }

    let stats;
    if (accountId) {
      stats = await campaignLogService.getDetailedStatsByUserAndAccount(session.user_id, accountId, startDate);
    } else {
      stats = await campaignLogService.getDetailedStatsByUser(session.user_id, startDate);
    }

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
