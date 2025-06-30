'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Loader2,
  XCircle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CampaignActionButtonProps {
  campaignId: string;
  currentStatus: 'ACTIVE' | 'PAUSED' | string;
  accessToken: string;
  onStatusUpdate?: (newStatus: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function CampaignActionButton({
  campaignId,
  currentStatus,
  accessToken,
  onStatusUpdate,
  disabled = false,
  size = 'sm'
}: CampaignActionButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [localStatus, setLocalStatus] = useState(currentStatus);

  const getActionInfo = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return {
          action: 'PAUSED',
          actionLabel: 'Pause',
          actionIcon: Pause,
          actionColor: 'border-orange-300 text-orange-700 hover:bg-orange-100'
        };
      case 'PAUSED':
        return {
          action: 'ACTIVE',
          actionLabel: 'Activate',
          actionIcon: Play,
          actionColor: 'border-green-300 text-green-700 hover:bg-green-100'
        };
      default:
        return {
          action: '',
          actionLabel: '',
          actionIcon: AlertTriangle,
          actionColor: 'border-gray-300 text-gray-700 hover:bg-gray-100'
        };
    }
  };

  const actionInfo = getActionInfo(localStatus);

  const updateStatus = async () => {
    if (!actionInfo.action || disabled) return;

    setIsUpdating(true);
    setError('');
    setSuccess('');

    // Optimistic update - cập nhật UI ngay lập tức
    const previousStatus = localStatus;
    setLocalStatus(actionInfo.action);
    
    // Notify parent component ngay lập tức
    if (onStatusUpdate) {
      onStatusUpdate(actionInfo.action);
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
          status: actionInfo.action,
          accessToken: accessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update campaign status');
      }

      const result = await response.json();
      console.log('Campaign status updated successfully:', result);
      
      // Show success message
      setSuccess(`Campaign ${actionInfo.action.toLowerCase()} successfully!`);
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

  const ActionIcon = actionInfo.actionIcon;

  return (
    <div className="space-y-2">
      {/* Action Button */}
      {actionInfo.action && (
        <Button
          size={size}
          variant="outline"
          className={actionInfo.actionColor}
          onClick={updateStatus}
          disabled={disabled || isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              
              <div className="w-16">
                Updating...
              </div>
            </>
          ) : (
            <>
              <ActionIcon className="h-4 w-4 mr-1" />
              <div className="w-16">
                {actionInfo.actionLabel}
              </div>
            </>
          )}
        </Button>
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
