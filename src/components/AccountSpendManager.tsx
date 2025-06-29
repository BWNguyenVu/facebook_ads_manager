'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Activity,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { AccountSpendData, DatePreset, SpendSummary } from '@/types/insights';

interface AccountSpendManagerProps {
  userSession?: any;
}

export function AccountSpendManager({ userSession }: AccountSpendManagerProps) {
  const [spendData, setSpendData] = useState<AccountSpendData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<DatePreset>('today');
  const [summary, setSummary] = useState<SpendSummary | null>(null);

  const datePresets: { value: DatePreset; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_30d', label: 'Last 30 Days' },
    { value: 'maximum', label: 'Lifetime' }
  ];

  useEffect(() => {
    if (userSession?.selected_account?.account_id) {
      loadSpendData();
      loadSpendSummary();
    }
  }, [userSession, selectedPeriod]);

  const loadSpendData = async () => {
    if (!userSession?.selected_account?.account_id) {
      setError('No account selected');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const accessToken = getAccessToken();
      const jwtToken = getJWTToken();
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      if (!jwtToken) {
        throw new Error('No JWT token available. Please login again.');
      }

      const accountId = userSession.selected_account.account_id;
      console.log(`Loading spend data for account ${accountId} with period ${selectedPeriod}`);
      const url = `/api/facebook/insights?account_id=${accountId}&access_token=${encodeURIComponent(accessToken)}&date_preset=${selectedPeriod}&fields=spend,impressions,clicks,reach,cpm,cpc,ctr`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to fetch spend data');
      }

      if (result.data && result.data.length > 0) {
        const insight = result.data[0];
        const spendAmount = parseFloat(insight.spend || '0');
        
        const accountCurrency = getAccountCurrency();
        
        const periodData: AccountSpendData = {
          period: selectedPeriod,
          label: datePresets.find(p => p.value === selectedPeriod)?.label || selectedPeriod,
          spend: spendAmount,
          date_start: insight.date_start,
          date_stop: insight.date_stop
        };

        setSpendData([periodData]);
      } else {
        setSpendData([]);
      }

    } catch (error: any) {
      console.error('Error loading spend data:', error);
      setError(error.message || 'Failed to load spend data');
      setSpendData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpendSummary = async () => {
    if (!userSession?.selected_account?.account_id) return;

    try {
      const accessToken = getAccessToken();
      const jwtToken = getJWTToken();
      
      if (!accessToken || !jwtToken) return;

      const accountId = userSession.selected_account.account_id;
      const periods: DatePreset[] = ['today', 'yesterday', 'this_month', 'last_30d', 'maximum'];
      
      const promises = periods.map(async (period) => {
        const url = `/api/facebook/insights?account_id=${accountId}&access_token=${encodeURIComponent(accessToken)}&date_preset=${period}&fields=spend`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        });
        const result = await response.json();
        
        if (response.ok && result.data && result.data.length > 0) {
          return { period, spend: parseFloat(result.data[0].spend || '0') };
        }
        return { period, spend: 0 };
      });

      const results = await Promise.all(promises);
      const currency = getAccountCurrency();

      const summaryData: SpendSummary = {
        today: results.find(r => r.period === 'today')?.spend || 0,
        yesterday: results.find(r => r.period === 'yesterday')?.spend || 0,
        this_month: results.find(r => r.period === 'this_month')?.spend || 0,
        last_30d: results.find(r => r.period === 'last_30d')?.spend || 0,
        maximum: results.find(r => r.period === 'maximum')?.spend || 0,
        currency
      };

      setSummary(summaryData);

    } catch (error) {
      console.error('Error loading spend summary:', error);
    }
  };

  const debugAccessToken = async () => {
    const accessToken = getAccessToken();
    const jwtToken = getJWTToken();
    
    if (!accessToken) {
      setError('No access token available');
      return;
    }

    if (!jwtToken) {
      setError('No JWT token available. Please login again.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/facebook/debug-token?access_token=${encodeURIComponent(accessToken)}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to debug token');
      }
      
      console.log('Token debug info:', result.debug_info);
      
      // Show debug info in alert
      const info = result.debug_info;
      const permissions = info.permissions?.data?.map((p: any) => `${p.permission} (${p.status})`).join(', ') || 'None';
      const accounts = info.ad_accounts?.data?.length || 0;
      const insightsTest = info.insights_test;
      
      alert(`Token Debug Info:
User: ${info.me?.name || 'Unknown'} (${info.me?.id || 'No ID'})
Permissions: ${permissions}
Ad Accounts: ${accounts} accounts found
Insights Test: ${insightsTest ? (insightsTest.success ? 'SUCCESS' : `FAILED - ${JSON.stringify(insightsTest.data)}`) : 'Not tested'}
Token Status: ${info.me?.error ? 'Invalid' : 'Valid'}`);
      
    } catch (error: any) {
      console.error('Token debug failed:', error);
      setError(`Token debug failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAccessToken = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setError('No access token available');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Test the access token with a simple Facebook API call
      const response = await fetch(`https://graph.facebook.com/v17.0/me?access_token=${accessToken}&fields=id,name`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Invalid access token');
      }
      
      console.log('Access token is valid:', result);
      alert(`Access token is valid! User: ${result.name} (ID: ${result.id})`);
      
    } catch (error: any) {
      console.error('Access token test failed:', error);
      setError(`Access token test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getJWTToken = () => {
    // Get JWT token from localStorage for API authentication
    return localStorage.getItem('auth_token');
  };

  const getAccessToken = () => {
    // Get from localStorage or userSession
    return localStorage.getItem('long_lived_access_token') || 
           userSession?.access_token ||
           userSession?.selected_account?.access_token;
  };

  const getAccountCurrency = () => {
    // Get currency from account settings or default to VND
    return userSession?.selected_account?.currency || 
           localStorage.getItem('account_currency') || 
           'VND';
  };

  const formatCurrency = (amount: number, currency: string = 'VND') => {
    // Convert from Facebook's minor units (cents) to major units
    const actualAmount = currency === 'VND' ? amount : amount / 100;
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(actualAmount);
  };

  const getSpendTrend = () => {
    if (!summary) return null;
    
    const todaySpend = summary.today;
    const yesterdaySpend = summary.yesterday;
    
    if (yesterdaySpend === 0) return null;
    
    const percentChange = ((todaySpend - yesterdaySpend) / yesterdaySpend) * 100;
    return {
      percentage: percentChange,
      isUp: percentChange > 0
    };
  };

  const exportSpendData = () => {
    if (!spendData.length && !summary) return;

    const exportData = {
      account_id: userSession?.selected_account?.account_id,
      account_name: userSession?.selected_account?.account_name,
      currency: getAccountCurrency(),
      current_period: {
        period: selectedPeriod,
        data: spendData[0] || null
      },
      summary: summary,
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `account-spend-${userSession?.selected_account?.account_id}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!userSession?.selected_account?.account_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 lg:p-6">
        <div className="w-full">
          <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <AlertTriangle className="h-10 w-10 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Account Selected</h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                  Please select an ad account in Settings to view spend data and analytics.
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => window.location.href = '/settings'} 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Go to Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const trend = getSpendTrend();
  const currency = getAccountCurrency();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 lg:p-6">
      <div className="w-full space-y-6 lg:space-y-8">
        {/* Modern Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 lg:p-8">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 lg:gap-6">
            {/* Title Section */}
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Account Spend Manager
                </h1>
                <p className="text-sm lg:text-base text-gray-500 mt-1">Monitor and analyze your advertising spend in real-time</p>
              </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-wrap items-center gap-3 lg:gap-4">
              {/* Period Selector */}
              <div className="flex items-center space-x-3 bg-gray-50/50 rounded-xl p-2 lg:p-3 border border-gray-200/50">
                <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
                <Select value={selectedPeriod} onValueChange={(value: DatePreset) => setSelectedPeriod(value)}>
                  <SelectTrigger className="w-36 lg:w-44 border-0 bg-transparent focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200/50 shadow-xl">
                    {datePresets.map(preset => (
                      <SelectItem key={preset.value} value={preset.value} className="rounded-lg">
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={loadSpendData} 
                  disabled={isLoading} 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl px-3 lg:px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                
                <Button 
                  onClick={testAccessToken} 
                  disabled={isLoading} 
                  variant="outline" 
                  className="border-gray-200/50 hover:bg-gray-50/50 rounded-xl px-3 lg:px-4 py-2 transition-all duration-200"
                >
                  <Activity className="h-4 w-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Test Token</span>
                </Button>
                
                <Button 
                  onClick={debugAccessToken} 
                  disabled={isLoading} 
                  variant="outline" 
                  className="border-gray-200/50 hover:bg-gray-50/50 rounded-xl px-3 lg:px-4 py-2 transition-all duration-200"
                >
                  <AlertTriangle className="h-4 w-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Debug</span>
                </Button>
                
                <Button 
                  onClick={exportSpendData} 
                  variant="outline" 
                  className="border-gray-200/50 hover:bg-gray-50/50 rounded-xl px-3 lg:px-4 py-2 transition-all duration-200"
                >
                  <BarChart3 className="h-4 w-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Account Info */}
          {userSession?.selected_account && (
            <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-200/50">
              <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200/50 px-3 lg:px-4 py-2 rounded-lg font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {userSession.selected_account.account_name || userSession.selected_account.account_id}
                </Badge>
                <div className="flex items-center text-sm text-gray-600 bg-gray-50/50 px-3 py-2 rounded-lg">
                  <span className="font-medium">Currency:</span>
                  <span className="ml-2 font-semibold text-gray-900">{currency}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="rounded-xl border-red-200/50 bg-red-50/50 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Spend Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
            <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-500 font-medium mb-2">Today</p>
                    <p className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      {formatCurrency(summary.today, currency)}
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Activity className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                </div>
                {trend && (
                  <div className="mt-3 lg:mt-4 flex items-center bg-gray-50/50 rounded-lg p-2">
                    {trend.isUp ? (
                      <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-red-500 mr-2" />
                    ) : (
                      <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 text-green-500 mr-2" />
                    )}
                    <span className={`text-xs lg:text-sm font-medium ${trend.isUp ? 'text-red-600' : 'text-green-600'}`}>
                      {Math.abs(trend.percentage).toFixed(1)}% vs yesterday
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-500 font-medium mb-2">Yesterday</p>
                    <p className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                      {formatCurrency(summary.yesterday, currency)}
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                    <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-500 font-medium mb-2">This Month</p>
                    <p className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                      {formatCurrency(summary.this_month, currency)}
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-500 font-medium mb-2">Last 30 Days</p>
                    <p className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                      {formatCurrency(summary.last_30d, currency)}
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-500 font-medium mb-2">Lifetime</p>
                    <p className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                      {formatCurrency(summary.maximum, currency)}
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                    <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current Period Details */}
        {spendData.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-lg lg:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {spendData[0].label} Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                <div className="space-y-3">
                  <p className="text-xs lg:text-sm text-gray-500 font-medium">Period</p>
                  <p className="font-bold text-gray-900 text-base lg:text-lg">{spendData[0].label}</p>
                  <div className="bg-gray-50/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium">
                      {spendData[0].date_start} to {spendData[0].date_stop}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-xs lg:text-sm text-gray-500 font-medium">Total Spend</p>
                  <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {formatCurrency(spendData[0].spend, currency)}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs lg:text-sm text-gray-500 font-medium">Account</p>
                  <p className="font-bold text-gray-900 text-base lg:text-lg">
                    {userSession?.selected_account?.account_name || 'Unknown Account'}
                  </p>
                  <div className="bg-gray-50/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium">
                      ID: {userSession?.selected_account?.account_id}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
            <CardContent className="flex items-center justify-center h-32 lg:h-40">
              <div className="text-center">
                <div className="relative">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 lg:h-8 lg:w-8 animate-spin text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20 animate-ping"></div>
                </div>
                <p className="text-gray-600 font-medium text-sm lg:text-base">Loading spend data...</p>
                <p className="text-xs lg:text-sm text-gray-500 mt-1">Please wait while we fetch your analytics</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data State */}
        {!isLoading && spendData.length === 0 && !error && (
          <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
            <CardContent className="flex items-center justify-center h-32 lg:h-40">
              <div className="text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-4 lg:mb-6 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 lg:h-10 lg:w-10 text-gray-400" />
                </div>
                <h3 className="text-base lg:text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
                <p className="text-sm lg:text-base text-gray-500 mb-4">No spend data available for {selectedPeriod}</p>
                <Button 
                  onClick={loadSpendData} 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl px-4 lg:px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
