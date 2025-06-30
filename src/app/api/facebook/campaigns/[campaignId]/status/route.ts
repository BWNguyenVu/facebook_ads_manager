import { NextRequest, NextResponse } from 'next/server';
import { FacebookAPI } from '@/lib/facebookApi';
import { getSessionFromRequest } from '@/lib/auth';

interface UpdateStatusParams {
  params: {
    campaignId: string;
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: UpdateStatusParams
) {
  try {
    // Get user session from JWT
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { campaignId } = params;
    const body = await request.json();
    const { status, accessToken } = body;

    // Validate required fields
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    if (!status || !['ACTIVE', 'PAUSED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be ACTIVE or PAUSED' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Validate access token format
    const cleanToken = accessToken.trim();
    if (cleanToken.length < 50 || !/^[A-Za-z0-9_-]+$/.test(cleanToken)) {
      return NextResponse.json(
        { error: 'Invalid access token format' },
        { status: 400 }
      );
    }

    try {
      // Update campaign status using Facebook Graph API
      const response = await fetch(`https://graph.facebook.com/v23.0/${campaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          access_token: cleanToken,
          status: status
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Facebook API error:', errorData);
        
        return NextResponse.json(
          { 
            error: `Facebook API error: ${errorData.error?.message || 'Failed to update campaign status'}`,
            facebook_error: errorData
          },
          { status: response.status }
        );
      }

      const result = await response.json();
      
      return NextResponse.json({
        success: true,
        campaign_id: campaignId,
        status: status,
        facebook_response: result
      });

    } catch (facebookError: any) {
      console.error('Facebook API request failed:', facebookError);
      return NextResponse.json(
        { error: `Failed to update campaign status: ${facebookError.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error updating campaign status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update campaign status' },
      { status: 500 }
    );
  }
}

// GET method to check current campaign status
export async function GET(
  request: NextRequest,
  { params }: UpdateStatusParams
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { campaignId } = params;
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    try {
      // Get campaign status from Facebook Graph API
      const response = await fetch(
        `https://graph.facebook.com/v23.0/${campaignId}?fields=id,name,status,effective_status&access_token=${encodeURIComponent(accessToken)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          { 
            error: `Facebook API error: ${errorData.error?.message || 'Failed to get campaign status'}`,
            facebook_error: errorData
          },
          { status: response.status }
        );
      }

      const campaign = await response.json();
      
      return NextResponse.json({
        campaign_id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        effective_status: campaign.effective_status
      });

    } catch (facebookError: any) {
      console.error('Facebook API request failed:', facebookError);
      return NextResponse.json(
        { error: `Failed to get campaign status: ${facebookError.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error getting campaign status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get campaign status' },
      { status: 500 }
    );
  }
}
