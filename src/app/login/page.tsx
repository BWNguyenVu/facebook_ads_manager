'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Facebook, Key, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { FacebookAPI } from '@/lib/facebookApi';
import { 
  getAccessToken, 
  saveAccessToken, 
  getSelectedAccountId,
  saveSelectedAccountId,
  getUserSettings 
} from '@/lib/storage';
import { FacebookAccount } from '@/types/facebook';

export default function LoginPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState('');
  const [accounts, setAccounts] = useState<FacebookAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  // Load saved data on mount
  useEffect(() => {
    const savedToken = getAccessToken();
    const savedAccountId = getSelectedAccountId();
    
    if (savedToken) {
      setAccessToken(savedToken);
      validateAndLoadAccounts(savedToken, savedAccountId);
    }
  }, []);

  const validateAndLoadAccounts = async (token: string, savedAccountId?: string | null) => {
    if (!token.trim()) {
      setTokenValid(null);
      setAccounts([]);
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const facebookApi = new FacebookAPI(token);
      
      // Validate token
      const isValid = await facebookApi.validateToken();
      setTokenValid(isValid);

      if (isValid) {
        // Load accounts
        setIsLoadingAccounts(true);
        const accountsData = await facebookApi.getAdAccounts();
        setAccounts(accountsData);

        // Restore selected account if available
        if (savedAccountId && accountsData.some(acc => acc.account_id === savedAccountId)) {
          setSelectedAccountId(savedAccountId);
        }
      } else {
        setError('Invalid access token');
        setAccounts([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate token');
      setTokenValid(false);
      setAccounts([]);
    } finally {
      setIsValidating(false);
      setIsLoadingAccounts(false);
    }
  };

  const handleTokenChange = (value: string) => {
    setAccessToken(value);
    setTokenValid(null);
    setAccounts([]);
    setSelectedAccountId('');
    setError('');
  };

  const handleValidateToken = () => {
    validateAndLoadAccounts(accessToken);
  };

  const handleLogin = () => {
    if (!accessToken.trim()) {
      setError('Please enter an access token');
      return;
    }

    if (!tokenValid) {
      setError('Please validate your access token first');
      return;
    }

    if (!selectedAccountId) {
      setError('Please select an ad account');
      return;
    }

    // Save credentials
    saveAccessToken(accessToken);
    saveSelectedAccountId(selectedAccountId);

    // Redirect to dashboard
    router.push('/dashboard');
  };

  const getTokenStatusIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    }
    if (tokenValid === true) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (tokenValid === false) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Facebook className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Facebook Ads Manager</CardTitle>
          <CardDescription>
            Enter your Facebook access token to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Access Token Input */}
          <div className="space-y-2">
            <Label htmlFor="access_token">Facebook Access Token</Label>
            <div className="relative">
              <Textarea
                id="access_token"
                placeholder="Enter your Facebook access token..."
                value={accessToken}
                onChange={(e) => handleTokenChange(e.target.value)}
                className="min-h-[100px] pr-10"
              />
              <div className="absolute top-3 right-3">
                {getTokenStatusIcon()}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleValidateToken}
                disabled={!accessToken.trim() || isValidating}
                variant="outline"
                size="sm"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Validate Token
                  </>
                )}
              </Button>
              
              {tokenValid && (
                <div className="text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Token is valid
                </div>
              )}
            </div>
          </div>

          {/* Account Selection */}
          {accounts.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="account">Select Ad Account</Label>
              <Select 
                value={selectedAccountId} 
                onValueChange={setSelectedAccountId}
                disabled={isLoadingAccounts}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an ad account..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.account_id}>
                      <div className="flex flex-col">
                        <span>{account.account_id}</span>
                        <span className="text-xs text-gray-500">{account.id}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {isLoadingAccounts && (
                <div className="text-sm text-gray-500 flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading accounts...
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={!tokenValid || !selectedAccountId}
            className="w-full"
          >
            <Facebook className="h-4 w-4 mr-2" />
            Continue to Dashboard
          </Button>

          {/* Help Text */}
          <div className="text-sm text-gray-500 space-y-2">
            <p>
              <strong>How to get your access token:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to Facebook Developers</li>
              <li>Create or select your app</li>
              <li>Go to Tools & Support → Graph API Explorer</li>
              <li>Generate a User Access Token with ads_management permission</li>
              <li>Copy and paste the token above</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
