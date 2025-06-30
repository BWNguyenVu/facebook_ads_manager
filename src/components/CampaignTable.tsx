'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { CampaignToggle } from './CampaignToggle';
import { 
  Search, 
  Eye, 
  Play, 
  Pause,
  MoreHorizontal,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Filter
} from 'lucide-react';
import { FacebookCampaign, FacebookCampaignWithInsights } from '@/types/facebook-campaign';

interface CampaignTableProps {
  campaigns: FacebookCampaignWithInsights[];
  isLoading: boolean;
  onViewDetails: (campaign: FacebookCampaignWithInsights) => void;
  onRefresh: () => void;
  onStatusChange?: (campaignId: string, newStatus: 'ACTIVE' | 'PAUSED') => void;
  onRefreshAfterUpdate?: () => void;
  onDatePresetChange?: (datePreset: string) => void;
  userSession?: any;
  accessToken?: string;
  currentDatePreset?: string;
}

export function CampaignTable({ 
  campaigns, 
  isLoading, 
  onViewDetails, 
  onRefresh,
  onStatusChange,
  onRefreshAfterUpdate,
  onDatePresetChange,
  userSession,
  accessToken = '',
  currentDatePreset = 'last_7d'
}: CampaignTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [spendFilter, setSpendFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<string>(currentDatePreset);

  // Handle date preset change
  const handleDatePresetChange = (newDatePreset: string) => {
    setDatePreset(newDatePreset);
    if (onDatePresetChange) {
      onDatePresetChange(newDatePreset);
    }
  };
  
  const filteredCampaigns = campaigns.filter(campaign => {
    // Search filter
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.id.includes(searchTerm) ||
      campaign.objective?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
      (campaign.effective_status || campaign.status).toUpperCase() === statusFilter.toUpperCase();
    
    // Spend filter
    let matchesSpend = true;
    if (spendFilter !== 'all' && campaign.insights?.spend) {
      const spend = parseFloat(campaign.insights.spend);
      switch (spendFilter) {
        case 'low':
          matchesSpend = spend < 100000; // < 100k VND
          break;
        case 'medium':
          matchesSpend = spend >= 100000 && spend < 1000000; // 100k - 1M VND
          break;
        case 'high':
          matchesSpend = spend >= 1000000; // >= 1M VND
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesSpend;
  });

  const getObjectiveBadge = (objective: string) => {
    const objectiveMap: Record<string, { label: string; color: string }> = {
      'OUTCOME_ENGAGEMENT': { label: 'Engagement', color: 'bg-blue-100 text-blue-800' },
      'OUTCOME_TRAFFIC': { label: 'Traffic', color: 'bg-green-100 text-green-800' },
      'OUTCOME_LEADS': { label: 'Leads', color: 'bg-purple-100 text-purple-800' },
      'OUTCOME_SALES': { label: 'Sales', color: 'bg-orange-100 text-orange-800' },
      'OUTCOME_AWARENESS': { label: 'Awareness', color: 'bg-yellow-100 text-yellow-800' },
      'OUTCOME_APP_PROMOTION': { label: 'App Promotion', color: 'bg-indigo-100 text-indigo-800' },
    };

    const config = objectiveMap[objective];
    if (config) {
      return <Badge className={config.color}>{config.label}</Badge>;
    }
    return <Badge variant="outline">{objective}</Badge>;
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return '—';
    
    // Get currency from userSession or default to VND
    const currency = userSession?.selected_account?.currency || 
                    localStorage.getItem('account_currency') || 
                    'VND';
    
    // Facebook API returns amounts in minor units (cents for USD, đồng for VND)
    const num = currency === 'VND' ? parseFloat(amount) : parseFloat(amount) / 100;
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (num: string | number) => {
    if (!num) return '—';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    return new Intl.NumberFormat('vi-VN').format(number);
  };

  const formatMetric = (value: string | undefined, suffix = '') => {
    if (!value) return '—';
    const num = parseFloat(value);
    if (isNaN(num)) return '—';
    return `${formatNumber(num)}${suffix}`;
  };

  const getConversions = (actions: any[]) => {
    if (!actions || !Array.isArray(actions)) return 0;
    const conversionActions = ['purchase', 'lead', 'onsite_conversion.purchase', 'onsite_conversion.lead'];
    return actions
      .filter(action => conversionActions.some(type => action.action_type.includes(type)))
      .reduce((sum, action) => sum + parseInt(action.value || '0'), 0);
  };

  const getDatePresetLabel = (preset: string) => {
    const labels: Record<string, string> = {
      'today': 'Today',
      'yesterday': 'Yesterday',
      'last_3d': 'Last 3 Days',
      'last_7d': 'Last 7 Days',
      'last_14d': 'Last 14 Days',
      'last_28d': 'Last 28 Days',
      'last_30d': 'Last 30 Days',
      'last_90d': 'Last 90 Days',
      'this_week_mon_today': 'This Week',
      'last_week_mon_sun': 'Last Week',
      'this_month': 'This Month',
      'last_month': 'Last Month',
      'this_quarter': 'This Quarter',
      'last_quarter': 'Last Quarter',
      'this_year': 'This Year',
      'last_year': 'Last Year'
    };
    return labels[preset] || preset;
  };

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
       
        <CardContent className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20 animate-ping"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading campaigns...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your campaigns</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 lg:p-3">
        
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Campaigns</span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">{campaigns.length}</p>
          </div>
          
          <div className="bg-gray-50/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Active</span>
            </div>
            <p className="text-xl font-bold text-green-600 mt-1">
              {campaigns.filter(c => c.status === 'ACTIVE').length}
            </p>
          </div>
          
          <div className="bg-gray-50/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30">
            <div className="flex items-center space-x-2">
              <Pause className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">Paused</span>
            </div>
            <p className="text-xl font-bold text-yellow-600 mt-1">
              {campaigns.filter(c => c.status === 'PAUSED').length}
            </p>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
      <CardHeader>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Campaigns</h3>
              <Badge variant="outline" className="text-xs">
                {getDatePresetLabel(datePreset)}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-1">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Spend Filter */}
            <Select value={spendFilter} onValueChange={setSpendFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Spend" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Spend</SelectItem>
                <SelectItem value="low">&lt; 100k</SelectItem>
                <SelectItem value="medium">100k - 1M</SelectItem>
                <SelectItem value="high">&gt; 1M</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Date Filter */}
            <Select value={datePreset} onValueChange={handleDatePresetChange} disabled={isLoading}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last_3d">Last 3 Days</SelectItem>
                <SelectItem value="last_7d">Last 7 Days</SelectItem>
                <SelectItem value="last_14d">Last 14 Days</SelectItem>
                <SelectItem value="last_28d">Last 28 Days</SelectItem>
                <SelectItem value="last_30d">Last 30 Days</SelectItem>
                <SelectItem value="last_90d">Last 90 Days</SelectItem>
                <SelectItem value="this_week_mon_today">This Week</SelectItem>
                <SelectItem value="last_week_mon_sun">Last Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_quarter">This Quarter</SelectItem>
                <SelectItem value="last_quarter">Last Quarter</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all' || spendFilter !== 'all' || datePreset !== currentDatePreset) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSpendFilter('all');
                  setDatePreset(currentDatePreset);
                  if (onDatePresetChange) {
                    onDatePresetChange(currentDatePreset);
                  }
                }}
                className="w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
        </div>
      </CardHeader>
      
        <CardContent >
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Activity className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Campaigns Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No campaigns match your search criteria' : 'No campaigns available'}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="rounded-xl"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 lg:space-y-6">
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200/50">
                        <th className="text-left p-4 font-semibold text-gray-700">Campaign</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                        <th className="text-center p-4 font-semibold text-gray-700">Off/On</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Objective</th>
                        <th className="text-right p-4 font-semibold text-gray-700">Spend</th>
                        <th className="text-right p-4 font-semibold text-gray-700">Impressions</th>
                        <th className="text-right p-4 font-semibold text-gray-700">Clicks</th>
                        <th className="text-right p-4 font-semibold text-gray-700">CTR</th>
                        <th className="text-right p-4 font-semibold text-gray-700">CPC</th>
                        <th className="text-right p-4 font-semibold text-gray-700">Conversions</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b border-gray-100/50 hover:bg-gray-50/50 transition-colors duration-200">
                          <td className="p-4">
                            <div>
                              <p className="font-semibold text-gray-900">{campaign.name}</p>
                              <p className="text-sm text-gray-500 font-mono">ID: {campaign.id}</p>
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <CampaignStatusBadge 
                              currentStatus={campaign.effective_status || campaign.status}
                            />
                          </td>
                          
                          <td className="p-4">
                            <div className="flex justify-center">
                              {accessToken && (
                                <CampaignToggle
                                  campaignId={campaign.id}
                                  currentStatus={campaign.effective_status || campaign.status}
                                  accessToken={accessToken}
                                  size="sm"
                                  showLabel={false}
                                  onStatusUpdate={(newStatus) => {
                                    if (onStatusChange) {
                                      onStatusChange(campaign.id, newStatus as 'ACTIVE' | 'PAUSED');
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </td>
                          
                          <td className="p-4">
                            {campaign.objective ? getObjectiveBadge(campaign.objective) : '—'}
                          </td>
                          
                          <td className="p-4 text-right">
                            <span className="font-medium">
                              {campaign.insights?.spend ? formatCurrency(campaign.insights.spend) : '—'}
                            </span>
                          </td>
                          
                          <td className="p-4 text-right">
                            {formatMetric(campaign.insights?.impressions)}
                          </td>
                          
                          <td className="p-4 text-right">
                            {formatMetric(campaign.insights?.clicks)}
                          </td>
                          
                          <td className="p-4 text-right">
                            {formatMetric(campaign.insights?.ctr, '%')}
                          </td>
                          
                          <td className="p-4 text-right">
                            {campaign.insights?.cpc ? formatCurrency(campaign.insights.cpc) : '—'}
                          </td>
                          
                          <td className="p-4 text-right">
                            <span className="font-medium text-green-600">
                              {campaign.insights?.actions ? getConversions(campaign.insights.actions) : '—'}
                            </span>
                          </td>
                          
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewDetails(campaign)}
                                className="hover:bg-blue-50 hover:border-blue-200 rounded-lg"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile/Tablet Cards */}
              <div className="lg:hidden space-y-4">
                {filteredCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{campaign.name}</h4>
                          <p className="text-sm text-gray-500 font-mono">ID: {campaign.id}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <CampaignStatusBadge 
                            currentStatus={campaign.effective_status || campaign.status}
                          />
                          {accessToken && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-600">
                                {campaign.effective_status?.toUpperCase() === 'ACTIVE' ? 'Active' : 'Paused'}
                              </span>
                              <CampaignToggle
                                campaignId={campaign.id}
                                currentStatus={campaign.effective_status || campaign.status}
                                accessToken={accessToken}
                                size="sm"
                                showLabel={false}
                                onStatusUpdate={(newStatus) => {
                                  if (onStatusChange) {
                                    onStatusChange(campaign.id, newStatus as 'ACTIVE' | 'PAUSED');
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {campaign.objective && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 font-medium">Objective:</span>
                            {getObjectiveBadge(campaign.objective)}
                          </div>
                        )}
                        
                        {campaign.insights && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 font-medium">Spend:</span>
                              <span className="text-sm font-semibold">
                                {formatCurrency(campaign.insights.spend)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 font-medium">Impressions:</span>
                              <span className="text-sm">{formatMetric(campaign.insights.impressions)}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 font-medium">Clicks:</span>
                              <span className="text-sm">{formatMetric(campaign.insights.clicks)}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 font-medium">CTR:</span>
                              <span className="text-sm">{formatMetric(campaign.insights.ctr, '%')}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 font-medium">Conversions:</span>
                              <span className="text-sm font-semibold text-green-600">
                                {campaign.insights.actions ? getConversions(campaign.insights.actions) : '0'}
                              </span>
                            </div>
                          </>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 font-medium">Budget:</span>
                          <span className="text-sm font-semibold">
                            {campaign.daily_budget ? 
                              `${formatCurrency(campaign.daily_budget)}/day` : 
                              campaign.lifetime_budget ? 
                              `${formatCurrency(campaign.lifetime_budget)} total` : '—'
                            }
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 font-medium">Start:</span>
                          <span className="text-sm">{formatDate(campaign.start_time || '')}</span>
                        </div>
                        
                        {campaign.stop_time && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 font-medium">End:</span>
                            <span className="text-sm">{formatDate(campaign.stop_time)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200/50">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(campaign)}
                          className="flex-1 bg-blue-50/50 hover:bg-blue-100/50 border-blue-200/50 rounded-xl"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
