import { NextRequest, NextResponse } from 'next/server';
import { userService, accountService } from '@/lib/mongodb';
import { generateToken, exchangeForLongLivedToken } from '@/lib/auth';
import { validateFacebookToken, getFacebookAccounts, getFacebookUserInfo } from '@/lib/facebookApi';

export async function POST(request: NextRequest) {
  try {
    const { email, password, access_token } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await userService.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Validate password
    const isValidPassword = await userService.validatePassword(user, password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, message: 'Account is inactive' },
        { status: 401 }
      );
    }

    // Update last login
    await userService.updateLastLogin(user._id!);

    // Load existing Facebook credentials from database
    const savedCredentials = await userService.getFacebookCredentials(user._id!);

    // Handle Facebook access token if provided
    let facebookData = null;
    if (access_token) {
      try {
        // Validate the token first
        const isValid = await validateFacebookToken(access_token);
        if (isValid) {
          // Get Facebook user info
          const fbUserInfo = await getFacebookUserInfo(access_token);
          if (fbUserInfo) {
            // Try to exchange for long-lived token
            const longLivedTokenData = await exchangeForLongLivedToken(access_token);
            
            const tokenToStore = longLivedTokenData?.access_token || access_token;
            const expiresAt = longLivedTokenData 
              ? new Date(Date.now() + longLivedTokenData.expires_in * 1000)
              : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours for short-lived

            // Update user with Facebook data
            await userService.updateTokens(user._id!, {
              facebook_user_id: fbUserInfo.id,
              long_lived_token: tokenToStore,
              token_expires_at: expiresAt,
            });

            // Get and sync Facebook accounts
            const fbAccounts = await getFacebookAccounts(tokenToStore);
            if (fbAccounts?.data) {
              for (const fbAccount of fbAccounts.data) {
                try {
                  // Check if account already exists
                  const existingAccount = await accountService.findByUserIdAndAccountId(
                    user._id!,
                    fbAccount.account_id
                  );

                  if (!existingAccount) {
                    await accountService.createAccount({
                      user_id: user._id!,
                      account_id: fbAccount.account_id,
                      account_name: fbAccount.name || 'Unknown Account',
                      business_id: '',
                      business_name: '',
                      access_permissions: ['ADVERTISE'],
                      is_primary: fbAccounts.data.length === 1, // Set as primary if only one account
                    });
                  }
                } catch (error) {
                  console.error('Error creating account:', error);
                  // Continue with other accounts
                }
              }
            }

            facebookData = {
              user_info: fbUserInfo,
              token_expires_at: expiresAt,
              accounts_synced: fbAccounts?.data?.length || 0,
            };
          }
        }
      } catch (error) {
        console.error('Error processing Facebook token:', error);
        // Don't fail login if Facebook token processing fails
      }
    }

    // Get user's accounts
    const userAccounts = await accountService.findByUserId(user._id!);
    const primaryAccount = userAccounts.find(acc => acc.is_primary) || userAccounts[0];

    // Generate JWT token
    const token = generateToken({
      userId: user._id!,
      email: user.email,
      role: user.role,
    });

    const userSession = {
      user_id: user._id!,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      selected_account: primaryAccount ? {
        account_id: primaryAccount.account_id,
        account_name: primaryAccount.account_name,
        business_name: primaryAccount.business_name,
      } : undefined,
      long_lived_token: user.long_lived_token,
      facebook_credentials: savedCredentials ? {
        facebook_app_id: savedCredentials.facebook_app_id,
        has_credentials: !!(savedCredentials.facebook_app_id && savedCredentials.facebook_app_secret),
        token_valid: savedCredentials.token_expires_at ? new Date(savedCredentials.token_expires_at) > new Date() : false,
      } : null,
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userSession,
      token,
      facebook_data: facebookData,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
