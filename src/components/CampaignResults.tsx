'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface CampaignResult {
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

interface CampaignResultsProps {
  results: CampaignResult[];
  onClear?: () => void;
}

export function CampaignResults({ results, onClear }: CampaignResultsProps) {
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const pendingCount = results.filter(r => r.status === 'pending').length;

  if (results.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Campaign Creation Results</span>
            </CardTitle>
            <CardDescription>
              {successCount} successful, {errorCount} failed, {pendingCount} pending
            </CardDescription>
          </div>
          {onClear && (
            <Button variant="outline" size="sm" onClick={onClear}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <div className="text-sm text-green-700">Successful</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-red-700">Failed</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-yellow-700">Pending</div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-3">
          {results.map((result, index) => (
            <div 
              key={index}
              className={`
                p-4 rounded-lg border-l-4 
                ${result.status === 'success' 
                  ? 'bg-green-50 border-green-400' 
                  : result.status === 'error'
                  ? 'bg-red-50 border-red-400'
                  : 'bg-yellow-50 border-yellow-400'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {result.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {result.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    {result.status === 'pending' && (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className="font-medium">{result.name}</span>
                    <Badge 
                      variant={
                        result.status === 'success' 
                          ? 'default' 
                          : result.status === 'error' 
                          ? 'destructive' 
                          : 'secondary'
                      }
                    >
                      {result.status}
                    </Badge>
                  </div>

                  {result.status === 'success' && result.facebook_ids && (
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      {result.facebook_ids.campaign_id && (
                        <div>Campaign: <code className="text-xs">{result.facebook_ids.campaign_id}</code></div>
                      )}
                      {result.facebook_ids.adset_id && (
                        <div>AdSet: <code className="text-xs">{result.facebook_ids.adset_id}</code></div>
                      )}
                      {result.facebook_ids.creative_id && (
                        <div>Creative: <code className="text-xs">{result.facebook_ids.creative_id}</code></div>
                      )}
                      {result.facebook_ids.ad_id && (
                        <div>Ad: <code className="text-xs">{result.facebook_ids.ad_id}</code></div>
                      )}
                    </div>
                  )}

                  {result.status === 'error' && result.error && (
                    <div className="mt-2 p-3 bg-red-100 rounded text-sm text-red-800">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
