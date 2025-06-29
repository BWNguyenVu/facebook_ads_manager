'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ScrollText, 
  Search, 
  Filter, 
  Download,
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Calendar,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface CampaignLog {
  _id: string;
  name: string;
  status: 'pending' | 'success' | 'error';
  account_id: string;
  user_id: string;
  facebook_ids?: {
    campaign_id?: string;
    adset_id?: string;
    creative_id?: string;
    ad_id?: string;
  };
  error_message?: string;
  created_at: string;
  updated_at: string;
}

interface CampaignLogsProps {
  userSession?: any;
}

export function CampaignLogs({ userSession }: CampaignLogsProps) {
  const [logs, setLogs] = useState<CampaignLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<CampaignLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, [userSession]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, statusFilter, accountFilter]);

  const loadLogs = async () => {
    if (!userSession?.user_id) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/mongodb/logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.facebook_ids?.campaign_id?.includes(searchTerm) ||
        log.account_id.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Account filter
    if (accountFilter !== 'all') {
      filtered = filtered.filter(log => log.account_id === accountFilter);
    }

    setFilteredLogs(filtered);
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
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getUniqueAccounts = () => {
    return Array.from(new Set(logs.map(log => log.account_id)));
  };

  const exportLogs = () => {
    const csvContent = [
      ['Name', 'Status', 'Account ID', 'Campaign ID', 'Error', 'Created At'].join(','),
      ...filteredLogs.map(log => [
        log.name,
        log.status,
        log.account_id,
        log.facebook_ids?.campaign_id || '',
        log.error_message || '',
        log.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ScrollText className="h-5 w-5" />
            <span>Campaign Logs</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2">Loading logs...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ScrollText className="h-5 w-5" />
              <span>Campaign Logs</span>
              <Badge variant="secondary">{filteredLogs.length} of {logs.length}</Badge>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={loadLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Account</label>
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {getUniqueAccounts().map(account => (
                    <SelectItem key={account} value={account}>
                      {account.substring(0, 10)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button variant="outline" className="w-full" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setAccountFilter('all');
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Logs List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {logs.length === 0 ? 'No campaign logs found' : 'No logs match your filters'}
              </div>
            ) : (
              filteredLogs.map((log) => (
                <Card key={log._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(log.status)}
                          <h4 className="font-medium">{log.name}</h4>
                          {getStatusBadge(log.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Account:</span>
                            <span className="ml-1 font-mono">{log.account_id.substring(0, 16)}...</span>
                          </div>
                          <div>
                            <span className="font-medium">Created:</span>
                            <span className="ml-1">{formatDate(log.created_at)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Updated:</span>
                            <span className="ml-1">{formatDate(log.updated_at)}</span>
                          </div>
                        </div>

                        {/* Facebook IDs */}
                        {log.facebook_ids && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">Facebook IDs:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                              {log.facebook_ids.campaign_id && (
                                <div className="bg-blue-50 px-2 py-1 rounded">
                                  <span className="font-medium">Campaign:</span>
                                  <span className="ml-1 font-mono">{log.facebook_ids.campaign_id}</span>
                                </div>
                              )}
                              {log.facebook_ids.adset_id && (
                                <div className="bg-green-50 px-2 py-1 rounded">
                                  <span className="font-medium">AdSet:</span>
                                  <span className="ml-1 font-mono">{log.facebook_ids.adset_id}</span>
                                </div>
                              )}
                              {log.facebook_ids.creative_id && (
                                <div className="bg-purple-50 px-2 py-1 rounded">
                                  <span className="font-medium">Creative:</span>
                                  <span className="ml-1 font-mono">{log.facebook_ids.creative_id}</span>
                                </div>
                              )}
                              {log.facebook_ids.ad_id && (
                                <div className="bg-orange-50 px-2 py-1 rounded">
                                  <span className="font-medium">Ad:</span>
                                  <span className="ml-1 font-mono">{log.facebook_ids.ad_id}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Error Message */}
                        {log.error_message && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-800">
                              <strong>Error:</strong> {log.error_message}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 ml-4">
                        {log.facebook_ids?.campaign_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`https://business.facebook.com/adsmanager/manage/campaigns/detail?campaign_id=${log.facebook_ids?.campaign_id}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
