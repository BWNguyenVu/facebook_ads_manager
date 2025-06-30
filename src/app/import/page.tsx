'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { FacebookCsvImporter } from '@/components/FacebookCsvImporter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserSession } from '@/types/user';
import { 
  ArrowLeft, 
  Facebook, 
  Upload,
  Settings,
  AlertTriangle
} from 'lucide-react';

export default function ImportPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
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

  // Get access token from localStorage, session, or database
  const getAccessToken = () => {
    const localToken = localStorage.getItem('long_lived_access_token');
    if (localToken) return localToken;
    
    const sessionToken = userSession?.long_lived_token;
    if (sessionToken) return sessionToken;
    
    return '';
  };

  // Get account ID from session or config
  const getAccountId = () => {
    if (userSession?.selected_account?.account_id) {
      return userSession.selected_account.account_id;
    }
    
    const savedConfig = localStorage.getItem('facebook_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        return config.selected_account_id || '';
      } catch (e) {
        console.error('Error parsing facebook_config:', e);
      }
    }
    
    return '';
  };

  // Get page ID from config
  const getPageId = () => {
    const savedConfig = localStorage.getItem('facebook_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        return config.default_page_id || '';
      } catch (e) {
        console.error('Error parsing facebook_config:', e);
      }
    }
    
    return '';
  };

  const handleImportComplete = (results: any[]) => {
    console.log('Import completed:', results);
    // Redirect to campaigns page after successful import
    router.push('/campaigns');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userSession) {
    return null;
  }

  const accessToken = getAccessToken();
  const accountId = getAccountId();
  const pageId = getPageId();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push('/campaigns')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <Upload className="h-8 w-8 text-blue-600" />
                <span>Import Facebook Ads</span>
              </h1>
              <p className="text-gray-600">
                Import campaigns from Facebook Ads Manager CSV export
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push('/settings')}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Configuration Check */}
        {(!accessToken || !accountId) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please configure your Facebook access token and select an ad account in{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto font-semibold text-destructive" 
                onClick={() => router.push('/settings')}
              >
                Settings
              </Button>
              {' '}before importing campaigns.
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Facebook className="h-5 w-5" />
              <span>How to Import</span>
            </CardTitle>
            <CardDescription className="text-blue-700">
              Follow these steps to import your campaigns from Facebook Ads Manager
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-blue-800">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Step 1: Export from Facebook</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Open Facebook Ads Manager</li>
                  <li>Go to Campaigns or Ad Sets</li>
                  <li>Select data you want to export</li>
                  <li>Click "Export" → "Export table data"</li>
                  <li>Choose CSV format and download</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Step 2: Upload & Import</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Upload your CSV file below</li>
                  <li>System will automatically map data</li>
                  <li>Review configuration</li>
                  <li>Click "Import" to create campaigns</li>
                  <li>View results and manage campaigns</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Component */}
        {accessToken && accountId ? (
          <FacebookCsvImporter
            accessToken={accessToken}
            accountId={accountId}
            pageId={pageId}
            onImportComplete={handleImportComplete}
          />
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuration Required</h3>
              <p className="text-gray-600 mb-4">
                You need to configure your Facebook access token and ad account before importing campaigns.
              </p>
              <Button onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Go to Settings
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
