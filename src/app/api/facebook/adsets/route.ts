import { NextRequest, NextResponse } from 'next/server';
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
    const campaignId = searchParams.get('campaign_id');
    const accessToken = searchParams.get('access_token');
    const limit = searchParams.get('limit') || '25';
    const after = searchParams.get('after');
    const before = searchParams.get('before');

    if (!campaignId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required parameters: campaign_id and access_token' },
        { status: 400 }
      );
    }

    // Build Facebook Graph API URL for adsets
    const fields = [
      'id',
      'name',
      'status',
      'effective_status',
      'daily_budget',
      'lifetime_budget',
      'start_time',
      'end_time',
      'created_time',
      'updated_time',
      'campaign_id',
      'optimization_goal',
      'bid_strategy',
      'targeting',
      'attribution_spec',
      'budget_remaining'
    ].join(',');

    let url = `https://graph.facebook.com/v17.0/${campaignId}/adsets?access_token=${encodeURIComponent(accessToken)}&fields=${encodeURIComponent(fields)}&limit=${limit}`;
    
    if (after) {
      url += `&after=${encodeURIComponent(after)}`;
    }
    if (before) {
      url += `&before=${encodeURIComponent(before)}`;
    }


    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Facebook API error:', errorData);
      return NextResponse.json(
        { error: `Facebook API error: ${errorData.error?.message || 'Unknown error'}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching adsets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch adsets' },
      { status: 500 }
    );
  }
}
