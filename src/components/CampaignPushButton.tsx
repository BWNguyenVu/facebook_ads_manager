'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CampaignData } from '@/types/facebook';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Loader2 
} from 'lucide-react';

interface CampaignResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  facebook_ids?: {
    campaign_id?: string;
    adset_id?: string;
    creative_id?: string;
    ad_id?: string;
  };
  error?: string;
  log_id?: string;
}

interface CampaignPushButtonProps {
  campaigns: CampaignData[];
  accountId: string;
  accessToken: string;
  disabled?: boolean;
  onResults?: (results: CampaignResult[]) => void;
}

export function CampaignPushButton({ 
  campaigns, 
  accountId,
  accessToken,
  disabled = false,
  onResults 
}: CampaignPushButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<CampaignResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePushCampaigns = async () => {
    if (campaigns.length === 0 || !accountId) {
      alert('No campaigns to process or account ID missing');
      return;
    }

    if (!accessToken || !accessToken.trim()) {
      alert('Access token is required');
      return;
    }

    // Validate token format
    const cleanToken = accessToken.trim();
    if (cleanToken.length < 50) {
      alert('Invalid access token format - token too short');
      return;
    }

    console.log('=== CAMPAIGN PUSH DEBUG ===');
    console.log('Access Token Preview:', cleanToken.substring(0, 20) + '...');
    console.log('Access Token Length:', cleanToken.length);
    console.log('Account ID:', accountId);
    console.log('Campaign Count:', campaigns.length);

    // Prepare request body
    const requestBody = {
      campaigns,
      accountId,
      accessToken: cleanToken  // Changed from access_token to accessToken
    };

    console.log('=== REQUEST BODY DEBUG ===');
    console.log('Full Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('Request URL:', '/api/facebook/campaigns');
    console.log('Request Method:', 'POST');
    console.log('Request Headers:', { 'Content-Type': 'application/json' });
    console.log('================================');

    setIsProcessing(true);
    setResults([]);
    setCurrentIndex(0);

    try {
      // Get JWT token from localStorage for API authentication
      const token = localStorage.getItem('auth_token'); // Changed from 'authToken' to 'auth_token'
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if JWT token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('JWT Token added to request headers');
        console.log('Token preview:', token.substring(0, 20) + '...');
      } else {
        console.warn('No JWT token found in localStorage');
        alert('Authentication required. Please login again.');
        return;
      }

      console.log('Request headers:', headers);

      const response = await fetch('/api/facebook/campaigns', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('Success response:', data);
      
      setResults(data.results || []);
      
      if (onResults) {
        onResults(data.results || []);
      }
    } catch (error: any) {
      console.error('Error pushing campaigns:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      console.error('Full error details:', error);
      alert(`Error pushing campaigns: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
      setCurrentIndex(campaigns.length);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const pendingCount = results.filter(r => r.status === 'pending').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Push Campaigns to Facebook</span>
          </div>
          {campaigns.length > 0 && (
            <Badge variant="outline">
              {campaigns.length} campaigns ready
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 w-full">
        {/* Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
          <Button
            onClick={handlePushCampaigns}
            disabled={disabled || isProcessing || campaigns.length === 0 || !accountId}
            className="flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Start Campaign Creation</span>
              </>
            )}
          </Button>

          {!accountId && (
            <Badge variant="destructive">
              Account ID required
            </Badge>
          )}
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className="space-y-2 w-full">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{currentIndex} / {campaigns.length}</span>
            </div>
            <Progress value={(currentIndex / campaigns.length) * 100} className="w-full" />
          </div>
        )}

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-gray-600">Success</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto w-full">
            <h4 className="font-medium text-sm text-gray-700">Campaign Results:</h4>
            {results.map((result, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg w-full">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {getStatusIcon(result.status)}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{result.name}</div>
                    {result.error && (
                      <div className="text-xs text-red-600 break-words">{result.error}</div>
                    )}
                    {result.facebook_ids?.campaign_id && (
                      <div className="text-xs text-gray-500 break-all">
                        Campaign ID: {result.facebook_ids.campaign_id}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {getStatusBadge(result.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warning */}
        {campaigns.length > 0 && !isProcessing && results.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <div className="font-medium">Ready to create {campaigns.length} campaigns</div>
                <div>This will create campaigns, ad sets, creatives, and ads on Facebook. Make sure to review your data before proceeding.</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
