'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  DollarSign,
  Target,
  Users,
  RefreshCw,
  Download,
  Filter,
  Eye
} from 'lucide-react';

interface Statistics {
  total_campaigns: number;
  successful_campaigns: number;
  failed_campaigns: number;
  pending_campaigns: number;
  success_rate: number;
  total_budget: number;
  average_budget: number;
  campaigns_by_status: {
    success: number;
    error: number;
    pending: number;
  };
  campaigns_by_account: Array<{
    account_id: string;
    total: number;
    success: number;
    error: number;
    pending: number;
  }>;
  recent_campaigns: Array<{
    name: string;
    status: string;
    created_at: string;
    daily_budget?: number;
  }>;
  daily_stats?: Array<{
    date: string;
    total: number;
    success: number;
    error: number;
  }>;
}

interface CampaignStatisticsProps {
  userSession?: any;
}

export function CampaignStatistics({ userSession }: CampaignStatisticsProps) {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  useEffect(() => {
    loadStats();
  }, [userSession, timeRange, selectedAccount]);

  const loadStats = async () => {
    if (!userSession?.user_id) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      let url = `/api/mongodb/stats?time_range=${timeRange}`;
      
      if (selectedAccount !== 'all') {
        url += `&account_id=${selectedAccount}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const exportStats = () => {
    if (!stats) return;

    const reportData = {
      summary: {
        total_campaigns: stats.total_campaigns,
        successful_campaigns: stats.successful_campaigns,
        failed_campaigns: stats.failed_campaigns,
        success_rate: stats.success_rate,
        total_budget: stats.total_budget,
      },
      by_account: stats.campaigns_by_account || [],
      recent_campaigns: stats.recent_campaigns || [],
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-statistics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span>Campaign Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-40">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20 animate-ping"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading statistics...</p>
              <p className="text-sm text-gray-500 mt-1">Please wait while we analyze your campaigns</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full">
        <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span>Campaign Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-40">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <BarChart3 className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
              <p className="text-gray-500">No campaign statistics available at the moment</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Campaign Statistics
              </h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">Comprehensive analytics and performance insights</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 lg:gap-4">
            {/* Time Range Selector */}
            <div className="flex items-center space-x-3 bg-gray-50/50 rounded-xl p-2 lg:p-3 border border-gray-200/50">
              <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 lg:w-36 border-0 bg-transparent focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-200/50 shadow-xl">
                  <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
                  <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
                  <SelectItem value="90d" className="rounded-lg">Last 90 days</SelectItem>
                  <SelectItem value="all" className="rounded-lg">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Account Filter */}
            <div className="flex items-center space-x-3 bg-gray-50/50 rounded-xl p-2 lg:p-3 border border-gray-200/50">
              <Filter className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-32 lg:w-36 border-0 bg-transparent focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-200/50 shadow-xl">
                  <SelectItem value="all" className="rounded-lg">All Accounts</SelectItem>
                  {(stats?.campaigns_by_account || []).map(account => (
                    <SelectItem key={account.account_id} value={account.account_id} className="rounded-lg">
                      {account.account_id.substring(0, 10)}... ({account.total})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                onClick={loadStats} 
                disabled={isLoading} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl px-3 lg:px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              
              <Button 
                onClick={exportStats} 
                variant="outline" 
                className="border-gray-200/50 hover:bg-gray-50/50 rounded-xl px-3 lg:px-4 py-2 transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-blue-600 font-medium mb-2">Total Campaigns</p>
                <p className="text-lg lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {stats.total_campaigns}
                </p>
                <div className="mt-3 flex items-center space-x-2">
                  <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
                  <span className="text-xs lg:text-sm text-gray-600">Active campaigns</span>
                </div>
              </div>
              <div className="p-2 lg:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Activity className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-green-600 font-medium mb-2">Success Rate</p>
                <p className={`text-lg lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent`}>
                  {formatPercentage(stats.success_rate)}
                </p>
                <div className="mt-3">
                  <Badge className={`${getSuccessRateBadge(stats.success_rate)} text-xs rounded-lg px-2 py-1`}>
                    {stats.successful_campaigns} of {stats.total_campaigns}
                  </Badge>
                </div>
              </div>
              <div className="p-2 lg:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <Target className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-purple-600 font-medium mb-2">Total Budget</p>
                <p className="text-lg lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  {formatCurrency(stats.total_budget)}
                </p>
                <div className="mt-3">
                  <p className="text-xs lg:text-sm text-gray-600">
                    Avg: {formatCurrency(stats.average_budget)}
                  </p>
                </div>
              </div>
              <div className="p-2 lg:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-orange-600 font-medium mb-2">Accounts</p>
                <p className="text-lg lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  {stats.campaigns_by_account.length}
                </p>
                <div className="mt-3">
                  <p className="text-xs lg:text-sm text-gray-600">Active ad accounts</p>
                </div>
              </div>
              <div className="p-2 lg:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <span>Campaign Status Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="text-center p-4 lg:p-6 bg-green-50/80 backdrop-blur-sm rounded-2xl border border-green-200/30 hover:shadow-lg transition-all duration-300">
              <p className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                {stats.successful_campaigns}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-1">Successful</p>
              <div className="mt-3 w-full bg-gray-200/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(stats.successful_campaigns / stats.total_campaigns) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="text-center p-4 lg:p-6 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-200/30 hover:shadow-lg transition-all duration-300">
              <p className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                {stats.failed_campaigns}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-1">Failed</p>
              <div className="mt-3 w-full bg-gray-200/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(stats.failed_campaigns / stats.total_campaigns) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="text-center p-4 lg:p-6 bg-yellow-50/80 backdrop-blur-sm rounded-2xl border border-yellow-200/30 hover:shadow-lg transition-all duration-300">
              <p className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                {stats.pending_campaigns}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-1">Pending</p>
              <div className="mt-3 w-full bg-gray-200/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(stats.pending_campaigns / stats.total_campaigns) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Performance */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span>Performance by Account</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 lg:space-y-6">
            {(stats?.campaigns_by_account || []).map((account, index) => (
              <div key={account.account_id} className="bg-gray-50/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 lg:p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-mono text-sm lg:text-base font-semibold text-gray-800">{account.account_id}</p>
                    <p className="text-xs lg:text-sm text-gray-500 mt-1">{account.total} total campaigns</p>
                  </div>
                  <Badge className={`${getSuccessRateBadge((account.success / account.total) * 100)} rounded-lg px-3 py-1 text-xs font-medium`}>
                    {formatPercentage((account.success / account.total) * 100)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-green-50/50 rounded-lg p-3">
                    <p className="text-lg lg:text-xl font-bold text-green-600">{account.success}</p>
                    <p className="text-xs text-gray-600 font-medium">Success</p>
                  </div>
                  <div className="bg-red-50/50 rounded-lg p-3">
                    <p className="text-lg lg:text-xl font-bold text-red-600">{account.error}</p>
                    <p className="text-xs text-gray-600 font-medium">Failed</p>
                  </div>
                  <div className="bg-yellow-50/50 rounded-lg p-3">
                    <p className="text-lg lg:text-xl font-bold text-yellow-600">{account.pending}</p>
                    <p className="text-xs text-gray-600 font-medium">Pending</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Campaigns */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span>Recent Campaigns</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 lg:space-y-4">
            {(stats?.recent_campaigns || []).slice(0, 10).map((campaign, index) => (
              <div key={index} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50/50 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:shadow-lg transition-all duration-300">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm lg:text-base">{campaign.name}</p>
                  <p className="text-xs lg:text-sm text-gray-500 mt-1">
                    {new Date(campaign.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  {campaign.daily_budget && (
                    <span className="text-xs lg:text-sm text-gray-600 font-medium bg-gray-100/50 px-2 py-1 rounded-lg">
                      {formatCurrency(campaign.daily_budget)}
                    </span>
                  )}
                  <Badge 
                    className={`text-xs rounded-lg px-2 py-1 font-medium ${
                      campaign.status === 'success' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {campaign.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
