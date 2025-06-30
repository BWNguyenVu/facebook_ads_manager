'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CampaignStatusButtonProps {
  campaignId: string;
  currentStatus: 'ACTIVE' | 'PAUSED' | string;
  accessToken: string;
  onStatusUpdate?: (newStatus: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function CampaignStatusButton({
  campaignId,
  currentStatus,
  accessToken,
  onStatusUpdate,
  disabled = false,
  size = 'sm'
}: CampaignStatusButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>('');
  const [localStatus, setLocalStatus] = useState(currentStatus);

  const getStatusInfo = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return {
          label: 'Active',
          color: 'bg-green-100 text-green-800',
          icon: Play,
          action: 'PAUSED',
          actionLabel: 'Pause',
          actionIcon: Pause,
          actionColor: 'border-orange-300 text-orange-700 hover:bg-orange-100'
        };
      case 'PAUSED':
        return {
          label: 'Paused',
          color: 'bg-orange-100 text-orange-800',
          icon: Pause,
          action: 'ACTIVE',
          actionLabel: 'Activate',
          actionIcon: Play,
          actionColor: 'border-green-300 text-green-700 hover:bg-green-100'
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800',
          icon: AlertTriangle,
          action: '',
          actionLabel: '',
          actionIcon: AlertTriangle,
          actionColor: 'border-gray-300 text-gray-700 hover:bg-gray-100'
        };
    }
  };

  const statusInfo = getStatusInfo(localStatus);

  const updateStatus = async () => {
    if (!statusInfo.action || disabled) return;

    setIsUpdating(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/facebook/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: statusInfo.action,
          accessToken: accessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update campaign status');
      }

      const result = await response.json();
      
      // Update local status
      setLocalStatus(statusInfo.action);
      
      // Notify parent component
      if (onStatusUpdate) {
        onStatusUpdate(statusInfo.action);
      }

      console.log('Campaign status updated successfully:', result);

    } catch (error: any) {
      console.error('Error updating campaign status:', error);
      setError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const ActionIcon = statusInfo.actionIcon;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {/* Current Status Badge */}
        <Badge className={statusInfo.color}>
          <span>{statusInfo.label}</span>
        </Badge>

        {/* Action Button */}
        {statusInfo.action && (
          <Button
            size={size}
            variant="outline"
            className={statusInfo.actionColor}
            onClick={updateStatus}
            disabled={disabled || isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <ActionIcon className="h-4 w-4 mr-1" />
                {statusInfo.actionLabel}
              </>
            )}
          </Button>
        )}
      </div>

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

// Component that only shows the action button (for Actions column)
export function CampaignActionButton({
  campaignId,
  currentStatus,
  accessToken,
  onStatusUpdate,
  disabled = false,
  size = 'sm'
}: CampaignStatusButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>('');
  const [localStatus, setLocalStatus] = useState(currentStatus);

  const getStatusInfo = (status: string) => {
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

  const statusInfo = getStatusInfo(localStatus);

  const updateStatus = async () => {
    if (!statusInfo.action || disabled) return;

    setIsUpdating(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/facebook/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: statusInfo.action,
          accessToken: accessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update campaign status');
      }

      const result = await response.json();
      
      // Update local status
      setLocalStatus(statusInfo.action);
      
      // Notify parent component
      if (onStatusUpdate) {
        onStatusUpdate(statusInfo.action);
      }

      console.log('Campaign status updated successfully:', result);

    } catch (error: any) {
      console.error('Error updating campaign status:', error);
      setError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const ActionIcon = statusInfo.actionIcon;

  return (
    <div className="space-y-2">
      {/* Only Action Button */}
      {statusInfo.action && (
        <Button
          size={size}
          variant="outline"
          className={statusInfo.actionColor}
          onClick={updateStatus}
          disabled={disabled || isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <ActionIcon className="h-4 w-4 mr-1" />
              {statusInfo.actionLabel}
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

// Utility component for just showing status without update functionality
export function CampaignStatusBadge({ 
  status, 
  size = 'sm' 
}: { 
  status: string; 
  size?: 'sm' | 'default' | 'lg';
}) {
  const getStatusInfo = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return {
          label: 'Active',
          color: 'bg-green-100 text-green-800',
          icon: Play
        };
      case 'PAUSED':
        return {
          label: 'Paused',
          color: 'bg-orange-100 text-orange-800',
          icon: Pause
        };
      case 'PENDING_REVIEW':
        return {
          label: 'Pending Review',
          color: 'bg-yellow-100 text-yellow-800',
          icon: AlertTriangle
        };
      case 'DISAPPROVED':
        return {
          label: 'Disapproved',
          color: 'bg-red-100 text-red-800',
          icon: XCircle
        };
      case 'APPROVED':
        return {
          label: 'Approved',
          color: 'bg-blue-100 text-blue-800',
          icon: CheckCircle
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800',
          icon: AlertTriangle
        };
    }
  };

  const statusInfo = getStatusInfo(status);
  const StatusIcon = statusInfo.icon;

  return (
    <Badge className={statusInfo.color}>
      <span>{statusInfo.label}</span>
    </Badge>
  );
}
