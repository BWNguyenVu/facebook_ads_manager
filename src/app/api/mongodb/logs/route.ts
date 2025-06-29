import { NextRequest, NextResponse } from 'next/server';
import { campaignLogService } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { CampaignLog } from '@/types/campaign';

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    const status = searchParams.get('status') as 'success' | 'error' | 'pending' | null;
    const accountId = searchParams.get('account_id');

    let logs;
    if (accountId) {
      // Get logs for specific user and account
      if (status) {
        logs = await campaignLogService.getLogsByStatus(status, limit);
        logs = logs.filter((log: CampaignLog) => log.user_id === session.user_id && log.account_id === accountId);
      } else {
        logs = await campaignLogService.getLogsByUserAndAccount(session.user_id, accountId, limit, skip);
      }
    } else {
      // Get logs for user (all accounts)
      if (status) {
        logs = await campaignLogService.getLogsByStatus(status, limit);
        logs = logs.filter((log: CampaignLog) => log.user_id === session.user_id);
      } else {
        logs = await campaignLogService.getLogsByUser(session.user_id, limit, skip);
      }
    }

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user session from JWT
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, csvRow, status, account_id } = body;

    if (!name || !csvRow || !status || !account_id) {
      return NextResponse.json(
        { error: 'name, csvRow, status, and account_id are required' },
        { status: 400 }
      );
    }

    const log = await campaignLogService.createLog({
      user_id: session.user_id,
      account_id,
      name,
      csvRow,
      status
    });

    return NextResponse.json({ log });
  } catch (error: any) {
    console.error('Error creating log:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create log' },
      { status: 500 }
    );
  }
}
