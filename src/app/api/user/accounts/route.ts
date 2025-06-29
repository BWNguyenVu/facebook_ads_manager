import { NextRequest, NextResponse } from 'next/server';
import { accountService } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accounts = await accountService.findByUserId(session.user_id);
    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error('Error fetching user accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      account_id,
      account_name,
      business_id,
      business_name,
      access_permissions,
      is_primary
    } = await request.json();

    if (!account_id || !account_name) {
      return NextResponse.json(
        { error: 'account_id and account_name are required' },
        { status: 400 }
      );
    }

    const account = await accountService.createAccount({
      user_id: session.user_id,
      account_id,
      account_name,
      business_id,
      business_name,
      access_permissions,
      is_primary
    });

    return NextResponse.json({ account });
  } catch (error: any) {
    console.error('Error creating account:', error);
    
    if (error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Account already exists for this user' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { account_id, set_primary } = await request.json();

    if (!account_id) {
      return NextResponse.json(
        { error: 'account_id is required' },
        { status: 400 }
      );
    }

    if (set_primary) {
      const success = await accountService.setPrimaryAccount(session.user_id, account_id);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to set primary account' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update account' },
      { status: 500 }
    );
  }
}
