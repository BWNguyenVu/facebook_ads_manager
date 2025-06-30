'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  RefreshCw
} from 'lucide-react';
import { FacebookCampaign } from '@/types/facebook-campaign';

interface CampaignTableProps {
  campaigns: FacebookCampaign[];
  isLoading: boolean;
  onViewDetails: (campaign: FacebookCampaign) => void;
  onRefresh: () => void;
  onStatusChange?: (campaignId: string, newStatus: 'ACTIVE' | 'PAUSED') => void;
  userSession?: any;
}

export function CampaignTable({ 
  campaigns, 
  isLoading, 
  onViewDetails, 
  onRefresh,
  onStatusChange,
  userSession 
}: CampaignTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.id.includes(searchTerm) ||
    campaign.objective?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string, effectiveStatus: string) => {
    const displayStatus = effectiveStatus || status;
    
    switch (displayStatus) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'PAUSED':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'DELETED':
        return <Badge className="bg-red-100 text-red-800">Deleted</Badge>;
      case 'ARCHIVED':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      case 'PENDING_REVIEW':
        return <Badge className="bg-blue-100 text-blue-800">Pending Review</Badge>;
      case 'DISAPPROVED':
        return <Badge className="bg-red-100 text-red-800">Disapproved</Badge>;
      default:
        return <Badge variant="outline">{displayStatus}</Badge>;
    }
  };

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

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span>Campaign Management</span>
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
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Campaign Management
              </h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">
                View and manage your Facebook advertising campaigns
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 lg:gap-4">
            {/* Search */}
            <div className="relative flex-1 lg:flex-none lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50/50 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button 
                onClick={onRefresh} 
                disabled={isLoading} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl px-3 lg:px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Campaigns</span>
            <Badge variant="secondary">{filteredCampaigns.length}</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      
        <CardContent className="p-6">
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
                        <th className="text-left p-4 font-semibold text-gray-700">Objective</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Budget</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Dates</th>
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
                            {getStatusBadge(campaign.status, campaign.effective_status)}
                          </td>
                          <td className="p-4">
                            {campaign.objective ? getObjectiveBadge(campaign.objective) : '—'}
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              {campaign.daily_budget ? (
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-medium">{formatCurrency(campaign.daily_budget)}/day</span>
                                </div>
                              ) : campaign.lifetime_budget ? (
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-medium">{formatCurrency(campaign.lifetime_budget)} total</span>
                                </div>
                              ) : '—'}
                              {campaign.budget_remaining && (
                                <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                  Remaining: {formatCurrency(campaign.budget_remaining)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 text-blue-600" />
                                <span className="text-sm">{formatDate(campaign.start_time || '')}</span>
                              </div>
                              {campaign.stop_time && (
                                <p className="text-xs text-gray-500">
                                  End: {formatDate(campaign.stop_time)}
                                </p>
                              )}
                            </div>
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
                              {onStatusChange && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onStatusChange(
                                    campaign.id, 
                                    campaign.effective_status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
                                  )}
                                  className={`rounded-lg ${
                                    campaign.effective_status === 'ACTIVE' 
                                      ? 'hover:bg-yellow-50 hover:border-yellow-200' 
                                      : 'hover:bg-green-50 hover:border-green-200'
                                  }`}
                                >
                                  {campaign.effective_status === 'ACTIVE' ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
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
                        {getStatusBadge(campaign.status, campaign.effective_status)}
                      </div>
                      
                      <div className="space-y-3">
                        {campaign.objective && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 font-medium">Objective:</span>
                            {getObjectiveBadge(campaign.objective)}
                          </div>
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
                        {onStatusChange && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onStatusChange(
                              campaign.id, 
                              campaign.effective_status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
                            )}
                            className={`rounded-xl ${
                              campaign.effective_status === 'ACTIVE' 
                                ? 'bg-yellow-50/50 hover:bg-yellow-100/50 border-yellow-200/50' 
                                : 'bg-green-50/50 hover:bg-green-100/50 border-green-200/50'
                            }`}
                          >
                            {campaign.effective_status === 'ACTIVE' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        )}
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
