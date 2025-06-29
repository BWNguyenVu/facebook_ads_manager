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
  ArrowLeft,
  Calendar,
  DollarSign,
  Target,
  Users,
  RefreshCw,
  Settings
} from 'lucide-react';
import { FacebookAdSet, FacebookCampaign } from '@/types/facebook-campaign';

interface AdSetTableProps {
  adsets: FacebookAdSet[];
  campaign: FacebookCampaign;
  isLoading: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onViewAds?: (adset: FacebookAdSet) => void;
  onStatusChange?: (adsetId: string, newStatus: 'ACTIVE' | 'PAUSED') => void;
  userSession?: any;
}

export function AdSetTable({ 
  adsets, 
  campaign,
  isLoading, 
  onBack, 
  onRefresh,
  onViewAds,
  onStatusChange,
  userSession 
}: AdSetTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredAdSets = adsets.filter(adset =>
    adset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adset.id.includes(searchTerm)
  );

  const getStatusBadge = (status: string, effectiveStatus?: string) => {
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
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </div>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Ad Sets</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2">Loading ad sets...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Info Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaigns
              </Button>
              <div>
                <h2 className="text-xl font-bold">{campaign.name}</h2>
                <p className="text-gray-600">Campaign ID: {campaign.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {campaign.objective && (
                <Badge className="bg-blue-100 text-blue-800">
                  {campaign.objective.replace('OUTCOME_', '')}
                </Badge>
              )}
              {getStatusBadge(campaign.status, campaign.effective_status)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ad Sets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Ad Sets</span>
              <Badge variant="secondary">{filteredAdSets.length}</Badge>
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
                placeholder="Search ad sets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredAdSets.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No ad sets found</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">
                  Try adjusting your search terms
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Ad Set</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Budget</th>
                        <th className="text-left p-4 font-medium">Optimization</th>
                        <th className="text-left p-4 font-medium">Schedule</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdSets.map((adset) => (
                        <tr key={adset.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{adset.name}</p>
                              <p className="text-sm text-gray-500">ID: {adset.id}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(adset.status, adset.effective_status)}
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              {adset.daily_budget ? (
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span className="text-sm">{formatCurrency(adset.daily_budget)}/day</span>
                                </div>
                              ) : adset.lifetime_budget ? (
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span className="text-sm">{formatCurrency(adset.lifetime_budget)} total</span>
                                </div>
                              ) : '—'}
                              {adset.budget_remaining && (
                                <p className="text-xs text-gray-500">
                                  Remaining: {formatCurrency(adset.budget_remaining)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              {adset.optimization_goal && (
                                <Badge variant="outline" className="text-xs">
                                  {adset.optimization_goal}
                                </Badge>
                              )}
                              {adset.bid_strategy && (
                                <p className="text-xs text-gray-500">
                                  {adset.bid_strategy}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-sm">{formatDate(adset.start_time || '')}</span>
                              </div>
                              {adset.end_time && (
                                <p className="text-xs text-gray-500">
                                  End: {formatDate(adset.end_time)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {onViewAds && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onViewAds(adset)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ads
                                </Button>
                              )}
                              {onStatusChange && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onStatusChange(
                                    adset.id, 
                                    adset.effective_status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
                                  )}
                                >
                                  {adset.effective_status === 'ACTIVE' ? (
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

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredAdSets.map((adset) => (
                  <Card key={adset.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{adset.name}</h4>
                          <p className="text-sm text-gray-500">ID: {adset.id}</p>
                        </div>
                        {getStatusBadge(adset.status, adset.effective_status)}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Budget:</span>
                          <span className="text-sm">
                            {adset.daily_budget ? 
                              `${formatCurrency(adset.daily_budget)}/day` : 
                              adset.lifetime_budget ? 
                              `${formatCurrency(adset.lifetime_budget)} total` : '—'
                            }
                          </span>
                        </div>
                        
                        {adset.optimization_goal && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Optimization:</span>
                            <Badge variant="outline" className="text-xs">
                              {adset.optimization_goal}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Start:</span>
                          <span className="text-sm">{formatDate(adset.start_time || '')}</span>
                        </div>
                        
                        {adset.end_time && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">End:</span>
                            <span className="text-sm">{formatDate(adset.end_time)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-4 pt-3 border-t">
                        {onViewAds && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewAds(adset)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Ads
                          </Button>
                        )}
                        {onStatusChange && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onStatusChange(
                              adset.id, 
                              adset.effective_status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
                            )}
                          >
                            {adset.effective_status === 'ACTIVE' ? (
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
