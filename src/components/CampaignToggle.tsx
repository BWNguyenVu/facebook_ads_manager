'use client';

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CampaignToggleProps {
  campaignId: string;
  currentStatus: 'ACTIVE' | 'PAUSED' | string;
  accessToken: string;
  onStatusUpdate?: (newStatus: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
}

export function CampaignToggle({
  campaignId,
  currentStatus,
  accessToken,
  onStatusUpdate,
  disabled = false,
  size = 'sm',
  showLabel = true
}: CampaignToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [localStatus, setLocalStatus] = useState(currentStatus);

  const isActive = localStatus.toUpperCase() === 'ACTIVE';
  const isToggleable = ['ACTIVE', 'PAUSED'].includes(localStatus.toUpperCase());

  const updateStatus = async (newStatus: string) => {
    if (disabled || !isToggleable) return;

    setIsUpdating(true);
    setError('');
    setSuccess('');

    // Optimistic update - cập nhật UI ngay lập tức
    const previousStatus = localStatus;
    setLocalStatus(newStatus);
    
    // Notify parent component ngay lập tức
    if (onStatusUpdate) {
      onStatusUpdate(newStatus);
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/facebook/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          accessToken: accessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update campaign status');
      }

      const result = await response.json();
      console.log('Campaign status updated successfully:', result);
  
      setTimeout(() => setSuccess(''), 3000);

    } catch (error: any) {
      console.error('Error updating campaign status:', error);
      setError(error.message);
      
      // Rollback optimistic update nếu có lỗi
      setLocalStatus(previousStatus);
      if (onStatusUpdate) {
        onStatusUpdate(previousStatus);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggle = (checked: boolean) => {
    const newStatus = checked ? 'ACTIVE' : 'PAUSED';
    updateStatus(newStatus);
  };

  if (!isToggleable) {
    // For non-toggleable statuses, just show a badge
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="text-xs">
          {localStatus}
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {/* Toggle Switch */}
        <div className="relative">
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={disabled || isUpdating}
            size={size}
          />
          {isUpdating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-3 w-3 animate-spin text-gray-600" />
            </div>
          )}
        </div>
        
        {/* Status Label */}
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {isUpdating ? (
              <div className="flex items-center space-x-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              isActive ? 'Active' : 'Paused'
            )}
          </span>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="text-xs border-green-200 bg-green-50">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="text-xs">
          <XCircle className="h-3 w-3" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
