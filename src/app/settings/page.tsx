'use client';

import React, { useState, useEffect } from 'react';
import { createClientLogger } from '@/lib/client-logger';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Key, 
  Facebook, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  User,
  LogOut,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { UserSession } from '@/types/user';

interface FacebookConfig {
  app_id: string;
  app_secret: string;
  short_lived_token: string;
  default_account_id: string;
}

interface TokenInfo {
  token: string;
  expires_at: string;
  is_valid: boolean;
  user_info?: {
    id: string;
    name: string;
    email?: string;
  };
}


const logger = createClientLogger('SettingsPage');
export default function SettingsPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [config, setConfig] = useState<FacebookConfig>({
    app_id: '',
    app_secret: '',
    short_lived_token: '',
    default_account_id: ''
  });

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [facebookAccounts, setFacebookAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const [activeTab, setActiveTab] = useState('facebook');

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const sessionData = localStorage.getItem('user_session');
    
    if (!token || !sessionData) {
      router.push('/auth');
      return;
    }

    try {
      const session = JSON.parse(sessionData) as UserSession;
      setUserSession(session);
      loadConfig();
      loadTokenInfo();
      loadUserAccounts();
      loadSelectedAccount();
      setIsLoading(false);
    } catch (error) {
      logger.error('Invalid session data:', error);
      router.push('/auth');
    }
  }, [router]);

  // Auto clear success/error messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadConfig = async () => {
    logger.debug('Loading Facebook credentials from database...');
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        logger.debug('No auth token found');
        return;
      }

      const response = await fetch('/api/user/facebook-credentials', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      logger.debug('Credentials loaded from database:', {
        success: data.success,
        has_credentials: data.data?.has_credentials,
        has_app_id: data.data?.has_app_id,
        has_app_secret: data.data?.has_app_secret,
        has_short_token: data.data?.has_short_token,
        has_long_token: data.data?.has_long_token,
      });

      if (data.success && data.data) {
        // Update config with data from database (masked for security)
        setConfig(prev => ({
          ...prev,
          app_id: data.data.facebook_app_id || '',
          app_secret: data.data.has_app_secret ? data.data.facebook_app_secret_masked || '••••••••••••••••' : '',
          short_lived_token: data.data.has_short_token ? data.data.facebook_short_lived_token_masked || '••••••••••••••••' : '',
        }));
        
        // Update token info if available
        if (data.data.long_lived_token) {
          setTokenInfo({
            token: data.data.long_lived_token,
            expires_at: data.data.token_expires_at || '',
            is_valid: data.data.token_valid || false
          });
        }

        // Show status
        if (data.data.has_credentials) {
          setSuccess('Credentials loaded from database successfully');
        }
      }
    } catch (error) {
      logger.error('Error loading credentials from database:', error);
      setError('Failed to load credentials from database');
    }
  };

  const loadTokenInfo = async () => {
    // Load token info from database (already loaded in loadConfig)
    logger.debug('Token info already loaded from database in loadConfig');
  };

  const loadUserAccounts = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch('/api/user/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      logger.error('Error loading accounts:', error);
    }
  };

  const loadSelectedAccount = () => {
    // Load selected account from config
    const savedConfig = localStorage.getItem('facebook_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setSelectedAccountId(parsed.default_account_id || '');
      } catch (error) {
        logger.error('Error loading selected account:', error);
      }
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Validate input first
      if (!config.app_id || !config.app_secret) {
        throw new Error('App ID and App Secret are required');
      }

      // Save to database
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      logger.debug('Saving credentials to database...', {
        app_id: config.app_id,
        has_secret: !!config.app_secret,
        has_short_token: !!config.short_lived_token
      });

      const response = await fetch('/api/user/facebook-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          facebook_app_id: config.app_id,
          facebook_app_secret: config.app_secret,
          facebook_short_lived_token: config.short_lived_token,
        }),
      });

      logger.debug('Database save response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        logger.error('Database save error:', errorData);
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const responseData = await response.json();
      logger.debug('Database save success:', responseData);

      // Also save to localStorage as backup
      localStorage.setItem('facebook_config', JSON.stringify(config));
      setSuccess('Configuration saved successfully to database!');
    } catch (error: any) {
      logger.error('Save config error details:', {
        message: error.message,
        stack: error.stack,
        config: {
          app_id: config.app_id,
          has_secret: !!config.app_secret,
          has_short_token: !!config.short_lived_token
        }
      });
      setError(error.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const generateLongLivedToken = async () => {
    if (!config.app_id || !config.app_secret || !config.short_lived_token) {
      setError('Please fill in all fields first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          short_lived_token: config.short_lived_token,
          app_id: config.app_id,
          app_secret: config.app_secret,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to exchange token');
      }

      if (data.success) {
        const expiresAt = new Date(Date.now() + data.expires_in * 1000);
        
        // Clean and validate the token
        const cleanToken = data.access_token?.trim();
        
        logger.debug('=== TOKEN EXCHANGE DEBUG ===');
        logger.debug('Original token:', data.access_token);
        logger.debug('Clean token:', cleanToken);
        logger.debug('Token length:', cleanToken?.length);
        logger.debug('Token format valid:', /^[A-Za-z0-9_-]+$/.test(cleanToken || ''));
        logger.debug('Expires in seconds:', data.expires_in);
        logger.debug('Expires at:', expiresAt);
        
        // Save long-lived token to localStorage and database
        localStorage.setItem('long_lived_access_token', cleanToken);
        localStorage.setItem('token_expires_at', expiresAt.toISOString());

        // Save to database
        const authToken = localStorage.getItem('auth_token');
        if (authToken) {
          try {
            const dbResponse = await fetch('/api/user/facebook-credentials', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
              },
              body: JSON.stringify({
                facebook_app_id: config.app_id,
                facebook_app_secret: config.app_secret,
                facebook_short_lived_token: config.short_lived_token,
                long_lived_token: cleanToken,
                token_expires_at: expiresAt.toISOString(),
              }),
            });

            if (!dbResponse.ok) {
              logger.error('Failed to save token to database');
            }
          } catch (dbError) {
            logger.error('Database save error:', dbError);
          }
        }

        // Update token info
        setTokenInfo({
          token: cleanToken,
          expires_at: expiresAt.toISOString(),
          is_valid: true,
          user_info: data.user_info
        });

        // Sync Facebook accounts with the new token
        await syncFacebookAccounts(cleanToken);

        setSuccess(`Long-lived token generated successfully! Valid for ${Math.ceil(data.expires_in / (24 * 60 * 60))} days.`);

        // Auto-load Facebook accounts with the new token
        await loadFacebookAccountsWithToken(cleanToken);

        // Sync accounts with the new token
        await syncFacebookAccounts(cleanToken);
      } else {
        throw new Error(data.message || 'Token exchange failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const syncFacebookAccounts = async (accessToken: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      // Call login API again to sync accounts with the new token
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userSession?.email,
          password: '', // Won't be used for existing sessions
          access_token: accessToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update user session with new account info
          localStorage.setItem('user_session', JSON.stringify(data.user));
          setUserSession(data.user);
          loadUserAccounts();
          setSuccess('Facebook accounts synced successfully!');
        }
      }
    } catch (error) {
      logger.error('Error syncing accounts:', error);
    }
  };

  const validateCurrentToken = async () => {
    if (!tokenInfo?.token) {
      setError('No token to validate');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/facebook/campaigns?access_token=${tokenInfo.token}`);
      const data = await response.json();

      if (data.valid) {
        setSuccess('Token is valid!');
        setTokenInfo(prev => prev ? { ...prev, is_valid: true } : null);
      } else {
        setError('Token is invalid or expired');
        setTokenInfo(prev => prev ? { ...prev, is_valid: false } : null);
      }
    } catch (err) {
      setError('Failed to validate token');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('long_lived_access_token');
    localStorage.removeItem('token_expires_at');
    setTokenInfo(null);
    setFacebookAccounts([]);
    setSuccess('Tokens cleared successfully');
  };

  const loadFacebookAccounts = async () => {
    const longLivedToken = localStorage.getItem('long_lived_access_token');
    if (!longLivedToken) {
      setError('Please generate a long-lived token first');
      return;
    }

    await loadFacebookAccountsWithToken(longLivedToken);
  };

  const loadFacebookAccountsWithToken = async (accessToken: string) => {
    setIsLoadingAccounts(true);
    setError(null);

    try {
      const response = await fetch(`/api/facebook/accounts?access_token=${encodeURIComponent(accessToken)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load accounts');
      }

      setFacebookAccounts(data.accounts || []);
      setSuccess(`Loaded ${data.accounts?.length || 0} ad accounts from Facebook`);
    } catch (err: any) {
      setError(`Failed to load Facebook accounts: ${err.message}`);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const selectAccount = async (accountId: string) => {
    setSelectedAccountId(accountId);
    
    // Find the selected account details
    const selectedAccount = facebookAccounts.find(acc => acc.account_id === accountId);
    
    if (!selectedAccount) {
      setError('Account not found');
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Save account to database
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          account_id: selectedAccount.account_id,
          account_name: selectedAccount.name || selectedAccount.account_id,
          business_id: selectedAccount.business?.id || null,
          business_name: selectedAccount.business?.name || null,
          access_permissions: ['MANAGE'],
          is_primary: true // Set as primary account
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // If account already exists, that's fine - just update primary status
        if (response.status !== 409) {
          throw new Error(errorData.error || 'Failed to save account');
        }
        
        // Update primary account
        const updateResponse = await fetch('/api/user/accounts', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            account_id: selectedAccount.account_id,
            set_primary: true
          }),
        });

        if (!updateResponse.ok) {
          const updateErrorData = await updateResponse.json();
          throw new Error(updateErrorData.error || 'Failed to update primary account');
        }
      }
      
      // Update config with selected account
      const updatedConfig = { 
        ...config, 
        default_account_id: accountId 
      };
      setConfig(updatedConfig);
      
      // Save to localStorage
      localStorage.setItem('facebook_config', JSON.stringify(updatedConfig));
      
      // Update user session with selected account
      if (userSession?.user_id) {
        const updatedSession: UserSession = {
          ...userSession,
          selected_account: {
            account_id: selectedAccount.account_id,
            account_name: selectedAccount.name || selectedAccount.account_id
          }
        };
        setUserSession(updatedSession);
        localStorage.setItem('user_session', JSON.stringify(updatedSession));
      }
      
      // Reload user accounts
      await loadUserAccounts();
      
      setSuccess(`Ad account "${selectedAccount.name || accountId}" selected and saved successfully!`);
    } catch (err: any) {
      setError(`Failed to save account: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_session');
    router.push('/auth');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userSession) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <SettingsIcon className="h-8 w-8 text-blue-600" />
                <span>Settings</span>
              </h1>
              <p className="text-gray-600">
                Configure your Facebook app credentials and manage access tokens
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{userSession.email}</span>
            </div>
            {userSession.selected_account && (
              <Badge variant="outline">
                {userSession.selected_account.account_name}
              </Badge>
            )}
            <Button
              onClick={() => router.push('/campaigns')}
              variant="outline"
              size="sm"
            >
              <Activity className="h-4 w-4 mr-2" />
              Campaigns
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="facebook">Facebook Configuration</TabsTrigger>
            <TabsTrigger value="tokens">Token Management</TabsTrigger>
            <TabsTrigger value="accounts">Ad Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="facebook" className="space-y-6">
            {/* Database load status */}
            {config.app_secret && config.app_secret.includes('••••') && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Loaded from Database:</strong> Your credentials are securely loaded from the database. 
                  Sensitive data is encrypted and displayed with masking (••••••••) for security. 
                  To update credentials, enter new values and save.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Multi-device info card */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Multi-device Access:</strong> Your Facebook credentials and tokens are securely stored in the database. 
                Once configured, you can access your campaigns from any device without needing to re-enter your credentials.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5 text-blue-600" />
                  Facebook App Configuration
                </CardTitle>
                <CardDescription>
                  Configure your Facebook App credentials. These will be securely stored in the database so you can access them from any device. You can find these in your Facebook Developer Console.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-id">App ID</Label>
                    <Input
                      id="app-id"
                      placeholder="Enter your Facebook App ID"
                      value={config.app_id}
                      onChange={(e) => setConfig(prev => ({ ...prev, app_id: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="app-secret">App Secret</Label>
                    <div className="relative">
                      <Input
                        id="app-secret"
                        type={showSecrets ? 'text' : 'password'}
                        placeholder="Enter your Facebook App Secret"
                        value={config.app_secret}
                        onChange={(e) => setConfig(prev => ({ ...prev, app_secret: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowSecrets(!showSecrets)}
                      >
                        {showSecrets ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short-token">Short-lived Access Token</Label>
                  <div className="relative">
                    <Input
                      id="short-token"
                      type={showSecrets ? 'text' : 'password'}
                      placeholder="Enter your short-lived access token from Facebook Graph API Explorer"
                      value={config.short_lived_token}
                      onChange={(e) => setConfig(prev => ({ ...prev, short_lived_token: e.target.value }))}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Get this from Facebook Graph API Explorer with proper permissions
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current-account">Currently Selected Ad Account</Label>
                  <div className="flex gap-2">
                    <Input
                      id="current-account"
                      placeholder="No account selected - use Ad Accounts tab to select"
                      value={config.default_account_id ? `ID: ${config.default_account_id}` : ''}
                      readOnly
                      className="bg-gray-50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('accounts')}
                      className="shrink-0"
                    >
                      Select Account
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use the "Ad Accounts" tab to load and select from your Facebook ad accounts.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={saveConfig}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Configuration
                  </Button>

                  <Button 
                    onClick={generateLongLivedToken}
                    disabled={isGenerating || !config.app_id || !config.app_secret || !config.short_lived_token}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4" />
                    )}
                    Generate Long-lived Token
                  </Button>

                  {/* Debug button - remove in production */}
                  <Button 
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('auth_token');
                        const response = await fetch('/api/debug/user', {
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const data = await response.json();
                        logger.debug('Debug info:', data);
                        alert(JSON.stringify(data, null, 2));
                      } catch (e) {
                        logger.error('Debug error:', e);
                        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
                        alert('Debug failed: ' + errorMsg);
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    Debug
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tokens" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-green-600" />
                  Current Access Token
                </CardTitle>
                <CardDescription>
                  Manage your current long-lived access token
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tokenInfo ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={tokenInfo.is_valid ? "default" : "destructive"}>
                          {tokenInfo.is_valid ? 'Valid' : 'Invalid/Expired'}
                        </Badge>
                        {tokenInfo.is_valid && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {!tokenInfo.is_valid && (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={validateCurrentToken}
                          disabled={isGenerating}
                          size="sm"
                          variant="outline"
                        >
                          {isGenerating ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            'Validate'
                          )}
                        </Button>
                        <Button 
                          onClick={clearTokens}
                          size="sm"
                          variant="destructive"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Token (masked)</Label>
                      <Input
                        value={`${tokenInfo.token.substring(0, 20)}...${tokenInfo.token.substring(tokenInfo.token.length - 10)}`}
                        readOnly
                        className="font-mono text-sm"
                      />
                    </div>

                    {tokenInfo.expires_at && (
                      <div className="space-y-2">
                        <Label>Expires At</Label>
                        <Input
                          value={new Date(tokenInfo.expires_at).toLocaleString()}
                          readOnly
                        />
                      </div>
                    )}

                    {tokenInfo.user_info && (
                      <div className="space-y-2">
                        <Label>Associated Facebook User</Label>
                        <div className="text-sm text-gray-600">
                          <p><strong>Name:</strong> {tokenInfo.user_info.name}</p>
                          <p><strong>ID:</strong> {tokenInfo.user_info.id}</p>
                          {tokenInfo.user_info.email && (
                            <p><strong>Email:</strong> {tokenInfo.user_info.email}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No access token configured</p>
                    <p className="text-sm">Generate a long-lived token from the Facebook Configuration tab</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5 text-blue-600" />
                  Facebook Ad Accounts
                </CardTitle>
                <CardDescription>
                  Load your Facebook ad accounts and select a primary account for campaign creation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 mb-4">
                  <Button 
                    onClick={loadFacebookAccounts}
                    disabled={isLoadingAccounts || !tokenInfo?.token}
                    className="flex items-center gap-2"
                  >
                    {isLoadingAccounts ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Load Ad Accounts
                  </Button>
                  {!tokenInfo?.token && (
                    <p className="text-sm text-gray-500 flex items-center">
                      Generate a long-lived token first to load ad accounts
                    </p>
                  )}
                </div>

                {facebookAccounts.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Select an Ad Account:</h4>
                    {facebookAccounts.map((account) => (
                      <div
                        key={account.account_id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAccountId === account.account_id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => selectAccount(account.account_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="facebook-account"
                              checked={selectedAccountId === account.account_id}
                              onChange={() => selectAccount(account.account_id)}
                              className="h-4 w-4 text-blue-600"
                            />
                            <div>
                              <h4 className="font-medium">
                                {account.name || `Account ${account.account_id}`}
                              </h4>
                              <p className="text-sm text-gray-600">ID: {account.account_id}</p>
                              {account.business_name && (
                                <p className="text-sm text-gray-600">Business: {account.business_name}</p>
                              )}
                              {account.currency && (
                                <p className="text-sm text-gray-600">Currency: {account.currency}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedAccountId === account.account_id && (
                              <Badge variant="default">Selected</Badge>
                            )}
                            {account.account_status === 1 && (
                              <Badge variant="outline" className="text-green-600">Active</Badge>
                            )}
                            {account.account_status !== 1 && (
                              <Badge variant="outline" className="text-yellow-600">Inactive</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Facebook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No ad accounts loaded</p>
                    <p className="text-sm">Click "Load Ad Accounts" to fetch your Facebook ad accounts</p>
                  </div>
                )}

                {accounts.length > 0 && (
                  <div className="border-t pt-6 mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">User Accounts (Internal):</h4>
                    <div className="space-y-3">
                      {accounts.map((account) => (
                        <div
                          key={account.account_id}
                          className="p-3 border rounded-lg border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{account.account_name}</h4>
                              <p className="text-sm text-gray-600">ID: {account.account_id}</p>
                              {account.business_name && (
                                <p className="text-sm text-gray-600">Business: {account.business_name}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {userSession?.selected_account?.account_id === account.account_id && (
                                <Badge variant="default">Selected</Badge>
                              )}
                              {account.is_primary && (
                                <Badge variant="outline">Primary</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
      </div>
    </Layout>
  );
}
