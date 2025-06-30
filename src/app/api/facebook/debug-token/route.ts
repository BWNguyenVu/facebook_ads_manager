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
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }


    // 1. Test basic me endpoint
    const meUrl = `https://graph.facebook.com/v17.0/me?access_token=${accessToken}&fields=id,name,email`;
    const meResponse = await fetch(meUrl);
    const meData = await meResponse.json();


    // 2. Test token info
    const tokenInfoUrl = `https://graph.facebook.com/v17.0/me?access_token=${accessToken}&fields=id,name&metadata=1`;
    const tokenInfoResponse = await fetch(tokenInfoUrl);
    const tokenInfoData = await tokenInfoResponse.json();


    // 3. Test ad accounts access
    const adAccountsUrl = `https://graph.facebook.com/v17.0/me/adaccounts?access_token=${accessToken}&fields=account_id,name,account_status,business,currency`;
    const adAccountsResponse = await fetch(adAccountsUrl);
    const adAccountsData = await adAccountsResponse.json();


    // 4. Test permissions
    const permissionsUrl = `https://graph.facebook.com/v17.0/me/permissions?access_token=${accessToken}`;
    const permissionsResponse = await fetch(permissionsUrl);
    const permissionsData = await permissionsResponse.json();


    // 5. Test insights access on first ad account if available
    let insightsTest = null;
    if (adAccountsData.data && adAccountsData.data.length > 0) {
      const firstAccount = adAccountsData.data[0];
      const accountId = firstAccount.account_id.replace('act_', '');
      const fbAccountId = `act_${accountId}`;
      
      try {
        const insightsUrl = `https://graph.facebook.com/v17.0/${fbAccountId}/insights?access_token=${accessToken}&level=account&fields=spend&date_preset=today`;
        const insightsResponse = await fetch(insightsUrl);
        const insightsData = await insightsResponse.json();
        
        insightsTest = {
          account_id: fbAccountId,
          success: insightsResponse.ok,
          data: insightsData
        };
      } catch (error: any) {
        insightsTest = {
          account_id: fbAccountId,
          success: false,
          error: error.message
        };
      }
    }

    return NextResponse.json({
      success: true,
      debug_info: {
        me: meData,
        token_info: tokenInfoData,
        ad_accounts: adAccountsData,
        permissions: permissionsData,
        insights_test: insightsTest
      }
    });

  } catch (error: any) {
    console.error('Error debugging token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to debug token' },
      { status: 500 }
    );
  }
}
