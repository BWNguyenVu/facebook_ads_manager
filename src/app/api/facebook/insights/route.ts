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
    const datePreset = searchParams.get('date_preset') || 'today';
    const fields = searchParams.get('fields') || 'spend';

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Clean account ID format (remove act_ prefix if present)
    const cleanAccountId = accountId.replace('act_', '');
    const fbAccountId = `act_${cleanAccountId}`;

    console.log('Fetching insights for account:', {
      original: accountId,
      cleaned: cleanAccountId,
      formatted: fbAccountId,
      datePreset,
      fields
    });

    // Test different account ID formats if the first one fails
    const accountFormats = [
      fbAccountId,        // act_123456789
      cleanAccountId,     // 123456789
      accountId           // original format
    ];

    let lastError = null;
    
    for (const accountFormat of accountFormats) {
      try {
        console.log(`Trying account format: ${accountFormat}`);
        
        // Facebook Graph API call
        const fbUrl = new URL(`https://graph.facebook.com/v17.0/${accountFormat}/insights`);
        fbUrl.searchParams.set('access_token', accessToken);
        fbUrl.searchParams.set('level', 'account');
        fbUrl.searchParams.set('fields', fields);
        fbUrl.searchParams.set('date_preset', datePreset);
        console.log('Facebook API URL:', fbUrl.toString().replace(accessToken, '[REDACTED]'));

        const response = await fetch(fbUrl.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const responseText = await response.text();
        console.log(`Facebook API raw response for ${accountFormat}:`, responseText);
        
        if (response.ok) {
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            console.error('Failed to parse response as JSON:', responseText);
            throw new Error('Invalid JSON response from Facebook API');
          }
          
          console.log('Account insights response:', data);

          return NextResponse.json({
            success: true,
            data: data.data || [],
            paging: data.paging,
            account_format_used: accountFormat
          });
        } else {
          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch (e) {
            errorData = { error: { message: responseText } };
          }
          lastError = errorData;
          console.log(`Format ${accountFormat} failed:`, errorData);
        }
      } catch (error: any) {
        console.error(`Error with account format ${accountFormat}:`, error);
        lastError = { error: { message: error?.message || 'Unknown error' } };
      }
    }

    // If all formats failed, return the last error
    console.error('All account formats failed. Last error:', lastError);
    return NextResponse.json(
      { 
        error: 'Failed to fetch account insights',
        details: lastError?.error?.message || 'Unknown error',
        facebook_error: lastError,
        tried_formats: accountFormats
      },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error fetching account insights:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch account insights' },
      { status: 500 }
    );
  }
}
