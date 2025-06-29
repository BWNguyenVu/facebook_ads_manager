'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { FileUploader } from '@/components/FileUploader';
import { CampaignPushButton } from '@/components/CampaignPushButton';
import { CampaignPreview } from '@/components/CampaignPreview';
import { CampaignResults, CampaignResult } from '@/components/CampaignResults';
import { DataTable } from '@/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, User, LogOut, ArrowLeft } from 'lucide-react';
import { CampaignData } from '@/types/facebook';
import { UserSession } from '@/types/user';

export default function UploadPage() {
  const router = useRouter();
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [campaignResults, setCampaignResults] = useState<CampaignResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    } catch (error) {
      console.error('Invalid session data:', error);
      router.push('/auth');
    }
  }, [router]);

  const handleDataParsed = (data: CampaignData[], errors: string[]) => {
    setCampaignData(data);
    setParseErrors(errors);
    setCampaignResults([]); // Clear previous results
  };

  const handleCampaignResults = (results: CampaignResult[]) => {
    setCampaignResults(results);
  };

  const clearResults = () => {
    setCampaignResults([]);
  };

  const testToken = async () => {
    if (!accessToken) {
      alert('No access token to test');
      return;
    }

    try {
      console.log('Testing token:', accessToken.substring(0, 20) + '...');
      const response = await fetch(`https://graph.facebook.com/v23.0/me?access_token=${encodeURIComponent(accessToken)}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Token test successful:', data);
        alert(`Token is valid! User: ${data.name} (ID: ${data.id})`);
      } else {
        console.error('Token test failed:', data);
        alert(`Token test failed: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Token test error:', error);
      alert(`Token test error: ${error}`);
    }
  };

  // Get access token and account ID from user session and localStorage
  const [accessToken, setAccessToken] = useState('');
  const [accountId, setAccountId] = useState('');

  // Load token and account info after component mounts
  useEffect(() => {
    if (userSession) {
      const longLivedToken = localStorage.getItem('long_lived_access_token') || userSession?.long_lived_token || '';
      
      // Try to get account ID from multiple sources
      let selectedAccountId = userSession?.selected_account?.account_id || '';
      
      // If no account from session, try to get from config
      if (!selectedAccountId) {
        const savedConfig = localStorage.getItem('facebook_config');
        if (savedConfig) {
          try {
            const config = JSON.parse(savedConfig);
            selectedAccountId = config.default_account_id || '';
          } catch (error) {
            console.error('Error parsing config:', error);
          }
        }
      }
      
      // Validate and clean token
      const cleanToken = longLivedToken?.trim();
      
      setAccessToken(cleanToken);
      setAccountId(selectedAccountId);
      
      // Enhanced debug log
      console.log('=== TOKEN DEBUG ===');
      console.log('Raw token from localStorage:', localStorage.getItem('long_lived_access_token'));
      console.log('Token from session:', userSession?.long_lived_token);
      console.log('Clean token:', cleanToken);
      console.log('Token length:', cleanToken?.length);
      console.log('Token starts with:', cleanToken?.substring(0, 20));
      console.log('Token valid format:', /^[A-Za-z0-9_-]+$/.test(cleanToken || ''));
      console.log('AccountId from session:', userSession?.selected_account?.account_id);
      console.log('AccountId from config:', selectedAccountId);
      console.log('Final values:', { accessToken: cleanToken, accountId: selectedAccountId });
      
      // Check token expiry
      const tokenExpiry = localStorage.getItem('token_expires_at');
      if (tokenExpiry) {
        const expiryDate = new Date(tokenExpiry);
        const now = new Date();
        console.log('Token expires at:', expiryDate);
        console.log('Current time:', now);
        console.log('Token expired:', expiryDate <= now);
      }
    }
  }, [userSession]);

  const isReadyToPush = campaignData.length > 0 && parseErrors.length === 0 && accessToken && accountId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Layout>
        <div className="space-y-6 lg:space-y-8">
          <FileUploader onDataParsed={handleDataParsed} />
          
          {campaignData.length > 0 && (
            <CampaignPreview campaigns={campaignData} />
          )}

          {campaignData.length > 0 && isReadyToPush && (
            <CampaignPushButton 
              campaigns={campaignData}
              accessToken={accessToken}
              accountId={accountId}
              onResults={handleCampaignResults}
            />
          )}

          {campaignResults.length > 0 && (
            <CampaignResults results={campaignResults} />
          )}

          {parseErrors.length > 0 && (
            <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-red-600">Parse Errors</CardTitle>
                <CardDescription>
                  The following errors were found in your CSV file:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {parseErrors.map((error, index) => (
                    <li key={index} className="text-red-600 text-sm">• {error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {campaignData.length > 0 && (
            <DataTable data={campaignData} />
          )}

          {/* Status Information */}
          {campaignData.length > 0 && !isReadyToPush && (
            <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800">Setup Required</span>
                </CardTitle>
                <CardDescription>
                  Please complete the following steps before pushing campaigns:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {!accessToken && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Facebook access token is required</span>
                    </div>
                  )}
                  {!accountId && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Ad account selection is required</span>
                    </div>
                  )}
                  {parseErrors.length > 0 && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Fix validation errors first</span>
                    </div>
                  )}
                  {accessToken && accountId && parseErrors.length === 0 && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Ready to push campaigns!</span>
                    </div>
                  )}
                </div>
                {(!accessToken || !accountId) && (
                  <div className="mt-4">
                    <Button 
                      onClick={() => router.push('/settings')}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl"
                    >
                      Go to Settings
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </div>
  );
}
