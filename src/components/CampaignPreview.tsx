'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CampaignData } from '@/types/facebook';
import { 
  Eye, 
  Calendar, 
  DollarSign, 
  Users, 
  Target,
  Settings,
  Facebook,
  MapPin,
  Clock,
  Zap
} from 'lucide-react';

interface CampaignPreviewProps {
  campaigns: CampaignData[];
  onEdit?: (index: number) => void;
  onRemove?: (index: number) => void;
}

export function CampaignPreview({ campaigns, onEdit, onRemove }: CampaignPreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getObjectiveBadge = (objective: string) => {
    const colorMap: Record<string, string> = {
      'OUTCOME_ENGAGEMENT': 'bg-blue-100 text-blue-800',
      'OUTCOME_TRAFFIC': 'bg-green-100 text-green-800',
      'OUTCOME_LEADS': 'bg-purple-100 text-purple-800',
      'OUTCOME_SALES': 'bg-orange-100 text-orange-800',
      'OUTCOME_AWARENESS': 'bg-yellow-100 text-yellow-800',
      'OUTCOME_APP_PROMOTION': 'bg-indigo-100 text-indigo-800',
    };
    
    return colorMap[objective] || 'bg-gray-100 text-gray-800';
  };

  if (campaigns.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
        <CardContent className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Eye className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Campaigns to Preview</h3>
            <p className="text-gray-500">Upload a CSV file to see campaign previews here</p>
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
              <Eye className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Campaign Preview
              </h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">
                Review your campaigns before publishing to Facebook
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100/50 text-blue-700 border-blue-200/50 px-4 py-2 rounded-xl font-medium text-sm lg:text-base">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid gap-4 lg:gap-6">{campaigns.map((campaign, index) => (
          <Card key={index} className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
            <CardHeader className="pb-4 lg:pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg lg:text-xl flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <Facebook className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-gray-900">{campaign.name}</span>
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge className={`${getObjectiveBadge(campaign.campaign_objective || '')} text-xs rounded-lg px-3 py-1 font-medium`}>
                      {campaign.campaign_objective?.replace('OUTCOME_', '') || 'ENGAGEMENT'}
                    </Badge>
                    <Badge className="bg-gray-100/50 text-gray-700 border-gray-200/50 text-xs rounded-lg px-3 py-1 font-medium">
                      {campaign.optimization_goal || 'POST_ENGAGEMENT'}
                    </Badge>
                  </div>
                </div>
                
                {(onEdit || onRemove) && (
                  <div className="flex space-x-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(index)}
                        className="hover:bg-blue-50 hover:border-blue-200 rounded-lg"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                    {onRemove && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemove(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 rounded-lg"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 lg:space-y-8">
              {/* Budget & Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div className="flex items-center space-x-4 p-4 lg:p-6 bg-green-50/80 backdrop-blur-sm rounded-2xl border border-green-200/30 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                    <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Daily Budget</p>
                    <p className="text-lg lg:text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                      {formatCurrency(campaign.daily_budget)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 lg:p-6 bg-blue-50/80 backdrop-blur-sm rounded-2xl border border-blue-200/30 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Duration</p>
                    <p className="text-sm lg:text-base font-semibold text-blue-700">
                      {campaign.end_time 
                        ? `${formatDate(campaign.start_time)} - ${formatDate(campaign.end_time)}`
                        : `From ${formatDate(campaign.start_time)}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Targeting */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                <div className="flex items-center space-x-4 p-4 lg:p-6 bg-purple-50/80 backdrop-blur-sm rounded-2xl border border-purple-200/30 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <Users className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Age Range</p>
                    <p className="text-sm lg:text-base font-bold text-purple-700">
                      {campaign.age_min} - {campaign.age_max} years
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 lg:p-6 bg-orange-50/80 backdrop-blur-sm rounded-2xl border border-orange-200/30 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <MapPin className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Location</p>
                    <p className="text-sm lg:text-base font-bold text-orange-700">Vietnam</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 lg:p-6 bg-indigo-50/80 backdrop-blur-sm rounded-2xl border border-indigo-200/30 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                    <Target className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Bid Strategy</p>
                    <p className="text-sm lg:text-base font-bold text-indigo-700">
                      {campaign.bid_strategy?.replace('LOWEST_COST_', '') || 'AUTO'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Information */}
              <div className="border-t border-gray-200/50 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <Facebook className="h-4 w-4 mr-2" />
                  Post Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/30">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Page ID</p>
                    <p className="font-mono text-sm bg-white px-3 py-2 rounded-lg border">
                      {campaign.page_id}
                    </p>
                  </div>
                  <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/30">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Post ID</p>
                    <p className="font-mono text-sm bg-white px-3 py-2 rounded-lg border">
                      {campaign.post_id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="border-t border-gray-200/50 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Advanced Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/30">
                    <span className="text-xs text-gray-500 font-medium">Billing Event</span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{campaign.billing_event || 'IMPRESSIONS'}</p>
                  </div>
                  <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/30">
                    <span className="text-xs text-gray-500 font-medium">Destination</span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{campaign.destination_type || 'ON_POST'}</p>
                  </div>
                  {campaign.account_id && (
                    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/30 md:col-span-2">
                      <span className="text-xs text-gray-500 font-medium">Account ID</span>
                      <p className="font-mono text-sm text-gray-900 mt-1 break-all">{campaign.account_id}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
        <CardContent className="p-6 lg:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg mr-3">
              <Target className="h-5 w-5 text-white" />
            </div>
            Campaign Summary
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center bg-blue-50/50 rounded-2xl p-4 lg:p-6 border border-blue-200/30">
              <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {campaigns.length}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-2">Total Campaigns</p>
            </div>
            <div className="text-center bg-green-50/50 rounded-2xl p-4 lg:p-6 border border-green-200/30">
              <p className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                {formatCurrency(campaigns.reduce((sum, c) => sum + c.daily_budget, 0))}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-2">Total Daily Budget</p>
            </div>
            <div className="text-center bg-purple-50/50 rounded-2xl p-4 lg:p-6 border border-purple-200/30">
              <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {Math.min(...campaigns.map(c => c.age_min))} - {Math.max(...campaigns.map(c => c.age_max))}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-2">Age Range</p>
            </div>
            <div className="text-center bg-orange-50/50 rounded-2xl p-4 lg:p-6 border border-orange-200/30">
              <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">{[...new Set(campaigns.map(c => c.campaign_objective))].length}</p>
              <p className="text-sm text-gray-600 font-medium mt-2">Unique Objectives</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
