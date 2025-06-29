'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserSession } from '@/types/user';
import { 
  BarChart3, 
  Upload, 
  Eye, 
  Settings, 
  LogOut,
  CheckCircle,
  Clock,
  User,
  FileText,
  AlertTriangle,
  TrendingUp,
  Activity,
  BookOpen
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
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
      loadUserAccounts(token);
      setIsLoading(false);
    } catch (error) {
      console.error('Invalid session data:', error);
      router.push('/auth');
    }
  }, [router]);

  // Load stats when userSession is available
  useEffect(() => {
    if (userSession?.user_id) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        loadStats(token, userSession.selected_account?.account_id);
      }
    }
  }, [userSession]);

  const loadUserAccounts = async (token: string) => {
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
      console.error('Error loading accounts:', error);
    }
  };

  const loadStats = async (token: string, accountId?: string) => {
    if (!userSession?.user_id) {
      console.warn('No user_id found, skipping stats load');
      return;
    }

    try {
      const url = accountId 
        ? `/api/mongodb/basic-stats?account_id=${accountId}`
        : '/api/mongodb/basic-stats';
      
      console.log('Loading basic stats from:', url, 'with user_id:', userSession.user_id);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Basic stats loaded successfully:', data);
        console.log('Stats structure:', JSON.stringify(data.stats, null, 2));
        setStats(data.stats);
      } else {
        const errorData = await response.json();
        console.error('Failed to load basic stats:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error loading basic stats:', error);
    }
  };

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

  const handleCampaignComplete = (results: any[]) => {
    console.log('Campaigns completed:', results);
    // Reload stats after completion
    const token = localStorage.getItem('auth_token');
    if (token && userSession) {
      loadStats(token, userSession.selected_account?.account_id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_session');
    router.push('/auth');
  };

  const handleNavigate = (path: string) => {
    router.push(path);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Layout>
        <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
          {/* Modern Header */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Facebook Ads Manager
                  </h1>
                  <p className="text-sm lg:text-base text-gray-500 mt-1">
                    Manage your Facebook advertising campaigns with ease
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => router.push('/settings')} 
                  variant="outline" 
                  className="border-gray-200/50 hover:bg-gray-50/50 rounded-xl px-4 py-2 transition-all duration-200"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="border-red-200/50 hover:bg-red-50/50 text-red-600 hover:text-red-700 rounded-xl px-4 py-2 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
            
            {/* User Info */}
            {userSession && (
              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                  <Badge className="bg-green-100/50 text-green-700 border-green-200/50 px-3 py-2 rounded-lg font-medium">
                    <User className="w-4 h-4 mr-2" />
                    {userSession.email}
                  </Badge>
                  {userSession.selected_account && (
                    <Badge className="bg-blue-100/50 text-blue-700 border-blue-200/50 px-3 py-2 rounded-lg font-medium">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {userSession.selected_account.account_name || userSession.selected_account.account_id}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Quick overview of your campaign activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                  <p className="text-sm text-gray-600">Total Campaigns</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.success || 0}</p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.error || 0}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <Button 
                  onClick={() => handleNavigate('/stats')} 
                  variant="outline"
                  size="sm"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigate('/upload')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-blue-600" />
                <span>Upload CSV</span>
              </CardTitle>
              <CardDescription>
                Upload your campaign data in CSV format
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigate('/preview')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-600" />
                <span>Preview & Push</span>
              </CardTitle>
              <CardDescription>
                Review campaigns and push to Facebook
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigate('/logs')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span>Campaign Logs</span>
              </CardTitle>
              <CardDescription>
                View campaign execution history
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigate('/documentation')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span>Hướng Dẫn Sử Dụng</span>
              </CardTitle>
              <CardDescription>
                Hướng dẫn chi tiết cách sử dụng Facebook Ads Manager
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigate('/stats')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <span>Statistics</span>
              </CardTitle>
              <CardDescription>
                Analyze campaign performance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Settings Quick Access */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigate('/settings')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <span>Account Settings</span>
            </CardTitle>
            <CardDescription>
              Configure Facebook access tokens and ad accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Access Token: {getAccessToken() ? '✅ Configured' : '❌ Missing'}
                </p>
                <p className="text-sm text-gray-600">
                  Ad Account: {getAccountId() ? '✅ Selected' : '❌ Not Selected'}
                </p>
              </div>
              {(!getAccessToken() || !getAccountId()) && (
                <Badge variant="destructive">Action Required</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        </div>
      </Layout>
    </div>
  );
}
