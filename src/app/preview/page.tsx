'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { CampaignPreview } from '@/components/CampaignPreview';
import { FileUploader } from '@/components/FileUploader';
import { DataTable } from '@/components/DataTable';
import { CampaignPushButton } from '@/components/CampaignPushButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CampaignData } from '@/types/facebook';
import { UserSession } from '@/types/user';
import { 
  Eye, 
  User,
  LogOut,
  ArrowLeft,
  Upload,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function PreviewPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
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

  // Get access token from localStorage first, then fallback to session
  const getAccessToken = () => {
    return localStorage.getItem('long_lived_access_token') || userSession?.long_lived_token || '';
  };

  // Get account ID from session or config
  const getAccountId = () => {
    if (userSession?.selected_account?.account_id) {
      return userSession.selected_account.account_id;
    }
    
    // Try to get from config
    const savedConfig = localStorage.getItem('facebook_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        return config.default_account_id || '';
      } catch (error) {
        console.error('Error parsing config:', error);
      }
    }
    
    return '';
  };

  const handleDataParsed = (data: CampaignData[], errors: string[]) => {
    setCampaigns(data);
    setParseErrors(errors);
  };

  const handleCampaignComplete = (results: any[]) => {
    console.log('Campaigns completed:', results);
    // Optionally redirect to logs or stats
    // router.push('/logs');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_session');
    router.push('/auth');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleEditCampaign = (index: number) => {
    // TODO: Implement edit functionality
    console.log('Edit campaign at index:', index);
  };

  const handleRemoveCampaign = (index: number) => {
    const updatedCampaigns = campaigns.filter((_, i) => i !== index);
    setCampaigns(updatedCampaigns);
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <Eye className="h-8 w-8 text-blue-600" />
                <span>Campaign Preview</span>
              </h1>
              <p className="text-gray-600">
                Upload, preview and validate your campaigns before publishing
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
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-blue-600" />
              <span>Upload Campaign Data</span>
            </CardTitle>
            <CardDescription>
              Upload your CSV file containing campaign information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader onDataParsed={handleDataParsed} />
          </CardContent>
        </Card>

        {/* Parse Errors */}
        {parseErrors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Parse Errors</span>
              </CardTitle>
              <CardDescription>
                Please fix these errors before pushing to Facebook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {parseErrors.map((error, index) => (
                  <li key={index} className="text-red-600 text-sm">
                    • {error}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Campaign Preview */}
        {campaigns.length > 0 && (
          <CampaignPreview
            campaigns={campaigns}
            onEdit={handleEditCampaign}
            onRemove={handleRemoveCampaign}
          />
        )}

        {/* Data Table */}
        {campaigns.length > 0 && (
          <DataTable 
            data={campaigns} 
            title="Campaign Data Table"
            description="Detailed view of your campaign data"
          />
        )}

        {/* Campaign Push Button */}
        {campaigns.length > 0 && parseErrors.length === 0 && getAccessToken() && getAccountId() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Ready to Push</span>
              </CardTitle>
              <CardDescription>
                Your campaigns are validated and ready to be published to Facebook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignPushButton
                campaigns={campaigns}
                accessToken={getAccessToken()}
                accountId={getAccountId()}
                onResults={handleCampaignComplete}
              />
            </CardContent>
          </Card>
        )}

        {/* Missing Token Warning */}
        {campaigns.length > 0 && parseErrors.length === 0 && (!getAccessToken() || !getAccountId()) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Missing Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                To push campaigns to Facebook, you need:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {!getAccessToken() && (
                  <li className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>Facebook Access Token</span>
                  </li>
                )}
                {!getAccountId() && (
                  <li className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>Facebook Ad Account ID</span>
                  </li>
                )}
              </ul>
              <Button 
                onClick={() => router.push('/settings')} 
                className="mt-4"
                variant="outline"
              >
                Go to Settings
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
