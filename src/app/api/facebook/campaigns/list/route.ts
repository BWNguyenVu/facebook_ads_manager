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
    const accountId = searchParams.get('account_id');
    const accessToken = searchParams.get('access_token');
    const limit = searchParams.get('limit') || '25';
    const after = searchParams.get('after');
    const before = searchParams.get('before');

    if (!accountId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required parameters: account_id and access_token' },
        { status: 400 }
      );
    }

    // Build Facebook Graph API URL
    const fields = [
      'account_id',
      'adlabels',
      'bid_strategy',
      'boosted_object_id',
      'brand_lift_studies',
      'budget_rebalance_flag',
      'budget_remaining',
      'buying_type',
      'can_create_brand_lift_study',
      'can_use_spend_cap',
      'configured_status',
      'created_time',
      'daily_budget',
      'effective_status',
      'id',
      'is_skadnetwork_attribution',
      'issues_info',
      'last_budget_toggling_time',
      'lifetime_budget',
      'name',
      'objective',
      'recommendations',
      'source_campaign',
      'source_campaign_id',
      'special_ad_categories',
      'special_ad_category',
      'special_ad_category_country',
      'spend_cap',
      'start_time',
      'status',
      'stop_time',
      'topline_id',
      'updated_time'
    ].join(',');

    let url = `https://graph.facebook.com/v17.0/act_${accountId}/campaigns?access_token=${encodeURIComponent(accessToken)}&fields=${encodeURIComponent(fields)}&limit=${limit}`;
    
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
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
