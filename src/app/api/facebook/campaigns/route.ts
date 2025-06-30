import { NextRequest, NextResponse } from 'next/server';
import { FacebookAPI, createFullCampaign } from '@/lib/facebookApi';
import { campaignLogService } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';

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
    const { campaigns, accountId, accessToken } = body;

    if (!campaigns || !Array.isArray(campaigns) || !accountId || !accessToken) {
      const missingFields = [];
      if (!campaigns || !Array.isArray(campaigns)) missingFields.push('campaigns array');
      if (!accountId) missingFields.push('accountId');
      if (!accessToken) missingFields.push('accessToken');
      
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate access token format
    const cleanToken = accessToken.trim();
    if (cleanToken.length < 50 || !/^[A-Za-z0-9_-]+$/.test(cleanToken)) {
      console.error('Invalid token format:', {
        length: cleanToken.length,
        preview: cleanToken.substring(0, 20),
        validFormat: /^[A-Za-z0-9_-]+$/.test(cleanToken)
      });
      return NextResponse.json(
        { error: 'Invalid access token format' },
        { status: 400 }
      );
    }

    const results = [];
    
    try {
      const facebookApi = new FacebookAPI(cleanToken);
      
      // Test the token first
      const testResponse = await fetch(`https://graph.facebook.com/v23.0/me?access_token=${encodeURIComponent(cleanToken)}`);
      if (!testResponse.ok) {
        const testError = await testResponse.json();
        console.error('Token test failed:', testError);
        return NextResponse.json(
          { error: `Invalid access token: ${testError.error?.message || 'Token validation failed'}` },
          { status: 401 }
        );
      }
      const testData = await testResponse.json();
    } catch (tokenError) {
      console.error('Token validation error:', tokenError);
      return NextResponse.json(
        { error: `Token validation failed: ${tokenError}` },
        { status: 401 }
      );
    }

    const facebookApi = new FacebookAPI(cleanToken);
    
    for (const campaignData of campaigns) {
      try {
        // Create log entry with pending status
        const log = await campaignLogService.createLog({
          name: campaignData.name,
          csvRow: campaignData,
          status: 'pending',
          account_id: accountId,
          user_id: session.user_id, // Use user_id from JWT session
          daily_budget: campaignData.daily_budget ? parseFloat(campaignData.daily_budget.toString()) : undefined
        });


        // Create full campaign
        const campaignResult = await createFullCampaign(
          facebookApi,
          accountId,
          campaignData
        );

        // Update log with success status
        await campaignLogService.updateLog(log._id!, {
          status: 'success',
          facebook_ids: {
            campaign_id: campaignResult.campaign_id,
            adset_id: campaignResult.adset_id,
            creative_id: campaignResult.creative_id,
            ad_id: campaignResult.ad_id
          }
        });

        results.push({
          name: campaignData.name,
          status: 'success',
          facebook_ids: campaignResult,
          log_id: log._id
        });

      } catch (error: any) {
        console.error(`Error creating campaign ${campaignData.name}:`, error);

        // Try to find and update the log
        try {
          const logs = await campaignLogService.getLogsByStatus('pending', 1);
          const pendingLog = logs.find(log => log.name === campaignData.name);
          
          if (pendingLog) {
            await campaignLogService.updateLog(pendingLog._id!, {
              status: 'error',
              error_message: error.message
            });
          }
        } catch (logError) {
          console.error('Error updating log:', logError);
        }

        results.push({
          name: campaignData.name,
          status: 'error',
          error: error.message
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Error in campaign creation API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create campaigns' },
      { status: 500 }
    );
  }
}

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

    // Validate token
    const facebookApi = new FacebookAPI(accessToken);
    const isValid = await facebookApi.validateToken();

    return NextResponse.json({ valid: isValid });
  } catch (error: any) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to validate token' },
      { status: 500 }
    );
  }
}
