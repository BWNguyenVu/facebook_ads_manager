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

    if (!accountId) {
      return NextResponse.json(
        { error: 'Missing account_id parameter' },
        { status: 400 }
      );
    }

    // Get access token from user session or localStorage
    const accessToken = session.long_lived_token;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token found. Please configure in Settings.' },
        { status: 400 }
      );
    }

    // Fetch campaigns from Facebook Graph API
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

    const facebookUrl = `https://graph.facebook.com/v21.0/act_${accountId}/campaigns?access_token=${encodeURIComponent(accessToken)}&fields=${fields}`;

    console.log('Fetching campaigns from Facebook:', facebookUrl.replace(accessToken, '[TOKEN]'));

    const response = await fetch(facebookUrl);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Facebook API error:', errorData);
      
      return NextResponse.json(
        { 
          error: errorData.error?.message || 'Failed to fetch campaigns from Facebook',
          facebook_error: errorData.error
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log(`Successfully fetched ${data.data?.length || 0} campaigns`);

    return NextResponse.json({
      campaigns: data.data || [],
      paging: data.paging
    });

  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
