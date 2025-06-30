import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

interface FacebookInsightsData {
  campaign_id?: string;
  campaign_name?: string;
  spend: string;
  impressions: string;
  reach: string;
  clicks: string;
  inline_link_clicks: string;
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
  cpc: string;
  cpm: string;
  ctr: string;
  date_start: string;
  date_stop: string;
}

interface FacebookInsightsResponse {
  data: FacebookInsightsData[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id');
    const accessToken = searchParams.get('access_token');
    const campaignIds = searchParams.get('campaign_ids'); // Comma separated campaign IDs
    const datePreset = searchParams.get('date_preset') || 'last_7d';
    const level = searchParams.get('level') || 'campaign';

    if (!accountId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required parameters: account_id, access_token' },
        { status: 400 }
      );
    }

    // Build the fields for insights
    const fields = [
      'campaign_id',
      'campaign_name',
      'spend',
      'impressions', 
      'reach',
      'clicks',
      'inline_link_clicks',
      'actions',
      'cpc',
      'cpm',
      'ctr'
    ].join(',');

    // Build URL based on level
    let apiUrl: string;
    if (level === 'campaign' && campaignIds) {
      // Get insights for specific campaigns
      const campaignIdArray = campaignIds.split(',');
      const insightsPromises = campaignIdArray.map(campaignId => {
        const url = `https://graph.facebook.com/v17.0/${campaignId}/insights?access_token=${encodeURIComponent(accessToken)}&fields=${encodeURIComponent(fields)}&date_preset=${encodeURIComponent(datePreset)}`;
        return fetch(url);
      });

      const responses = await Promise.all(insightsPromises);
      const allData: FacebookInsightsData[] = [];

      for (const response of responses) {
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Facebook API Error:', errorText);
          continue;
        }
        
        const data: FacebookInsightsResponse = await response.json();
        if (data.data && data.data.length > 0) {
          allData.push(...data.data);
        }
      }

      return NextResponse.json({
        data: allData,
        success: true
      });
    } else {
      // Get account level insights
      apiUrl = `https://graph.facebook.com/v17.0/${accountId}/insights?access_token=${encodeURIComponent(accessToken)}&level=${encodeURIComponent(level)}&fields=${encodeURIComponent(fields)}&date_preset=${encodeURIComponent(datePreset)}`;
    }

    console.log('Fetching Facebook Insights:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook API Error:', errorText);
      return NextResponse.json(
        { error: `Facebook API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data: FacebookInsightsResponse = await response.json();

    return NextResponse.json({
      ...data,
      success: true
    });

  } catch (error: any) {
    console.error('Error fetching campaign insights:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
