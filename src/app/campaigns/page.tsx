'use client';

import React, { useState, useEffect } from 'react';
import { createClientLogger } from '@/lib/client-logger';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { CampaignTable } from '@/components/CampaignTable';
import { AdSetTable } from '@/components/AdSetTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserSession } from '@/types/user';
import { FacebookCampaign, FacebookAdSet, FacebookCampaignResponse, FacebookAdSetResponse, FacebookCampaignWithInsights, FacebookCampaignInsights } from '@/types/facebook-campaign';
import { 
  Activity, 
  User,
  LogOut,
  ArrowLeft,
  AlertTriangle,
  Settings,
  RefreshCw,
  FileText,
  Upload
} from 'lucide-react';

type ViewMode = 'campaigns' | 'adsets';


const logger = createClientLogger('CampaignsPage');
export default function CampaignsPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('campaigns');
  
  // Campaign data
  const [campaigns, setCampaigns] = useState<FacebookCampaignWithInsights[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<FacebookCampaignWithInsights | null>(null);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [currentDatePreset, setCurrentDatePreset] = useState('last_7d');
  
  // AdSet data
  const [adsets, setAdsets] = useState<FacebookAdSet[]>([]);
  const [adsetsLoading, setAdsetsLoading] = useState(false);
  
  // Error states
  const [error, setError] = useState<string>('');

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
      
      // Auto-load campaigns with insights if we have access token and account
      if (getAccessToken() && getAccountId()) {
        loadCampaignsWithInsights();
      }
    } catch (error) {
      logger.error('Invalid session data:', error);
      router.push('/auth');
    }
  }, [router]);

  // Get access token from localStorage, session, or database
  const getAccessToken = () => {
    // First try localStorage
    const localToken = localStorage.getItem('long_lived_access_token');
    if (localToken) return localToken;
    
    // Then try session
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
        logger.error('Error parsing facebook_config:', e);
      }
    }
    
    return '';
  };

  const loadCampaigns = async () => {
    const accessToken = getAccessToken();
    const accountId = getAccountId();
    
    if (!accessToken || !accountId) {
      setError('Missing access token or account ID. Please configure in Settings.');
      return;
    }

    setCampaignsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `/api/facebook/campaigns/list?account_id=${encodeURIComponent(accountId)}&access_token=${encodeURIComponent(accessToken)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch campaigns');
      }

      const data: FacebookCampaignResponse = await response.json();
      setCampaigns(data.data || []);
      logger.debug(`Loaded ${data.data?.length || 0} campaigns`);
    } catch (error: any) {
      logger.error('Error loading campaigns:', error);
      setError(error.message || 'Failed to load campaigns');
    } finally {
      setCampaignsLoading(false);
    }
  };

  const loadAdSets = async (campaign: FacebookCampaign) => {
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      setError('Missing access token. Please configure in Settings.');
      return;
    }

    setAdsetsLoading(true);
    setError('');
    setSelectedCampaign(campaign);
    setViewMode('adsets');
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `/api/facebook/adsets?campaign_id=${encodeURIComponent(campaign.id)}&access_token=${encodeURIComponent(accessToken)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch ad sets');
      }

      const data: FacebookAdSetResponse = await response.json();
      setAdsets(data.data || []);
      logger.debug(`Loaded ${data.data?.length || 0} ad sets for campaign ${campaign.name}`);
    } catch (error: any) {
      logger.error('Error loading ad sets:', error);
      setError(error.message || 'Failed to load ad sets');
      // Don't change view mode if loading failed
      setViewMode('campaigns');
      setSelectedCampaign(null);
    } finally {
      setAdsetsLoading(false);
    }
  };

  const loadCampaignsWithInsights = async (datePreset = currentDatePreset) => {
    const accessToken = getAccessToken();
    const accountId = getAccountId();
    
    if (!accessToken || !accountId) {
      setError('Missing access token or account ID. Please configure in Settings.');
      return;
    }

    setCampaignsLoading(true);
    setError('');
    
    try {
      // First load campaigns
      const token = localStorage.getItem('auth_token');
      const campaignsResponse = await fetch(
        `/api/facebook/campaigns/list?account_id=${encodeURIComponent(accountId)}&access_token=${encodeURIComponent(accessToken)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!campaignsResponse.ok) {
        const errorData = await campaignsResponse.json();
        throw new Error(errorData.error || 'Failed to fetch campaigns');
      }

      const campaignsData: FacebookCampaignResponse = await campaignsResponse.json();
      const campaignsList = campaignsData.data || [];

      if (campaignsList.length === 0) {
        setCampaigns([]);
        return;
      }

      // Then load insights for campaigns
      const campaignIds = campaignsList.map(c => c.id).join(',');
      const insightsResponse = await fetch(
        `/api/facebook/campaigns/insights?account_id=${encodeURIComponent(accountId)}&access_token=${encodeURIComponent(accessToken)}&campaign_ids=${encodeURIComponent(campaignIds)}&level=campaign&date_preset=${encodeURIComponent(datePreset)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      let insightsData: FacebookCampaignInsights[] = [];
      if (insightsResponse.ok) {
        const insights = await insightsResponse.json();
        insightsData = insights.data || [];
      } else {
        console.warn('Failed to load insights data, continuing without insights');
      }

      // Merge campaigns with insights
      const campaignsWithInsights: FacebookCampaignWithInsights[] = campaignsList.map(campaign => {
        const insight = insightsData.find(i => i.campaign_id === campaign.id);
        return {
          ...campaign,
          insights: insight
        };
      });

      setCampaigns(campaignsWithInsights);
      logger.debug(`Loaded ${campaignsWithInsights.length} campaigns with insights for ${datePreset}`);
    } catch (error: any) {
      logger.error('Error loading campaigns with insights:', error);
      setError(error.message || 'Failed to load campaigns');
      
      // Fallback to loading campaigns without insights
      loadCampaigns();
    } finally {
      setCampaignsLoading(false);
    }
  };

  const handleBackToCampaigns = () => {
    setViewMode('campaigns');
    setSelectedCampaign(null);
    setAdsets([]);
    setError('');
  };

  const handleViewAds = (adset: FacebookAdSet) => {
    // TODO: Implement ads view
    logger.debug('View ads for adset:', adset.name);
  };

  const handleStatusChange = async (id: string, newStatus: 'ACTIVE' | 'PAUSED') => {
    // Status update is handled by CampaignActionButton component
    // This callback updates local state immediately for better UX
    logger.debug(`Campaign ${id} status changed to ${newStatus}`);
    
    // Update campaigns state immediately (optimistic update)
    setCampaigns(prevCampaigns => 
      prevCampaigns.map(campaign => 
        campaign.id === id 
          ? { ...campaign, status: newStatus, effective_status: newStatus }
          : campaign
      )
    );
    
    // Update adsets state if viewing adsets for this campaign
    if (viewMode === 'adsets' && selectedCampaign?.id === id) {
      setAdsets(prevAdsets => 
        prevAdsets.map(adset => 
          adset.campaign_id === id 
            ? { ...adset, campaign_status: newStatus }
            : adset
        )
      );
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

  const handleDatePresetChange = (newDatePreset: string) => {
    setCurrentDatePreset(newDatePreset);
    loadCampaignsWithInsights(newDatePreset);
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
                <Activity className="h-8 w-8 text-blue-600" />
                <span>Facebook Campaigns</span>
              </h1>
              <p className="text-gray-600">
                Manage your Facebook advertising campaigns and ad sets
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
              onClick={() => router.push('/logs')}
              variant="outline"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Logs
            </Button>
            <Button
              onClick={() => router.push('/import')}
              variant="outline"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button
              onClick={() => router.push('/settings')}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
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

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Configuration Check */}
        {(!getAccessToken() || !getAccountId()) && (
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Please configure your Facebook access token and select an ad account in{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto font-semibold" 
                onClick={() => router.push('/settings')}
              >
                Settings
              </Button>
              {' '}before viewing campaigns.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {viewMode === 'campaigns' ? (
          <CampaignTable
            campaigns={campaigns}
            isLoading={campaignsLoading}
            onViewDetails={loadAdSets}
            onRefresh={() => loadCampaignsWithInsights(currentDatePreset)}
            onStatusChange={handleStatusChange}
            onRefreshAfterUpdate={() => loadCampaignsWithInsights(currentDatePreset)}
            onDatePresetChange={handleDatePresetChange}
            userSession={userSession}
            accessToken={getAccessToken()}
            currentDatePreset={currentDatePreset}
          />
        ) : viewMode === 'adsets' && selectedCampaign ? (
          <AdSetTable
            adsets={adsets}
            campaign={selectedCampaign}
            isLoading={adsetsLoading}
            onBack={handleBackToCampaigns}
            onRefresh={() => loadAdSets(selectedCampaign)}
            onViewAds={handleViewAds}
            onStatusChange={handleStatusChange}
          />
        ) : null}
      </div>
    </Layout>
  );
}
